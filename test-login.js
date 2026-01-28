import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
    console.log('🧪 Testing Admin Login...\n');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin@gmail.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        console.log('📡 Response Status:', response.status);
        console.log('📦 Response Data:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('\n✅ Login Test: PASS');
        } else {
            console.log('\n❌ Login Test: FAIL');
        }

    } catch (error) {
        console.error('❌ Test Execution Error:', error.message);
    }
}

testLogin();
