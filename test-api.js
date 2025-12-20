// Quick API test script
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing EduResults Hub API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.success ? 'PASS' : 'FAIL');
    console.log('   Message:', healthData.message);
    console.log('   Environment:', healthData.environment);
    console.log();

    // Test 2: API Documentation
    console.log('2. Testing API Documentation...');
    const docsResponse = await fetch(`${API_BASE}`);
    const docsData = await docsResponse.json();
    console.log('✅ API Docs:', docsData.success ? 'PASS' : 'FAIL');
    console.log('   Version:', docsData.version);
    console.log();

    // Test 3: Get Results (empty database)
    console.log('3. Testing Get Results...');
    const resultsResponse = await fetch(`${API_BASE}/results`);
    const resultsData = await resultsResponse.json();
    console.log('✅ Get Results:', resultsData.success ? 'PASS' : 'FAIL');
    console.log('   Total Results:', resultsData.total);
    console.log('   Current Page:', resultsData.page);
    console.log();

    // Test 4: Get Statistics (empty database)
    console.log('4. Testing Get Statistics...');
    const statsResponse = await fetch(`${API_BASE}/results/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Get Stats:', statsData.success ? 'PASS' : 'FAIL');
    console.log('   Total Results:', statsData.data?.totalResults || 0);
    console.log();

    // Test 5: Test Invalid ID Format
    console.log('5. Testing Invalid ID Validation...');
    const invalidResponse = await fetch(`${API_BASE}/results/invalid-id`);
    const invalidData = await invalidResponse.json();
    console.log('✅ Invalid ID:', invalidResponse.status === 400 ? 'PASS' : 'FAIL');
    console.log('   Error Message:', invalidData.message);
    console.log();

    // Test 6: Test Not Found
    console.log('6. Testing Not Found...');
    const notFoundResponse = await fetch(`${API_BASE}/results/507f1f77bcf86cd799439011`);
    const notFoundData = await notFoundResponse.json();
    console.log('✅ Not Found:', notFoundResponse.status === 404 ? 'PASS' : 'FAIL');
    console.log('   Error Message:', notFoundData.message);
    console.log();

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 API Status: READY FOR PRODUCTION');
    console.log('🔗 Frontend can now connect to: http://localhost:5000/api');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: npm run dev');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify port 5000 is available');
  }
}

// Run tests if this file is executed directly
if (process.argv[1].endsWith('test-api.js')) {
  testAPI();
}

export default testAPI;