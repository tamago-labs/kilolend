#!/usr/bin/env python3

import socket
import json
import time
import sys

def test_enclave_connection(enclave_cid=None):
    """Test connection to running enclave"""
    
    # Try to get CID from nitro-cli if not provided
    if enclave_cid is None:
        try:
            import subprocess
            result = subprocess.run(['nitro-cli', 'describe-enclaves'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                import json as json_module
                enclaves = json_module.loads(result.stdout)
                if enclaves and isinstance(enclaves, list):
                    enclave_cid = enclaves[0]['EnclaveCID']
                    print(f"🔍 Detected enclave CID: {enclave_cid}")
                else:
                    print("❌ No running enclaves found")
                    return False
            else:
                print("❌ Failed to get enclave info")
                return False
        except Exception as e:
            print(f"❌ Error detecting enclave: {e}")
            return False

    # Test cases
    test_cases = [
        {
            'name': 'Supply USDT',
            'request': {
                'request_id': 'test_supply_usdt',
                'user_address': '0x742d35Cc6634C0532925a3b8D321c2b10c8C99c6',
                'action': 'supply',
                'asset': 'USDT',
                'amount': '100.0'
            }
        },
        {
            'name': 'Supply KAIA',
            'request': {
                'request_id': 'test_supply_kaia',
                'user_address': '0x742d35Cc6634C0532925a3b8D321c2b10c8C99c6',
                'action': 'supply',
                'asset': 'KAIA',
                'amount': '1.0'
            }
        },
        {
            'name': 'Borrow USDT',
            'request': {
                'request_id': 'test_borrow_usdt',
                'user_address': '0x742d35Cc6634C0532925a3b8D321c2b10c8C99c6',
                'action': 'borrow',
                'asset': 'USDT',
                'amount': '50.0'
            }
        }
    ]

    print(f"🧪 Testing enclave at CID {enclave_cid}:5005")
    print("=" * 50)

    success_count = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']}")
        
        try:
            # Connect to enclave
            sock = socket.socket(socket.AF_VSOCK, socket.SOCK_STREAM)
            sock.settimeout(10)
            sock.connect((enclave_cid, 5005))
            
            # Send request
            request_json = json.dumps(test_case['request']) + '\n'
            sock.sendall(request_json.encode())
            print(f"   📤 Sent: {test_case['request']['action']} {test_case['request']['amount']} {test_case['request']['asset']}")
            
            # Receive response
            response_data = b""
            while True:
                chunk = sock.recv(1024)
                if not chunk:
                    break
                response_data += chunk
                if response_data.endswith(b'\n'):
                    break
            
            sock.close()
            
            # Parse response
            response = json.loads(response_data.decode().strip())
            
            if response.get('success'):
                print(f"   ✅ Success!")
                print(f"   🔗 TX: {response.get('transaction_hash', 'N/A')[:10]}...")
                print(f"   ⛽ Gas: {response.get('gas_used', 'N/A')}")
                success_count += 1
            else:
                print(f"   ❌ Failed: {response.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"   💥 Error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {success_count}/{len(test_cases)} tests passed")
    
    if success_count == len(test_cases):
        print("🎉 All tests passed! Enclave is working correctly.")
        return True
    else:
        print("⚠️ Some tests failed. Check enclave logs.")
        return False

if __name__ == "__main__":
    # Allow CID to be passed as argument
    cid = int(sys.argv[1]) if len(sys.argv) > 1 else None
    test_enclave_connection(cid)