const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { v4: uuidv4 } = require('uuid');
const net = require('net');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

require('dotenv').config();

// Configure logging
const logger = winston.createLogger({
  level: 'info',
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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://kilolend.finance'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many requests' });
  }
});

// API Key authentication
const API_KEY = process.env.API_KEY;

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
let enclaveSocket = null;
let isEnclaveReady = false;
let enclaveWalletAddress = null;

// In-memory execution tracking (use Redis/DB for production)
const executionRequests = new Map();

// ===================================
// API Endpoints
// ===================================

// Health check
app.get('/health', async (req, res) => {
  try {
    const enclaveStatus = await checkEnclaveStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      enclave: {
        isRunning: enclaveStatus.isRunning,
        enclaveId: enclaveId,
        isReady: isEnclaveReady,
        walletAddress: enclaveWalletAddress,
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

// Execute transaction
app.post('/execute', authenticateApiKey, async (req, res) => {
  const requestId = uuidv4();
  
  try {
    const { userAddress, action, asset, amount, maxGasPrice } = req.body;
    
    logger.info(`New execution request ${requestId}: ${action} ${amount} ${asset} for ${userAddress}`);
    
    // Validate request
    const validation = validateExecutionRequest({ userAddress, action, asset, amount });
    if (!validation.isValid) {
      logger.warn(`Invalid request ${requestId}: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    // Check enclave status
    const enclaveStatus = await ensureEnclaveRunning();
    if (!enclaveStatus.isRunning || !isEnclaveReady) {
      logger.error(`Enclave not ready for request ${requestId}`);
      return res.status(503).json({
        error: 'Execution service unavailable',
        details: 'Nitro Enclave is not ready'
      });
    }
    
    // Store request
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

    // Send to enclave (async processing)
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

// Get execution status
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

// List recent executions
app.get('/executions', authenticateApiKey, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const executions = Array.from(executionRequests.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(req => ({
        ...req,
        // Remove sensitive data
        userAddress: req.userAddress.slice(0, 6) + '...' + req.userAddress.slice(-4),
      }));
    
    res.json({
      executions,
      total: executionRequests.size,
    });
  } catch (error) {
    logger.error('Executions list error:', error);
    res.status(500).json({ error: 'Failed to list executions' });
  }
});

// Enclave control endpoints (admin only)
app.post('/admin/enclave/restart', authenticateApiKey, async (req, res) => {
  try {
    logger.info('Admin requested enclave restart');
    await stopEnclave();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await ensureEnclaveRunning();
    
    res.json({ message: 'Enclave restarted successfully' });
  } catch (error) {
    logger.error('Enclave restart error:', error);
    res.status(500).json({ error: 'Failed to restart enclave' });
  }
});

// ===================================
// Async Execution Processing
// ===================================

async function processExecutionAsync(requestId, request) {
  try {
    logger.info(`Processing execution ${requestId} in enclave`);
    
    // Update status to processing
    request.status = 'processing';
    request.processingStartedAt = new Date().toISOString();
    
    // Send to enclave
    const enclaveResponse = await communicateWithEnclave(requestId, {
      userAddress: request.userAddress,
      action: request.action,
      asset: request.asset,
      amount: request.amount,
      maxGasPrice: request.maxGasPrice,
    });

    // Update request with result
    if (enclaveResponse.success) {
      request.status = 'completed';
      request.transactionHash = enclaveResponse.transaction_hash;
      request.gasUsed = enclaveResponse.gas_used;
      request.blockNumber = enclaveResponse.block_number;
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
      
      // Retry logic
      if (request.retries < 3) {
        request.retries++;
        logger.info(`Retrying execution ${requestId} (attempt ${request.retries})`);
        setTimeout(() => processExecutionAsync(requestId, request), 10000);
      }
    }
  }
}

// ===================================
// Enclave Management Functions
// ===================================

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
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for startup
    }
    
    await testEnclaveConnectivity();
    return await checkEnclaveStatus();
    
  } catch (error) {
    logger.error('Error ensuring enclave is running:', error);
    throw error;
  }
}

async function startNitroEnclave() {
  try {
    const eifPath = path.join(__dirname, 'kilolend-enclave.eif');
    
    if (!fs.existsSync(eifPath)) {
      throw new Error(`Enclave image not found: ${eifPath}. Run 'npm run build-enclave' first.`);
    }
    
    logger.info('Starting Nitro Enclave with image:', eifPath);
    
    const command = `nitro-cli run-enclave --cpu-count 2 --memory 1024 --enclave-cid 16 --eif-path ${eifPath} --debug-mode`;
    const output = execSync(command, { encoding: 'utf8', timeout: 60000 });
    
    const result = JSON.parse(output);
    enclaveId = result.EnclaveID;
    
    logger.info(`Enclave started successfully: ${enclaveId}`);
    
    // Wait a bit more for enclave to fully initialize
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    logger.error('Error starting enclave:', error);
    throw error;
  }
}

async function stopEnclave() {
  try {
    if (enclaveId) {
      logger.info(`Stopping enclave: ${enclaveId}`);
      execSync(`nitro-cli terminate-enclave --enclave-id ${enclaveId}`, { timeout: 30000 });
      enclaveId = null;
      isEnclaveReady = false;
      enclaveWalletAddress = null;
      logger.info('Enclave stopped successfully');
    }
  } catch (error) {
    logger.error('Error stopping enclave:', error);
    throw error;
  }
}

async function testEnclaveConnectivity() {
  return new Promise((resolve, reject) => {
    logger.info('Testing enclave connectivity...');
    
    const socket = new net.Socket();
    socket.setTimeout(10000);
    
    socket.on('connect', () => {
      logger.info('Enclave connectivity test passed');
      
      // Send health check to get wallet address
      const healthCheck = {
        message_type: 'HEALTH_CHECK',
        request_id: uuidv4(),
        data: {}
      };
      
      socket.write(JSON.stringify(healthCheck) + '\n');
    });
    
    socket.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        if (response.wallet_address) {
          enclaveWalletAddress = response.wallet_address;
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
    
    // Connect to enclave via vsock simulation (port 5000)
    socket.connect(5000, 'localhost');
  });
}

async function communicateWithEnclave(requestId, executionData) {
  return new Promise((resolve, reject) => {
    logger.info(`Communicating with enclave for request: ${requestId}`);
    
    const socket = new net.Socket();
    let responseData = '';
    
    socket.on('connect', () => {
      const request = {
        message_type: 'EXECUTE_TRANSACTION',
        request_id: requestId,
        data: executionData,
      };
      
      socket.write(JSON.stringify(request) + '\n');
    });
    
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
    
    socket.setTimeout(120000); // 2 minutes timeout for transaction execution
    socket.connect(5000, 'localhost');
  });
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
  
  if (amountNum > 1000000) {
    return { isValid: false, error: 'Amount too large. Maximum allowed: 1,000,000' };
  }
  
  return { isValid: true };
}

// ===================================
// Server Startup and Shutdown
// ===================================

async function startServer() {
  try {
    // Create logs directory
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs');
    }
    
    logger.info('Starting KiloLend Execution Agent...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`API Key configured: ${!!process.env.API_KEY}`);
    
    // Start the HTTP server
    app.listen(PORT, () => {
      logger.info(`API Server running on port ${PORT}`);
    });
    
    // Initialize enclave
    try {
      await ensureEnclaveRunning();
      logger.info('Nitro Enclave is ready for transactions');
      logger.info(`Enclave wallet address: ${enclaveWalletAddress}`);
      
      if (enclaveWalletAddress) {
        logger.warn('IMPORTANT: Fund this wallet with KAIA for gas fees!');
        logger.warn(`Wallet: ${enclaveWalletAddress}`);
      }
    } catch (error) {
      logger.error('Failed to initialize enclave:', error);
      logger.warn('Server running without enclave (requests will fail)');
    }
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  // Stop accepting new requests
  logger.info('Stopping HTTP server...');
  
  // Stop enclave
  try {
    await stopEnclave();
  } catch (error) {
    logger.error('Error during enclave shutdown:', error);
  }
  
  logger.info('Shutdown complete.');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the application
startServer();
