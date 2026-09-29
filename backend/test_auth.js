// Automated test suite for Backend Authentication API
const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : null;
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, data: null, raw: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Authentication API Verification Suite ---');
    let passCount = 0;
    let failCount = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passCount++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failCount++;
        }
    }

    try {
        const uniqueEmail = `alex_${Date.now()}@example.com`;
        const testUser = {
            name: 'Alex Developer',
            email: uniqueEmail,
            password: 'password123',
            role: 'student'
        };

        // 1. Health Check & Database Connection
        console.log('\n[1] Testing Health Check & Database Connection...');
        const healthRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/health',
            method: 'GET'
        });
        assert(healthRes.status === 200, `Health check returned 200 (Got: ${healthRes.status})`);
        assert(healthRes.data && healthRes.data.database === 'connected', `Database is connected (Got: ${healthRes.data?.database})`);

        // 2. Registration with valid details
        console.log('\n[2] Testing Registration with new user...');
        const regRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, testUser);

        assert(regRes.status === 201, `Registration status is 201 (Got: ${regRes.status})`);
        assert(regRes.data && regRes.data.token, 'Registration returns JWT token');
        assert(regRes.data && regRes.data.user && regRes.data.user.email === uniqueEmail, `Registration returns sanitized user email ${uniqueEmail}`);
        assert(regRes.data && !regRes.data.user.password, 'User password is NOT returned in response');

        const userToken = regRes.data?.token;

        // 3. Duplicate Registration
        console.log('\n[3] Testing Duplicate Registration Prevention...');
        const dupRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, testUser);

        assert(dupRes.status === 400, `Duplicate registration rejected with status 400 (Got: ${dupRes.status})`);
        assert(dupRes.data && dupRes.data.msg.includes('already exists'), `Error message indicates user exists (Got: "${dupRes.data?.msg}")`);

        // 4. Registration Input Validation (short password, invalid email)
        console.log('\n[4] Testing Registration Validation...');
        const badEmailRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { name: 'Bad User', email: 'invalid-email', password: 'password123' });
        assert(badEmailRes.status === 400, `Invalid email rejected with 400 (Got: ${badEmailRes.status})`);

        const shortPassRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { name: 'Short Pass', email: `short_${Date.now()}@example.com`, password: '123' });
        assert(shortPassRes.status === 400, `Short password rejected with 400 (Got: ${shortPassRes.status})`);

        // 5. Login with valid credentials
        console.log('\n[5] Testing User Login...');
        const loginRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: uniqueEmail, password: 'password123' });

        assert(loginRes.status === 200, `Login status is 200 (Got: ${loginRes.status})`);
        assert(loginRes.data && loginRes.data.token, 'Login returns JWT token');
        assert(loginRes.data && loginRes.data.user && loginRes.data.user.name === 'Alex Developer', 'Login returns user profile');

        // 6. Login with invalid password
        console.log('\n[6] Testing Login with Invalid Password...');
        const badPassRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: uniqueEmail, password: 'wrongpassword' });
        assert(badPassRes.status === 400, `Invalid password rejected with 400 (Got: ${badPassRes.status})`);

        // 7. Login with non-existent email
        console.log('\n[7] Testing Login with Non-existent Email...');
        const noUserRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'nonexistent_user_999@example.com', password: 'password123' });
        assert(noUserRes.status === 400, `Non-existent user rejected with 400 (Got: ${noUserRes.status})`);

        // 8. Authenticated GET /api/auth/me
        console.log('\n[8] Testing GET /api/auth/me with valid Bearer token...');
        const meRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        assert(meRes.status === 200, `GET /api/auth/me returned 200 (Got: ${meRes.status})`);
        assert(meRes.data && meRes.data.email === uniqueEmail, `Returned correct user email: ${meRes.data?.email}`);
        assert(!meRes.data.password, 'Password field omitted from /me response');

        // 9. Legacy /api/auth/profile alias
        console.log('\n[9] Testing GET /api/auth/profile alias...');
        const profileRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/profile',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        assert(profileRes.status === 200, `GET /api/auth/profile returned 200 (Got: ${profileRes.status})`);

        // 10. Unauthenticated API access rejection
        console.log('\n[10] Testing Unauthenticated Access...');
        const unauthRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET'
        });
        assert(unauthRes.status === 401, `Access without token rejected with 401 (Got: ${unauthRes.status})`);

        const invalidTokenRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalid_fake_token' }
        });
        assert(invalidTokenRes.status === 401, `Access with invalid token rejected with 401 (Got: ${invalidTokenRes.status})`);

        // 11. Onboarding / Profile Update
        console.log('\n[11] Testing PUT /api/auth/onboarding...');
        const onboardRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/onboarding',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        }, {
            skillLevel: 'intermediate',
            careerGoal: 'Senior Full Stack Engineer',
            availableHours: 3,
            preferredLanguage: 'TypeScript',
            targetCompany: 'Google'
        });
        assert(onboardRes.status === 200, `Onboarding update returned 200 (Got: ${onboardRes.status})`);
        assert(onboardRes.data && onboardRes.data.onboardingCompleted === true, 'onboardingCompleted is true');
        assert(onboardRes.data && onboardRes.data.careerGoal === 'Senior Full Stack Engineer', `careerGoal updated: ${onboardRes.data?.careerGoal}`);

        // 12. Logout
        console.log('\n[12] Testing POST /api/auth/logout...');
        const logoutRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/logout',
            method: 'POST'
        });
        assert(logoutRes.status === 200, `Logout returned 200 (Got: ${logoutRes.status})`);

        console.log('\n======================================');
        console.log(`RESULTS: Total Passed: ${passCount}, Total Failed: ${failCount}`);
        console.log('======================================\n');

        process.exit(failCount > 0 ? 1 : 0);
    } catch (err) {
        console.error('Test execution error:', err);
        process.exit(1);
    }
}

runTests();
