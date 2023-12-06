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

import auth from './App-module/Auth'

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
app.get('/insert-data', auth, async (res, req) => {
    res.render('insert-data');
})

import importData from './App-module/insert-data'


// Handle CSV file upload and data insertion
app.post('/upload', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('/insert-data', { errMessage: "No file uploaded!" });
        }

        // Process the uploaded CSV file
        const fileBuffer = req.file.buffer.toString('utf-8');
        const rows = fileBuffer.split('\n');

        // Assuming the CSV header is present in the first row
        const header = rows[0].split(';');

        // Create a map to store column indexes
        const columnIndexMap = {};
        header.forEach((col, index) => {
            columnIndexMap[col.trim()] = index;
        });

        // Process each data row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(';');
            const rowData = {};

            // Map data to column names
            Object.keys(columnIndexMap).forEach((col) => {
                rowData[col] = row[columnIndexMap[col]].trim();
            });

            // Insert data into MySQL tables
            await importData(rowData);
        }

        return res.status(200).send('CSV file processed and data inserted into MySQL tables.');
    } catch (error) {
        console.error('Error processing CSV file:', error);
        return res.status(500).send('Internal Server Error.');
    }
});