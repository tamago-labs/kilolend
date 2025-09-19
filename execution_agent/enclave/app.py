#!/usr/bin/env python3

import json
import socket
import threading
import time
import logging
import os
import secrets
from web3 import Web3
from eth_account import Account

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kaia blockchain configuration
KAIA_RPC_URL = os.getenv('KAIA_RPC_URL', 'https://public-en.node.kaia.io')
CHAIN_ID = int(os.getenv('CHAIN_ID', '8217'))

# Contract addresses on Kaia mainnet
CONTRACTS = {
    "CUSDT": "0x498823F094f6F2121CcB4e09371a57A96d619695",
    "CSIX": "0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c", 
    "CBORA": "0x7a937C07d49595282c711FBC613c881a83B9fDFD",
    "CMBX": "0xE321e20F0244500A194543B1EBD8604c02b8fA85",
    "CKAIA": "0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3",
}

TOKENS = {
    "USDT": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
    "SIX": "0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435",
    "BORA": "0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa",
    "MBX": "0xD068c52d81f4409B9502dA926aCE3301cc41f623",
}

# Function signatures for compound protocol
FUNCTION_SIGS = {
    "mint": "0x1249c58b",  # mint()
    "redeem": "0xdb006a75",  # redeem(uint256)
    "borrow": "0xc5ebeaec",  # borrow(uint256)
    "repayBorrow": "0x0e752702",  # repayBorrow(uint256)
    "approve": "0x095ea7b3",  # approve(address,uint256)
}

class SecureExecutionAgent:
    def __init__(self):
        self.w3 = None
        self.private_key = None
        self.account = None
        self.nonce_cache = {}
        self.setup_web3()
        self.setup_secure_wallet()
        
    def setup_web3(self):
        """Initialize Web3 connection"""
        try:
            self.w3 = Web3(Web3.HTTPProvider(KAIA_RPC_URL, request_kwargs={'timeout': 60}))
            if self.w3.is_connected():
                logger.info(f"Connected to Kaia network. Latest block: {self.w3.eth.block_number}")
            else:
                raise Exception("Failed to connect to Kaia network")
        except Exception as e:
            logger.error(f"Web3 setup failed: {e}")
            raise
        
    def setup_secure_wallet(self):
        """Generate secure private key inside enclave"""
        logger.info("Generating secure wallet inside enclave...")
        
        # Generate cryptographically secure private key using hardware entropy
        self.private_key = "0x" + secrets.token_hex(32)
        self.account = Account.from_key(self.private_key)
        
        # Initialize nonce cache
        self.nonce_cache[self.account.address] = self.w3.eth.get_transaction_count(self.account.address)
        
        logger.info(f"Wallet created: {self.account.address}")
        logger.warning("IMPORTANT: Fund this wallet with KAIA for gas fees!")
        
        # Check wallet balance
        try:
            balance = self.w3.eth.get_balance(self.account.address)
            balance_kaia = self.w3.from_wei(balance, 'ether')
            logger.info(f"Wallet balance: {balance_kaia} KAIA")
            
            if balance_kaia < 0.01:
                logger.warning("Low wallet balance! Please fund with KAIA for gas fees.")
                
        except Exception as e:
            logger.error(f"Failed to check wallet balance: {e}")
        
    def execute_transaction(self, request_data):
        """Execute transaction based on request"""
        try:
            action = request_data['action']
            asset = request_data['asset']
            amount = request_data['amount']
            user_address = request_data['userAddress']
            max_gas_price = request_data.get('maxGasPrice', '50')
            
            logger.info(f"Executing {action} for {amount} {asset} (user: {user_address[:8]}...)")
            
            # Convert amount to proper units
            if asset == 'KAIA':
                amount_wei = self.w3.to_wei(float(amount), 'ether')
            else:
                # For tokens, assume 18 decimals (adjust if different)
                amount_wei = self.w3.to_wei(float(amount), 'ether')
            
            if action == 'supply':
                return self.execute_supply(asset, amount_wei, max_gas_price)
            elif action == 'withdraw':
                return self.execute_withdraw(asset, amount_wei, max_gas_price)
            elif action == 'borrow':
                return self.execute_borrow(asset, amount_wei, max_gas_price)
            elif action == 'repay':
                return self.execute_repay(asset, amount_wei, max_gas_price)
            else:
                raise ValueError(f"Unsupported action: {action}")
                
        except Exception as e:
            logger.error(f"Transaction execution failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'transaction_hash': None,
                'gas_used': None
            }
    
    def execute_supply(self, asset, amount_wei, max_gas_price):
        """Execute supply transaction"""
        contract_address = CONTRACTS.get(f"C{asset}")
        if not contract_address:
            raise ValueError(f"Unsupported asset for supply: {asset}")
        
        logger.info(f"Supplying {self.w3.from_wei(amount_wei, 'ether')} {asset}")
        
        if asset == 'KAIA':
            # For KAIA, supply by sending value with mint() call
            transaction = {
                'to': contract_address,
                'value': amount_wei,
                'gas': 300000,
                'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
                'nonce': self.get_nonce(),
                'chainId': CHAIN_ID,
                'data': FUNCTION_SIGS['mint']  # mint()
            }
        else:
            # For ERC20 tokens, need approval first, then mint
            # This is simplified - in production, implement proper ERC20 approval flow
            token_address = TOKENS.get(asset)
            if not token_address:
                raise ValueError(f"Token address not found for {asset}")
            
            # For demo, directly call mint with amount
            transaction = {
                'to': contract_address,
                'value': 0,
                'gas': 400000,
                'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
                'nonce': self.get_nonce(),
                'chainId': CHAIN_ID,
                'data': FUNCTION_SIGS['mint'] + self.encode_uint256(amount_wei)
            }
        
        return self.sign_and_send_transaction(transaction)
    
    def execute_withdraw(self, asset, amount_wei, max_gas_price):
        """Execute withdraw (redeem) transaction"""
        contract_address = CONTRACTS.get(f"C{asset}")
        if not contract_address:
            raise ValueError(f"Unsupported asset for withdraw: {asset}")
        
        logger.info(f"Withdrawing {self.w3.from_wei(amount_wei, 'ether')} {asset}")
        
        transaction = {
            'to': contract_address,
            'value': 0,
            'gas': 400000,
            'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
            'nonce': self.get_nonce(),
            'chainId': CHAIN_ID,
            'data': FUNCTION_SIGS['redeem'] + self.encode_uint256(amount_wei)
        }
        
        return self.sign_and_send_transaction(transaction)
    
    def execute_borrow(self, asset, amount_wei, max_gas_price):
        """Execute borrow transaction"""
        contract_address = CONTRACTS.get(f"C{asset}")
        if not contract_address:
            raise ValueError(f"Unsupported asset for borrow: {asset}")
        
        logger.info(f"Borrowing {self.w3.from_wei(amount_wei, 'ether')} {asset}")
        
        transaction = {
            'to': contract_address,
            'value': 0,
            'gas': 400000,
            'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
            'nonce': self.get_nonce(),
            'chainId': CHAIN_ID,
            'data': FUNCTION_SIGS['borrow'] + self.encode_uint256(amount_wei)
        }
        
        return self.sign_and_send_transaction(transaction)
    
    def execute_repay(self, asset, amount_wei, max_gas_price):
        """Execute repay transaction"""
        contract_address = CONTRACTS.get(f"C{asset}")
        if not contract_address:
            raise ValueError(f"Unsupported asset for repay: {asset}")
        
        logger.info(f"Repaying {self.w3.from_wei(amount_wei, 'ether')} {asset}")
        
        if asset == 'KAIA':
            # For KAIA, send value with repayBorrow call
            transaction = {
                'to': contract_address,
                'value': amount_wei,
                'gas': 400000,
                'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
                'nonce': self.get_nonce(),
                'chainId': CHAIN_ID,
                'data': FUNCTION_SIGS['repayBorrow']
            }
        else:
            # For ERC20 tokens
            transaction = {
                'to': contract_address,
                'value': 0,
                'gas': 400000,
                'gasPrice': self.w3.to_wei(max_gas_price, 'gwei'),
                'nonce': self.get_nonce(),
                'chainId': CHAIN_ID,
                'data': FUNCTION_SIGS['repayBorrow'] + self.encode_uint256(amount_wei)
            }
        
        return self.sign_and_send_transaction(transaction)
    
    def encode_uint256(self, value):
        """Encode uint256 for function call data"""
        return f"{value:064x}"
    
    def get_nonce(self):
        """Get next nonce for transactions"""
        try:
            current_nonce = self.w3.eth.get_transaction_count(self.account.address, 'pending')
            cached_nonce = self.nonce_cache.get(self.account.address, 0)
            
            # Use the higher of current or cached nonce
            nonce = max(current_nonce, cached_nonce)
            self.nonce_cache[self.account.address] = nonce + 1
            
            return nonce
        except Exception as e:
            logger.error(f"Failed to get nonce: {e}")
            raise
    
    def sign_and_send_transaction(self, transaction):
        """Sign and send transaction to blockchain"""
        try:
            logger.info(f"Signing transaction to {transaction['to']} with nonce {transaction['nonce']}")
            
            # Estimate gas if not provided
            if 'gas' not in transaction:
                try:
                    gas_estimate = self.w3.eth.estimate_gas(transaction)
                    transaction['gas'] = int(gas_estimate * 1.2)  # Add 20% buffer
                except Exception as e:
                    logger.warning(f"Gas estimation failed: {e}, using default")
                    transaction['gas'] = 300000
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_hash_hex = tx_hash.hex()
            
            logger.info(f"Transaction sent: {tx_hash_hex}")
            
            # Wait for confirmation with timeout
            try:
                receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
                
                if receipt.status == 1:
                    logger.info(f"Transaction successful: {tx_hash_hex}")
                    return {
                        'success': True,
                        'transaction_hash': tx_hash_hex,
                        'gas_used': str(receipt.gasUsed),
                        'block_number': receipt.blockNumber,
                        'error': None
                    }
                else:
                    logger.error(f"Transaction failed: {tx_hash_hex}")
                    return {
                        'success': False,
                        'error': 'Transaction reverted',
                        'transaction_hash': tx_hash_hex,
                        'gas_used': str(receipt.gasUsed)
                    }
                    
            except Exception as e:
                logger.error(f"Transaction timeout or error: {e}")
                return {
                    'success': False,
                    'error': f'Transaction timeout or confirmation error: {str(e)}',
                    'transaction_hash': tx_hash_hex,
                    'gas_used': None
                }
            
        except Exception as e:
            logger.error(f"Transaction signing/sending failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'transaction_hash': None,
                'gas_used': None
            }

def handle_client(client_socket, execution_agent):
    """Handle client connection"""
    client_addr = client_socket.getpeername()
    logger.info(f"New client connected: {client_addr}")
    
    try:
        while True:
            data = client_socket.recv(4096)
            if not data:
                logger.info(f"Client {client_addr} disconnected")
                break
            
            try:
                message_str = data.decode().strip()
                logger.debug(f"Received message: {message_str[:100]}...")
                
                message = json.loads(message_str)
                logger.info(f"Processing: {message['message_type']}")
                
                if message['message_type'] == 'EXECUTE_TRANSACTION':
                    result = execution_agent.execute_transaction(message['data'])
                    response = {
                        'request_id': message['request_id'],
                        **result
                    }
                    
                elif message['message_type'] == 'HEALTH_CHECK':
                    response = {
                        'request_id': message['request_id'],
                        'success': True,
                        'status': 'healthy',
                        'wallet_address': execution_agent.account.address if execution_agent.account else None,
                        'chain_id': CHAIN_ID,
                        'rpc_url': KAIA_RPC_URL,
                        'latest_block': execution_agent.w3.eth.block_number if execution_agent.w3 else None
                    }
                    
                elif message['message_type'] == 'GET_BALANCE':
                    try:
                        balance = execution_agent.w3.eth.get_balance(execution_agent.account.address)
                        balance_kaia = execution_agent.w3.from_wei(balance, 'ether')
                        response = {
                            'request_id': message['request_id'],
                            'success': True,
                            'balance_wei': str(balance),
                            'balance_kaia': str(balance_kaia),
                            'wallet_address': execution_agent.account.address
                        }
                    except Exception as e:
                        response = {
                            'request_id': message['request_id'],
                            'success': False,
                            'error': f'Failed to get balance: {str(e)}'
                        }
                        
                else:
                    response = {
                        'request_id': message['request_id'],
                        'success': False,
                        'error': f"Unknown message type: {message['message_type']}"
                    }
                
                # Send response
                response_str = json.dumps(response) + '\n'
                client_socket.send(response_str.encode())
                logger.debug(f"Response sent: {response.get('success', False)}")
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from {client_addr}: {e}")
                error_response = {
                    'success': False,
                    'error': 'Invalid JSON format'
                }
                client_socket.send((json.dumps(error_response) + '\n').encode())
                
            except Exception as e:
                logger.error(f"Error handling client {client_addr}: {e}")
                error_response = {
                    'success': False,
                    'error': f'Internal error: {str(e)}'
                }
                try:
                    client_socket.send((json.dumps(error_response) + '\n').encode())
                except:
                    pass  # Client might have disconnected
                
    except Exception as e:
        logger.error(f"Client handling error for {client_addr}: {e}")
    finally:
        try:
            client_socket.close()
        except:
            pass
        logger.info(f"Client {client_addr} connection closed")

def main():
    logger.info("Starting KiloLend Secure Execution Agent in Nitro Enclave...")
    
    try:
        # Initialize execution agent
        execution_agent = SecureExecutionAgent()
        logger.info("Execution agent initialized successfully")
        
        # Start socket server
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind(('0.0.0.0', 5000))
        server_socket.listen(10)
        
        logger.info("Socket server listening on port 5000")
        logger.info(f"Execution wallet: {execution_agent.account.address}")
        logger.warning("IMPORTANT: Fund this wallet with KAIA for gas fees!")
        
        try:
            while True:
                try:
                    client_socket, addr = server_socket.accept()
                    logger.info(f"New connection from {addr}")
                    
                    # Handle each client in a separate thread
                    client_thread = threading.Thread(
                        target=handle_client,
                        args=(client_socket, execution_agent),
                        daemon=True
                    )
                    client_thread.start()
                    
                except Exception as e:
                    logger.error(f"Error accepting connection: {e}")
                    time.sleep(1)
                    
        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise
        
    finally:
        try:
            server_socket.close()
        except:
            pass
        logger.info("Enclave application shutdown complete")

if __name__ == "__main__":
    main()


