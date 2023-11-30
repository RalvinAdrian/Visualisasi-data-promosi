import express from 'express';
import path from 'path';
import session from 'cookie-session';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
const port = 8005;
const publicPath = path.resolve('static-path');

app.use(cookieParser());
app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

import mysql from 'mysql';
// MySQL Connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbpromosi'
});

// Middleware connection
const key1 = crypto.randomBytes(32).toString('hex');
const key2 = crypto.randomBytes(32).toString('hex');
app.use(
    session({
        name: 'session',
        keys: [key1, key2],
        secret: 'mobelejen',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 16000,
        },
    })
);

app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
});

// auth middleware for role
const auth = (req, res, next) => {
    // tidak ada role = belum terdaftar
    if (!req.user || !req.user.role) {
        return res.redirect('/login');
        // return res.status(403).json({ error: 'Unauthorized' });
    }
    else {
        next();
        // return res.redirect('/');
    }
}

app.get('/login', async (req, res) => {
    res.render('login', { errorMsg: null, success: null });
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const accountQuery =
        'SELECT `E_mail`, `Password` FROM `account` WHERE `E_mail` = ? AND `Password` = ?';
    const accountParams = [email, password];
    pool.query(accountQuery, accountParams, (error, results) => {
        if (error) {
            console.log(error);
        } else if (results.length > 0) {
            const user = results[0];
            res.cookie('Id_Account', user.Id_Account)
            res.cookie('email', user.E_mail);
            console.log("Successfully validated");
            res.redirect('/home');
        } else {
            res.render('login', {
                errorMsg: 'Password / email anda salah.',
                success: false,
            });
        }
    });
});

app.get('/', auth, async (res, req) => {
    res.render('home');
})