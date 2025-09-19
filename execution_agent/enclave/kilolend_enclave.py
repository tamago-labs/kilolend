import json
import socket
import sys
import time
import logging
import hashlib

# Configure logging for enclave
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class KiloLendEnclave:
    """Secure enclave for executing KiloLend transactions"""
    
    def __init__(self, port=5005):
        self.port = port
        self.sock = None
        
        # Hardcoded private key for development (replace with secure generation for production)
        self.private_key = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        
        # KiloLend contract addresses on Kaia
        self.contracts = {
            'CUSDT': '0x498823F094f6F2121CcB4e09371a57A96d619695',
            'CSIX': '0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c',
            'CBORA': '0x7a937C07d49595282c711FBC613c881a83B9fDFD',
            'CMBX': '0xE321e20F0244500A194543B1EBD8604c02b8fA85',
            'CKAIA': '0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3',
        }
        
        # Token addresses
        self.tokens = {
            'USDT': '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
            'SIX': '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
            'BORA': '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
            'MBX': '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
            'KAIA': '0x0000000000000000000000000000000000000000'  # Native token
        }
        
        self.processed_requests = set()  # Prevent replay attacks
        
        logger.info("🔐 KiloLend Enclave initialized with hardcoded private key")
        logger.info(f"📋 Supporting assets: {list(self.tokens.keys())}")
    
    def start_server(self):
        """Start the enclave server"""
        logger.info(f"🚀 Starting KiloLend enclave server on port {self.port}")
        
        self.sock = socket.socket(socket.AF_VSOCK, socket.SOCK_STREAM)
        self.sock.bind((socket.VMADDR_CID_ANY, self.port))
        self.sock.listen(128)
        
        logger.info("👂 Server listening for execution requests...")
        
        while True:
            try:
                self.handle_connection()
            except Exception as e:
                logger.error(f"❌ Connection error: {e}")
                continue
    
    def handle_connection(self):
        """Handle incoming connection from parent instance"""
        client, (remote_cid, remote_port) = self.sock.accept()
        logger.info(f"📞 Connection from CID {remote_cid}:{remote_port}")
        
        try:
            data = b""
            while True:
                chunk = client.recv(4096)
                if not chunk:
                    break  # end of stream
                data += chunk

            if data:
                request_data = data.decode().strip()
                logger.info(f"📥 Received request: {request_data[:100]}...")

                response = self.process_execution_request(request_data)

                # Send response and close
                response_json = json.dumps(response) + '\n'
                client.sendall(response_json.encode())
                logger.info("📤 Response sent successfully")

        except Exception as e:
            logger.error(f"❌ Request processing error: {e}")
            error_response = {
                'success': False,
                'error': str(e),
                'timestamp': int(time.time())
            }
            try:
                client.sendall((json.dumps(error_response) + '\n').encode())
            except:
                pass
        finally:
            client.close()
    
    def process_execution_request(self, request_data: str) -> dict:
        """Process execution request from parent instance"""
        try:
            request = json.loads(request_data)
            request_id = request.get('request_id')
            
            logger.info(f"🔄 Processing request {request_id}")
            
            # Validate request structure
            required_fields = ['request_id', 'user_address', 'action', 'asset', 'amount']
            for field in required_fields:
                if field not in request:
                    raise ValueError(f"Missing required field: {field}")
            
            # Prevent replay attacks
            if request_id in self.processed_requests:
                raise ValueError("Request already processed")
            
            # Validate action type
            valid_actions = ['supply', 'withdraw', 'borrow', 'repay']
            if request['action'] not in valid_actions:
                raise ValueError(f"Invalid action: {request['action']}")
            
            # Validate asset
            if request['asset'] not in self.tokens:
                raise ValueError(f"Unsupported asset: {request['asset']}")
            
            # Execute the transaction
            result = self.execute_transaction(request)
            
            # Mark as processed
            self.processed_requests.add(request_id)
            
            return {
                'success': True,
                'request_id': request_id,
                'transaction_hash': result['tx_hash'],
                'gas_used': result['gas_used'],
                'block_number': result.get('block_number'),
                'timestamp': int(time.time())
            }
            
        except Exception as e:
            logger.error(f"💥 Execution error: {e}")
            return {
                'success': False,
                'request_id': request.get('request_id', 'unknown'),
                'error': str(e),
                'timestamp': int(time.time())
            }
    
    def execute_transaction(self, request: dict) -> dict:
        """Execute blockchain transaction securely"""
        action = request['action']
        asset = request['asset']
        amount = request['amount']
        user_address = request['user_address']
        max_gas_price = request.get('max_gas_price', '50')
        
        logger.info(f"⚡ Executing {action} of {amount} {asset} for {user_address}")
        
        # Get contract address
        contract_address = self.get_contract_address(asset)
        if not contract_address:
            raise ValueError(f"No contract found for asset: {asset}")
        
        # Build transaction data
        tx_data = self.build_transaction_data(action, asset, amount, user_address)
        logger.info(f"📝 Transaction data: {tx_data}")
        
        # Simulate transaction processing time
        processing_time = 2 + (len(amount) * 0.1)  # Simulate based on amount complexity
        logger.info(f"⏳ Processing transaction (estimated {processing_time:.1f}s)...")
        time.sleep(processing_time)
        
        # Generate deterministic transaction hash for demo
        tx_content = f"{action}_{asset}_{amount}_{user_address}_{int(time.time())}"
        tx_hash = '0x' + hashlib.sha256(tx_content.encode()).hexdigest()
        
        # Simulate gas usage based on action type
        gas_usage = {
            'supply': '45000',
            'withdraw': '55000', 
            'borrow': '65000',
            'repay': '50000'
        }.get(action, '50000')
        
        logger.info(f"✅ Transaction executed successfully!")
        logger.info(f"🔗 TX Hash: {tx_hash}")
        logger.info(f"⛽ Gas Used: {gas_usage}")
        
        return {
            'tx_hash': tx_hash,
            'gas_used': gas_usage,
            'block_number': 12345678 + hash(tx_hash) % 1000  # Simulate block number
        }
    
    def get_contract_address(self, asset: str) -> str:
        """Get contract address for asset"""
        if asset == 'KAIA':
            return self.contracts['CKAIA']
        elif asset in ['USDT', 'SIX', 'BORA', 'MBX']:
            return self.contracts[f'C{asset}']
        return None
    
    def build_transaction_data(self, action: str, asset: str, amount: str, user_address: str) -> str:
        """Build transaction data for the action"""
        # In a real implementation, this would build actual contract call data
        # For now, return a descriptive string
        contract = self.get_contract_address(asset)
        
        if action == 'supply':
            return f"supply({amount}) to {contract}"
        elif action == 'withdraw':
            return f"withdraw({amount}) from {contract}"
        elif action == 'borrow':
            return f"borrow({amount}) from {contract}"
        elif action == 'repay':
            return f"repay({amount}) to {contract}"
        
        return f"{action}({amount})"

def main():
    """Main entry point for enclave"""
    logger.info("🔥 KiloLend Nitro Enclave Starting...")
    
    enclave = KiloLendEnclave()
    try:
        enclave.start_server()
    except KeyboardInterrupt:
        logger.info("⏹️ Enclave server stopped by user")
    except Exception as e:
        logger.error(f"💥 Enclave fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()