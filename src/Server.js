const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors());

// Dummy user data
const user = {
    username: 'admin',
    password: bcrypt.hashSync('password', 8) // hashed password
};

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== user.username) {
        return res.status(401).send({ message: 'Invalid username' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.username }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours

    res.status(200).send({ token });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token' });
        }

        req.userId = decoded.id;
        next();
    });
};

// Protected route
app.get('/api/dashboard', verifyToken, (req, res) => {
    res.status(200).send({ message: `Welcome, ${req.userId}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
