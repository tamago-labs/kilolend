const express = require('express');
const https = require('https');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const net = require('net');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

require('dotenv').config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'kilolend-execution-agent' },
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// HTTPS Configuration
let httpsOptions = null;
if (USE_HTTPS) {
  try {
    const certPath = process.env.CERT_PATH || './cert';
    httpsOptions = {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    };
    logger.info('HTTPS certificates loaded successfully');
  } catch (error) {
    logger.error('Failed to load HTTPS certificates:', error);
    logger.warn('Falling back to HTTP mode');
  }
}

// Security middleware
app.use(helmet({
  hsts: USE_HTTPS ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://kilolend.xyz'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));


// API Key authentication
const API_KEY = process.env.API_KEY || 'kilolend-secure-api-key-2024';

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== API_KEY) {
    logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }

  next();
};

// Enclave management state
let enclaveId = null;
let isEnclaveReady = false;
let enclaveWalletAddress = null;

// In-memory execution tracking
const executionRequests = new Map();

// ===================================
// vsock Communication Functions
// ===================================

function createVsockConnection() {
  return new Promise((resolve, reject) => {
    // For development/testing, we'll simulate vsock with TCP
    // In actual Nitro Enclave, this would use vsock
    const socket = new net.Socket();

    socket.on('connect', () => {
      resolve(socket);
    });

    socket.on('error', (error) => {
      reject(error);
    });

    socket.setTimeout(10000);
    // Connect to enclave (in real deployment, this uses vsock CID 16)
    socket.connect(5000, 'localhost');
  });
}

async function communicateWithEnclave(requestId, executionData) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`Communicating with enclave for request: ${requestId}`);

      const socket = await createVsockConnection();
      let responseData = '';

      const request = {
        type: 'EXECUTE_TRANSACTION',
        requestId: requestId,
        data: executionData,
      };

      socket.on('data', (data) => {
        responseData += data.toString();

        if (responseData.includes('\n')) {
          try {
            const response = JSON.parse(responseData.trim());
            socket.destroy();
            resolve(response);
          } catch (error) {
            socket.destroy();
            reject(new Error('Invalid response from enclave'));
          }
        }
      });

      socket.on('error', (error) => {
        reject(new Error(`Enclave communication failed: ${error.message}`));
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Enclave communication timeout'));
      });

      socket.write(JSON.stringify(request) + '\n');

    } catch (error) {
      reject(error);
    }
  });
}

async function testEnclaveConnectivity() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('Testing enclave connectivity...');

      const socket = await createVsockConnection();

      const healthCheck = {
        type: 'HEALTH_CHECK',
        requestId: uuidv4(),
      };

      socket.on('data', (data) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.walletAddress) {
            enclaveWalletAddress = response.walletAddress;
            logger.info(`Enclave wallet address: ${enclaveWalletAddress}`);
          }
          isEnclaveReady = true;
          socket.destroy();
          resolve();
        } catch (error) {
          logger.error('Invalid health check response:', error);
          socket.destroy();
          reject(error);
        }
      });

      socket.on('error', (error) => {
        logger.error('Enclave connectivity test failed:', error);
        reject(error);
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Enclave connectivity timeout'));
      });

      socket.write(JSON.stringify(healthCheck) + '\n');

    } catch (error) {
      reject(error);
    }
  });
}

// ===================================
// Enclave Management
// ===================================

async function startNitroEnclave() {
  try {
    const eifPath = path.join(__dirname, 'kilolend-enclave.eif');

    if (!fs.existsSync(eifPath)) {
      throw new Error(`Enclave image not found: ${eifPath}. Run 'npm run build-enclave' first.`);
    }

    logger.info('Starting Nitro Enclave with 2048MB memory...');

    const command = `nitro-cli run-enclave --cpu-count 2 --memory 2048 --enclave-cid 16 --eif-path ${eifPath} --debug-mode`;
    const output = execSync(command, { encoding: 'utf8', timeout: 60000 });

    const result = JSON.parse(output);
    enclaveId = result.EnclaveID;

    logger.info(`Enclave started successfully with 2048MB: ${enclaveId}`);

    // Wait for enclave to initialize
    await new Promise(resolve => setTimeout(resolve, 20000));

  } catch (error) {
    logger.error('Error starting enclave:', error);
    throw error;
  }
}

async function checkEnclaveStatus() {
  try {
    const output = execSync('nitro-cli describe-enclaves', {
      encoding: 'utf8',
      timeout: 10000
    });

    if (!output.trim()) {
      return { isRunning: false, enclaveId: null };
    }

    const enclaves = JSON.parse(output);
    const runningEnclave = enclaves.find(e => e.State === 'RUNNING');

    if (runningEnclave) {
      enclaveId = runningEnclave.EnclaveID;
      return { isRunning: true, enclaveId };
    }

    return { isRunning: false, enclaveId: null };

  } catch (error) {
    logger.error('Error checking enclave status:', error);
    return { isRunning: false, enclaveId: null };
  }
}

async function ensureEnclaveRunning() {
  try {
    const status = await checkEnclaveStatus();

    if (status.isRunning && isEnclaveReady) {
      return status;
    }

    if (!status.isRunning) {
      logger.info('Starting Nitro Enclave...');
      await startNitroEnclave();
      await new Promise(resolve => setTimeout(resolve, 15000));
    }

    await testEnclaveConnectivity();
    return await checkEnclaveStatus();

  } catch (error) {
    logger.error('Error ensuring enclave is running:', error);
    throw error;
  }
}

// ===================================
// API Endpoints
// ===================================

app.get('/health', async (req, res) => {
  try {
    const enclaveStatus = await checkEnclaveStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      https: USE_HTTPS && httpsOptions !== null,
      enclave: {
        isRunning: enclaveStatus.isRunning,
        enclaveId: enclaveId,
        isReady: isEnclaveReady,
        walletAddress: enclaveWalletAddress,
        memory: '2048MB'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: {
        pending: Array.from(executionRequests.values()).filter(r => r.status === 'pending').length,
        completed: Array.from(executionRequests.values()).filter(r => r.status === 'completed').length,
        failed: Array.from(executionRequests.values()).filter(r => r.status === 'failed').length,
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

app.post('/execute', authenticateApiKey, async (req, res) => {
  const requestId = uuidv4();

  try {
    const { userAddress, action, asset, amount, maxGasPrice } = req.body;

    logger.info(`New execution request ${requestId}: ${action} ${amount} ${asset} for ${userAddress}`);

    const validation = validateExecutionRequest({ userAddress, action, asset, amount });
    if (!validation.isValid) {
      logger.warn(`Invalid request ${requestId}: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    const enclaveStatus = await ensureEnclaveRunning();
    if (!enclaveStatus.isRunning || !isEnclaveReady) {
      logger.error(`Enclave not ready for request ${requestId}`);
      return res.status(503).json({
        error: 'Execution service unavailable',
        details: 'Nitro Enclave is not ready'
      });
    }

    const request = {
      requestId,
      userAddress,
      action,
      asset,
      amount,
      maxGasPrice: maxGasPrice || '50',
      status: 'pending',
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    executionRequests.set(requestId, request);
    processExecutionAsync(requestId, request);

    res.json({
      requestId,
      status: 'pending',
      message: 'Transaction submitted for secure execution',
      estimatedTime: '30-60 seconds',
      checkStatusUrl: `/execute/${requestId}`,
    });

  } catch (error) {
    logger.error(`Execution error for request ${requestId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

app.get('/execute/:requestId', authenticateApiKey, (req, res) => {
  try {
    const { requestId } = req.params;
    const request = executionRequests.get(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const elapsedSeconds = Math.floor((new Date() - new Date(request.createdAt)) / 1000);

    res.json({
      ...request,
      elapsedSeconds,
    });
  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

async function processExecutionAsync(requestId, request) {
  try {
    logger.info(`Processing execution ${requestId} in enclave`);

    request.status = 'processing';
    request.processingStartedAt = new Date().toISOString();

    const enclaveResponse = await communicateWithEnclave(requestId, {
      userAddress: request.userAddress,
      action: request.action,
      asset: request.asset,
      amount: request.amount,
      maxGasPrice: request.maxGasPrice,
    });

    if (enclaveResponse.success) {
      request.status = 'completed';
      request.transactionHash = enclaveResponse.transactionHash;
      request.gasUsed = enclaveResponse.gasUsed;
      request.blockNumber = enclaveResponse.blockNumber;
      request.completedAt = new Date().toISOString();

      logger.info(`Execution ${requestId} completed successfully: ${request.transactionHash}`);
    } else {
      request.status = 'failed';
      request.error = enclaveResponse.error;
      request.failedAt = new Date().toISOString();

      logger.error(`Execution ${requestId} failed: ${request.error}`);
    }

  } catch (error) {
    logger.error(`Execution processing error for ${requestId}:`, error);

    const request = executionRequests.get(requestId);
    if (request) {
      request.status = 'failed';
      request.error = error.message;
      request.failedAt = new Date().toISOString();

      if (request.retries < 3) {
        request.retries++;
        logger.info(`Retrying execution ${requestId} (attempt ${request.retries})`);
        setTimeout(() => processExecutionAsync(requestId, request), 10000);
      }
    }
  }
}

function validateExecutionRequest({ userAddress, action, asset, amount }) {
  if (!userAddress || !action || !asset || !amount) {
    return { isValid: false, error: 'Missing required fields: userAddress, action, asset, amount' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return { isValid: false, error: 'Invalid userAddress format' };
  }

  const validActions = ['supply', 'withdraw', 'borrow', 'repay'];
  if (!validActions.includes(action)) {
    return { isValid: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` };
  }

  const validAssets = ['USDT', 'MBX', 'BORA', 'SIX', 'KAIA'];
  if (!validAssets.includes(asset)) {
    return { isValid: false, error: `Invalid asset. Must be one of: ${validAssets.join(', ')}` };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { isValid: false, error: 'Invalid amount. Must be a positive number' };
  }

  return { isValid: true };
}

// ===================================
// Server Startup
// ===================================

async function startServer() {
  try {
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs');
    }

    logger.info('Starting KiloLend Execution Agent...');
    logger.info(`HTTPS enabled: ${USE_HTTPS && httpsOptions !== null}`);

    if (USE_HTTPS && httpsOptions) {
      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.listen(HTTPS_PORT, () => {
        logger.info(`HTTPS Server running on port ${HTTPS_PORT}`);
      });
    }

    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      logger.info(`HTTP Server running on port ${PORT}`);
    });

    try {
      await ensureEnclaveRunning();
      logger.info('Nitro Enclave is ready for transactions');
      logger.info(`Enclave wallet address: ${enclaveWalletAddress}`);
    } catch (error) {
      logger.error('Failed to initialize enclave:', error);
      logger.warn('Server running without enclave');
    }

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  if (enclaveId) {
    try {
      execSync(`nitro-cli terminate-enclave --enclave-id ${enclaveId}`);
    } catch (error) {
      logger.error('Error terminating enclave:', error);
    }
  }
  process.exit(0);
});

startServer();