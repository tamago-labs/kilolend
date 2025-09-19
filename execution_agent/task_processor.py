import boto3
import json
import socket
import time
import logging
import os
from typing import List, Dict, Any
from decimal import Decimal

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/kilolend-task-processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TaskProcessor:
    """Process execution tasks from DynamoDB and send to enclave"""
    
    def __init__(self):
        # AWS configuration
        self.region = os.environ.get('AWS_REGION', 'ap-southeast-1')
        self.table_name = os.environ.get('USER_POINTS_TABLE_NAME', 'kilo-user-points-2')
        
        # Initialize AWS clients
        self.dynamodb = boto3.resource('dynamodb', region_name=self.region)
        self.table = self.dynamodb.Table(self.table_name)
        
        # Enclave configuration
        self.enclave_cid = None  # Will be detected automatically
        self.enclave_port = int(os.environ.get('ENCLAVE_PORT', '5005'))
        
        # Processing configuration
        self.poll_interval = int(os.environ.get('POLL_INTERVAL_SECONDS', '10'))
        self.max_retries = int(os.environ.get('MAX_RETRIES', '3'))
        self.batch_size = int(os.environ.get('BATCH_SIZE', '10'))
        
        logger.info(f"Task processor initialized - Table: {self.table_name}, Region: {self.region}")
        
    def start_processing(self):
        """Start the main processing loop"""
        logger.info("🚀 Starting KiloLend Task Processor")
        
        # Detect enclave CID
        self.detect_enclave_cid()
        
        # Wait for enclave to be ready
        self.wait_for_enclave()
        
        logger.info("✅ System ready - Starting task processing loop")
        
        # Main processing loop
        while True:
            try:
                self.process_pending_tasks()
                time.sleep(self.poll_interval)
            except KeyboardInterrupt:
                logger.info("⏹️  Stopping task processor...")
                break
            except Exception as e:
                logger.error(f"❌ Processing loop error: {e}")
                time.sleep(self.poll_interval)
        
        logger.info("🛑 Task processor stopped")
    
    def detect_enclave_cid(self):
        """Detect enclave CID from nitro-cli"""
        try:
            import subprocess
            import json
            
            result = subprocess.run(
                ['nitro-cli', 'describe-enclaves'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                enclaves_info = json.loads(result.stdout)
                if enclaves_info.get('Enclaves'):
                    enclave = enclaves_info['Enclaves'][0]
                    self.enclave_cid = enclave['EnclaveCID']
                    logger.info(f"🔍 Detected enclave CID: {self.enclave_cid}")
                    return
            
            raise Exception("No running enclaves found")
            
        except Exception as e:
            logger.warning(f"⚠️  Could not detect enclave CID: {e}")
            # Fallback to environment variable or default
            self.enclave_cid = int(os.environ.get('ENCLAVE_CID', '16'))
            logger.info(f"🔄 Using fallback enclave CID: {self.enclave_cid}")
    
    def wait_for_enclave(self):
        """Wait for enclave to be ready"""
        logger.info("⏳ Waiting for enclave to be ready...")
        
        max_attempts = 30
        for attempt in range(max_attempts):
            try:
                if self.test_enclave_connection():
                    logger.info(f"✅ Enclave ready at CID {self.enclave_cid}:{self.enclave_port}")
                    return
                    
            except Exception as e:
                logger.debug(f"Enclave test failed: {e}")
                
            logger.info(f"⏳ Waiting for enclave... ({attempt + 1}/{max_attempts})")
            time.sleep(5)
        
        raise Exception(f"❌ Enclave not ready after {max_attempts * 5} seconds")
    
    def test_enclave_connection(self) -> bool:
        """Test connection to enclave"""
        try:
            sock = socket.socket(socket.AF_VSOCK, socket.SOCK_STREAM)
            sock.settimeout(3)
            sock.connect((self.enclave_cid, self.enclave_port))
            
            # Send test message
            test_msg = json.dumps({
                'request_id': 'connection_test',
                'user_address': '0x0000000000000000000000000000000000000000',
                'action': 'test',
                'asset': 'USDT',
                'amount': '0'
            }) + '\n'
            
            sock.sendall(test_msg.encode())
            
            # Read response (optional for test)
            try:
                response = sock.recv(1024)
                logger.debug(f"Test response: {response.decode()[:100]}")
            except:
                pass  # Response not critical for connection test
                
            sock.close()
            return True
            
        except Exception:
            return False
    
    def process_pending_tasks(self):
        """Process all pending execution tasks"""
        try:
            # Scan for pending tasks
            response = self.table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('date').begins_with('EXEC_PENDING_'),
                Limit=self.batch_size
            )
            
            tasks = response.get('Items', [])
            
            if tasks:
                logger.info(f"📋 Found {len(tasks)} pending tasks")
                
                for task in tasks:
                    try:
                        self.process_single_task(task)
                    except Exception as e:
                        logger.error(f"❌ Error processing individual task: {e}")
                        continue
            else:
                logger.debug("No pending tasks found")
                
        except Exception as e:
            logger.error(f"❌ Error scanning for pending tasks: {e}")
    
    def process_single_task(self, task: Dict[str, Any]):
        """Process a single execution task"""
        try:
            # Extract task information
            task_id = task.get('date', '').replace('EXEC_PENDING_', '')
            user_address = task.get('userAddress')
            task_data_str = task.get('taskData', '{}')
            retry_count = task.get('retryCount', 0)
            
            # Parse task data
            task_data = json.loads(task_data_str)
            
            logger.info(f"🔄 Processing task {task_id[:8]}... for user {user_address[:10]}...")
            logger.debug(f"Task details: {task_data}")
            
            # Update status to processing
            self.update_task_status(task_id, user_address, 'PROCESSING', {
                'message': 'Task sent to enclave for execution'
            })
            
            # Send to enclave
            result = self.send_to_enclave(task_data)
            
            if result.get('success'):
                # Task completed successfully
                self.update_task_status(task_id, user_address, 'COMPLETED', result)
                logger.info(f"✅ Task {task_id[:8]}... completed successfully")
                logger.info(f"🔗 TX Hash: {result.get('transaction_hash', 'N/A')}")
                
            else:
                # Task failed
                error_message = result.get('error', 'Unknown error')
                logger.error(f"❌ Task {task_id[:8]}... failed: {error_message}")
                
                # Check if we should retry
                if retry_count < self.max_retries:
                    self.retry_task(task_id, user_address, task, retry_count + 1)
                else:
                    self.update_task_status(task_id, user_address, 'FAILED', result)
                    logger.error(f"💀 Task {task_id[:8]}... failed permanently after {self.max_retries} retries")
                    
        except Exception as e:
            logger.error(f"❌ Unexpected error processing task: {e}")
    
    def send_to_enclave(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send task to enclave for execution"""
        try:
            # Connect to enclave
            sock = socket.socket(socket.AF_VSOCK, socket.SOCK_STREAM)
            sock.settimeout(60)  # 60 second timeout for execution
            sock.connect((self.enclave_cid, self.enclave_port))
            
            # Send request
            request_json = json.dumps(task_data) + '\n'
            sock.sendall(request_json.encode())
            logger.debug(f"📤 Sent to enclave: {request_json[:200]}...")
            
            # Receive response
            response_data = b""
            while True:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                response_data += chunk
                if response_data.endswith(b'\n'):
                    break
            
            sock.close()
            
            # Parse response
            response_str = response_data.decode().strip()
            logger.debug(f"📥 Received from enclave: {response_str[:200]}...")
            
            response = json.loads(response_str)
            return response
            
        except socket.timeout:
            logger.error("⏰ Enclave execution timeout")
            return {
                'success': False,
                'error': 'Execution timeout - transaction may have been submitted but confirmation failed'
            }
            
        except Exception as e:
            logger.error(f"💔 Enclave communication error: {e}")
            return {
                'success': False,
                'error': f"Communication error: {str(e)}"
            }
    
    def update_task_status(self, task_id: str, user_address: str, status: str, result: Dict[str, Any]):
        """Update task status in database"""
        try:
            timestamp = int(time.time())
            
            # Remove pending/processing task
            old_statuses = ['PENDING', 'PROCESSING']
            for old_status in old_statuses:
                try:
                    self.table.delete_item(
                        Key={
                            'userAddress': user_address,
                            'date': f'EXEC_{old_status}_{task_id}'
                        }
                    )
                except:
                    pass  # Task might not exist with this status
            
            # Add new status record
            self.table.put_item(
                Item={
                    'userAddress': user_address,
                    'date': f'EXEC_{status}_{task_id}',
                    'status': status,
                    'result': json.dumps(result, default=str),
                    'timestamp': timestamp,
                    'updatedAt': timestamp
                }
            )
            
            logger.debug(f"📝 Updated task {task_id[:8]}... status to {status}")
            
        except Exception as e:
            logger.error(f"❌ Error updating task status: {e}")
    
    def retry_task(self, task_id: str, user_address: str, original_task: Dict[str, Any], retry_count: int):
        """Retry a failed task"""
        try:
            logger.info(f"🔄 Retrying task {task_id[:8]}... (attempt {retry_count})")
            
            # Update retry count and put back as pending
            updated_task = original_task.copy()
            updated_task['retryCount'] = retry_count
            updated_task['lastRetryAt'] = int(time.time())
            
            # Remove failed status
            try:
                self.table.delete_item(
                    Key={
                        'userAddress': user_address,
                        'date': f'EXEC_FAILED_{task_id}'
                    }
                )
            except:
                pass
            
            # Put back as pending
            self.table.put_item(Item=updated_task)
            
        except Exception as e:
            logger.error(f"❌ Error retrying task: {e}")

def main():
    """Main entry point"""
    try:
        # Read configuration from environment
        logger.info("🔧 KiloLend Task Processor Starting...")
        logger.info(f"📊 Configuration:")
        logger.info(f"   Region: {os.environ.get('AWS_REGION', 'ap-southeast-1')}")
        logger.info(f"   Table: {os.environ.get('USER_POINTS_TABLE_NAME', 'kilo-user-points-2')}")
        logger.info(f"   Poll Interval: {os.environ.get('POLL_INTERVAL_SECONDS', '10')}s")
        logger.info(f"   Max Retries: {os.environ.get('MAX_RETRIES', '3')}")
        
        processor = TaskProcessor()
        processor.start_processing()
        
    except KeyboardInterrupt:
        logger.info("👋 Task processor stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
        raise

if __name__ == "__main__":
    main()