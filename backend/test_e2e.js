// Comprehensive End-to-End Full-Stack Verification Suite
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

async function runE2ETests() {
    console.log('===========================================================');
    console.log('--- LUMINA AI FULL-STACK END-TO-END VERIFICATION SUITE ---');
    console.log('===========================================================\n');

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
        const timestamp = Date.now();
        const testUser = {
            name: 'Jordan Fullstack',
            email: `jordan_${timestamp}@lumina.ai`,
            password: 'SecurePassword2026!',
            role: 'student'
        };

        // 1. Health check & DB connection
        console.log('[1] Health & MongoDB status check...');
        const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
        assert(health.status === 200, `Health check 200 OK (Got: ${health.status})`);
        assert(health.data?.database === 'connected', `Database state is connected (Got: ${health.data?.database})`);

        // 2. User Registration
        console.log('\n[2] Testing User Registration...');
        const reg = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, testUser);
        assert(reg.status === 201, `Registration returned status 201 (Got: ${reg.status})`);
        assert(Boolean(reg.data?.token), 'Received JWT auth token upon registration');
        assert(reg.data?.user?.email === testUser.email, `User email matches registered email (${reg.data?.user?.email})`);
        assert(!reg.data?.user?.password, 'Password hash is excluded from response');

        const token = reg.data?.token;

        // 3. User Login with credentials
        console.log('\n[3] Testing User Login...');
        const login = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: testUser.email, password: testUser.password });
        assert(login.status === 200, `Login returned status 200 (Got: ${login.status})`);
        assert(Boolean(login.data?.token), 'Received JWT token upon login');
        assert(login.data?.user?.name === testUser.name, `Authenticated user name is ${login.data?.user?.name}`);

        // 4. Current User Session (/api/auth/me)
        console.log('\n[4] Testing Session Restoration (/api/auth/me)...');
        const me = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(me.status === 200, `GET /api/auth/me returned 200 (Got: ${me.status})`);
        assert(me.data?.email === testUser.email, `Session restored correct user: ${me.data?.email}`);

        // 5. Chat History & Real Message Persistence
        console.log('\n[5] Testing AI Career Mentor Chat flow...');
        const initialHistory = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat/history',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(initialHistory.status === 200, `GET /api/chat/history returned 200 (Got: ${initialHistory.status})`);

        const chatMsg = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat/message',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, { message: 'I have 2 hours today to learn React and Node.js. What is my next milestone?' });
        assert(chatMsg.status === 200, `POST /api/chat/message returned 200 (Got: ${chatMsg.status})`);
        assert(Boolean(chatMsg.data?.message), 'Received AI response message');
        assert(Array.isArray(chatMsg.data?.history) && chatMsg.data.history.length >= 2, 'Message history persisted in MongoDB');

        // 6. Progress Dashboard Data & Streak Update
        console.log('\n[6] Testing Progress Dashboard API...');
        const initialProgress = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/progress',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(initialProgress.status === 200, `GET /api/progress returned 200 (Got: ${initialProgress.status})`);

        const updateProg = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/progress/update',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, { incStreak: true, lessonsCompleted: 1 });
        assert(updateProg.status === 200, `POST /api/progress/update returned 200 (Got: ${updateProg.status})`);
        assert(updateProg.data?.learningStreak >= 1, `Learning streak updated: ${updateProg.data?.learningStreak} days`);

        // 7. Roadmap & Project Retrieval
        console.log('\n[7] Testing Curriculum Roadmap & Project APIs...');
        const roadmap = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/roadmap',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(roadmap.status === 200, `GET /api/roadmap returned 200 (Got: ${roadmap.status})`);
        assert(roadmap.data?.modules?.length > 0, `Roadmap contains modules (${roadmap.data?.modules?.length} modules found)`);

        // 8. Project Builder Code Evaluation & Milestone Persistence
        console.log('\n[8] Testing Project Builder Code Evaluation...');
        const review = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/roadmap/review-code',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, {
            milestoneIndex: 1,
            code: 'const Navbar = () => { return <header><nav><h1>Lumina Weather</h1></nav></header>; };'
        });
        assert(review.status === 200, `POST /api/roadmap/review-code returned 200 (Got: ${review.status})`);
        assert(review.data?.success === true, 'Code passed review');
        assert(Boolean(review.data?.feedback), `AI feedback returned: "${review.data?.feedback?.substring(0, 45)}..."`);

        // 9. Profile & Onboarding Preferences
        console.log('\n[9] Testing Profile / Goals Update...');
        const profileUpdate = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/onboarding',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, {
            careerGoal: 'Lead AI Engineer',
            skillLevel: 'advanced',
            availableHours: 4,
            preferredLanguage: 'TypeScript / React / Node.js',
            targetCompany: 'Google DeepMind'
        });
        assert(profileUpdate.status === 200, `PUT /api/auth/onboarding returned 200 (Got: ${profileUpdate.status})`);
        assert(profileUpdate.data?.careerGoal === 'Lead AI Engineer', `Persisted updated career goal: ${profileUpdate.data?.careerGoal}`);
        assert(profileUpdate.data?.skillLevel === 'advanced', `Persisted skill level: ${profileUpdate.data?.skillLevel}`);

        // 10. Security Checks (Unauthorized access, invalid token, invalid credentials, duplicate user)
        console.log('\n[10] Testing Security & Protection...');
        const unauthMe = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET' });
        assert(unauthMe.status === 401, `Unauthenticated request correctly blocked with 401 (Got: ${unauthMe.status})`);

        const fakeTokenMe = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/me',
            method: 'GET',
            headers: { 'Authorization': 'Bearer fake_invalid_jwt_token' }
        });
        assert(fakeTokenMe.status === 401, `Invalid token request correctly blocked with 401 (Got: ${fakeTokenMe.status})`);

        const dupReg = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, testUser);
        assert(dupReg.status === 400, `Duplicate registration rejected with 400 (Got: ${dupReg.status})`);

        const badLogin = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: testUser.email, password: 'WrongPassword' });
        assert(badLogin.status === 400, `Bad password login rejected with 400 (Got: ${badLogin.status})`);

        // 11. Logout
        console.log('\n[11] Testing Logout Endpoint...');
        const logout = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/logout', method: 'POST' });
        assert(logout.status === 200, `Logout returned 200 OK (Got: ${logout.status})`);

        console.log('\n===========================================================');
        console.log(`E2E SUITE RESULTS: Total Passed: ${passCount}, Total Failed: ${failCount}`);
        console.log('===========================================================\n');

        process.exit(failCount > 0 ? 1 : 0);
    } catch (err) {
        console.error('E2E Test Failure:', err);
        process.exit(1);
    }
}

runE2ETests();
