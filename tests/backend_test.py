#!/usr/bin/env python3
"""
IntelliClass LMS Backend API Testing Suite
Tests all backend endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class AIClassroomTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        print(f"🚀 Starting IntelliClass LMS API Tests")
        print(f"📍 Base URL: {base_url}")
        print(f"🔗 API URL: {self.api_url}")
        print("=" * 60)

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {"message": "Success (no JSON response)"}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                try:
                    return False, response.json()
                except:
                    return False, {"error": response.text}

        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAILED - Network Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {"error": str(e)}
        except Exception as e:
            print(f"   ❌ FAILED - Unexpected Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "/",
            200
        )
        return success

    def test_demo_seed(self):
        """Test demo data seeding"""
        success, response = self.run_test(
            "Demo Data Seeding",
            "POST",
            "/demo/seed",
            200
        )
        return success

    def test_lectures_endpoint(self):
        """Test lectures endpoint (should work after seeding)"""
        success, response = self.run_test(
            "Get Lectures (Public Test)",
            "GET",
            "/lectures",
            401  # Should require auth
        )
        return True  # Expected to fail without auth

    def test_quizzes_endpoint(self):
        """Test quizzes endpoint (should work after seeding)"""
        success, response = self.run_test(
            "Get Quizzes (Public Test)",
            "GET",
            "/quizzes",
            401  # Should require auth
        )
        return True  # Expected to fail without auth

    def test_rankings_endpoint(self):
        """Test rankings endpoint (should work after seeding)"""
        success, response = self.run_test(
            "Get Rankings (Public Test)",
            "GET",
            "/rankings",
            401  # Should require auth
        )
        return True  # Expected to fail without auth

    def create_test_session(self):
        """Create a test session for authenticated endpoints"""
        print("\n🔐 Creating Test Session...")
        
        # Try to create a session with mock data
        # In a real scenario, this would go through OAuth flow
        test_session_data = {
            "session_id": f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        
        success, response = self.run_test(
            "Create Test Session",
            "POST",
            "/auth/session",
            200,
            data=test_session_data
        )
        
        if success and 'token' in response:
            self.session_token = response['token']
            self.test_user_id = response.get('user', {}).get('user_id')
            print(f"   🎫 Session Token: {self.session_token[:20]}...")
            print(f"   👤 User ID: {self.test_user_id}")
            return True
        
        print("   ⚠️  Session creation failed, will test without auth")
        return False

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.session_token:
            print("\n⚠️  Skipping authenticated tests - no session token")
            return False

        print(f"\n🔒 Testing Authenticated Endpoints...")
        
        # Test auth/me
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/auth/me",
            200
        )
        
        # Test lectures with auth
        success, response = self.run_test(
            "Get Lectures (Authenticated)",
            "GET",
            "/lectures",
            200
        )
        
        # Test quizzes with auth
        success, response = self.run_test(
            "Get Quizzes (Authenticated)",
            "GET",
            "/quizzes",
            200
        )
        
        # Test rankings with auth
        success, response = self.run_test(
            "Get Rankings (Authenticated)",
            "GET",
            "/rankings",
            200
        )
        
        # Test performance
        success, response = self.run_test(
            "Get My Performance",
            "GET",
            "/performance",
            200
        )
        
        # Test coding profile
        success, response = self.run_test(
            "Get Coding Profile",
            "GET",
            "/coding-profile",
            200
        )
        
        return True

    def test_certificate_generation(self):
        """Test certificate generation"""
        if not self.session_token:
            return False
            
        success, response = self.run_test(
            "Generate Certificate",
            "POST",
            "/certificates/generate",
            200,
            data={"course_name": "Test Course"}
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🧪 Running Complete Test Suite\n")
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_demo_seed()
        
        # Test public endpoints (should require auth)
        self.test_lectures_endpoint()
        self.test_quizzes_endpoint()
        self.test_rankings_endpoint()
        
        # Try to create session and test authenticated endpoints
        session_created = self.create_test_session()
        if session_created:
            self.test_authenticated_endpoints()
            self.test_certificate_generation()
        
        # Print final results
        self.print_results()
        
        return self.tests_passed == self.tests_run

    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"   {i}. {test['test']}")
                if 'expected' in test:
                    print(f"      Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"      Error: {test['error']}")
        
        print("\n" + "=" * 60)

def main():
    """Main test execution"""
    tester = AIClassroomTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())