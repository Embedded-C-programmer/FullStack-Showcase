// ============================================
// VERIFICATION SCRIPT
// Save this as verify-setup.js in backend folder
// Run with: node verify-setup.js
// ============================================

const http = require('http');

console.log('🔍 Starting verification...\n');

// Test 1: Check if server is running
function testServerRunning() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:5000/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Test 1: Server is running');
                    resolve(true);
                } else {
                    console.log('❌ Test 1: Server returned status', res.statusCode);
                    resolve(false);
                }
            });
        });
        req.on('error', (err) => {
            console.log('❌ Test 1: Server not responding');
            console.log('   Make sure to run: npm start');
            resolve(false);
        });
    });
}

// Test 2: Test registration endpoint
function testRegister() {
    return new Promise((resolve, reject) => {
        const testUser = JSON.stringify({
            username: `testuser${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': testUser.length
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log('✅ Test 2: Registration endpoint working');
                    const response = JSON.parse(data);
                    resolve(response.token);
                } else {
                    console.log('❌ Test 2: Registration failed');
                    console.log('   Status:', res.statusCode);
                    console.log('   Response:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Test 2: Registration request failed');
            console.log('   Error:', err.message);
            resolve(null);
        });

        req.write(testUser);
        req.end();
    });
}

// Test 3: Test protected endpoint with token
function testProtectedEndpoint(token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            console.log('❌ Test 3: No token available (skipped)');
            resolve(false);
            return;
        }

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Test 3: Protected endpoint working');
                    console.log('   Auth middleware is functioning correctly');
                    resolve(true);
                } else {
                    console.log('❌ Test 3: Protected endpoint failed');
                    console.log('   Status:', res.statusCode);
                    console.log('   Response:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Test 3: Request failed');
            console.log('   Error:', err.message);
            resolve(false);
        });

        req.end();
    });
}

// Test 4: Check MongoDB connection
function testMongoConnection() {
    return new Promise((resolve) => {
        // This is a simple check - if server started, MongoDB likely connected
        console.log('ℹ️  Test 4: Check backend console for MongoDB connection');
        console.log('   Should see: "✅ MongoDB connected successfully"');
        resolve(true);
    });
}

// Run all tests
async function runTests() {
    console.log('═══════════════════════════════════════\n');

    const serverRunning = await testServerRunning();
    console.log('');

    if (serverRunning) {
        const token = await testRegister();
        console.log('');

        await testProtectedEndpoint(token);
        console.log('');

        await testMongoConnection();
    } else {
        console.log('\n⚠️  Server is not running. Start it with: npm start');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('\n📋 Summary:');
    console.log('If all tests passed (✅), your backend is ready!');
    console.log('If any tests failed (❌), check the error messages above.\n');
    console.log('Common issues:');
    console.log('  - Server not running → Run: npm start');
    console.log('  - MongoDB not connected → Start MongoDB service');
    console.log('  - Port in use → Change PORT in .env or kill process\n');
}

// Run the tests
runTests().catch(console.error);