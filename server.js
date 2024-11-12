const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// JSON 요청 파싱 미들웨어
app.use(express.json());

// 세션 설정
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 60 * 1000 } // 세션 기한 30분
    })
);

// 임시 사용자 데이터
const users = [
    { email: 'user1@school.com', username: 'User One', password: 'password1' },
    { email: 'user2@school.com', username: 'User Two', password: 'password2' },
];

// 기본 엔드포인트
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the API!',
    });
});

// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({
            success: false,
            message: 'Email, username, and password are required',
        });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User with this email already exists',
        });
    }

    const newUser = { email, username, password };
    users.push(newUser);
    res.status(201).json({
        success: true,
        message: 'Signup successful!',
        user: { email: newUser.email, username: newUser.username },
    });
});

// 로그인 엔드포인트
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
        });
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        req.session.user = { email: user.email, username: user.username };
        res.json({
            success: true,
            message: 'Login successful',
            user: req.session.user,
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }
});

// 로그아웃 엔드포인트
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to logout',
            });
        }
        res.json({
            success: true,
            message: 'Logout successful',
        });
    });
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
