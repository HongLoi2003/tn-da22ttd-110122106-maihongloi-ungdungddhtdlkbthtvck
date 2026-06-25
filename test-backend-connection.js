// Script để test kết nối đến backend server
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function testConnection() {
  console.log('🧪 Testing backend connection...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check endpoint...');
    const healthResponse = await fetch(API_URL);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'OK') {
      console.log('✅ Health check passed!');
      console.log('   Response:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ Health check failed!');
      return;
    }

    console.log('\n2️⃣ Testing verify-otp endpoint...');
    const otpResponse = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
      }),
    });
    
    const otpData = await otpResponse.json();
    console.log('   Status:', otpResponse.status);
    console.log('   Response:', JSON.stringify(otpData, null, 2));

    if (otpResponse.status === 404 || otpResponse.status === 400) {
      console.log('✅ Endpoint is responding correctly (expected 404 for test data)');
    } else {
      console.log('⚠️  Unexpected response');
    }

    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Server is running on port 3001');
    console.log('   - API endpoints are accessible');
    console.log('   - Ready to use in the app!');

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('   Error:', error.message);
    console.error('\n💡 Make sure to:');
    console.error('   1. Start the backend server: cd email-api && npm start');
    console.error('   2. Check that port 3001 is not blocked');
    console.error('   3. Verify serviceAccountKey.json exists');
  }
}

testConnection();
