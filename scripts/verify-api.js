
const http = require('http');

function postRequest(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: responseBody
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function verifyEndpoint(name, path, method = 'GET', body = null) {
    try {
        const response = await postRequest(path, method, body);
        console.log(`[${name}] ${method} ${path} -> Status: ${response.status}`);

        if (response.status === 500) {
            console.error(`❌ [${name}] FAILED: Returned 500 Internal Server Error`);
            console.error('Error details:', response.body.substring(0, 200));
            return false;
        } else {
            console.log(`✅ [${name}] PASSED (Status ${response.status} is not 500)`);
            return true;
        }
    } catch (error) {
        console.error(`❌ [${name}] FAILED: Connection error`, error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting API Verification Tests against localhost:3000');
    const results = [];

    // 1. Auth Login (POST)
    results.push(await verifyEndpoint('Login', '/api/auth/login', 'POST', {
        event: 'SIGNED_IN', session: { user: { id: 'test', email: 'test@example.com' } }
    }));

    // 2. Profile (GET)
    results.push(await verifyEndpoint('Profile', '/api/profile', 'GET'));

    // 3. Try-on (POST)
    results.push(await verifyEndpoint('Try-On', '/api/tryon', 'POST', {}));

    // 4. Influencer Onboarding (POST)
    results.push(await verifyEndpoint('Influencer Onboarding', '/api/onboarding/influencer', 'POST', {}));

    // 5. Brand Onboarding (POST)
    results.push(await verifyEndpoint('Brand Onboarding', '/api/onboarding/brand', 'POST', {}));

    // 6. Diagnose (POST)
    results.push(await verifyEndpoint('Diagnose', '/api/auth/diagnose', 'POST', { email: 'test@example.com' }));

    const passed = results.filter(r => r).length;
    console.log(`\n📊 Summary: ${passed}/${results.length} Tests Passed`);
}

runTests();
