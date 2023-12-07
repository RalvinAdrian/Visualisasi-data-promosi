import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = 8005;
const publicPath = path.resolve('static-path');

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

app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/', async (req, res) => {
    res.render('home');
})
app.get('/insert-data', async (req, res) => {
    res.render('insert-data');
})

// import importData from 'insert-data.js'

// Handle CSV file upload and data insertion
// app.post('/upload', upload.single('csvFile'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.render('/insert-data', { errMessage: "No file uploaded!" });
//         }

//         // Process the uploaded CSV file
//         const fileBuffer = req.file.buffer.toString('utf-8');
//         const rows = fileBuffer.split('\n');

//         // Assuming the CSV header is present in the first row
//         const header = rows[0].split(';');

//         // Create a map to store column indexes
//         const columnIndexMap = {};
//         header.forEach((col, index) => {
//             columnIndexMap[col.trim()] = index;
//         });

//         // Process each data row
//         for (let i = 1; i < rows.length; i++) {
//             const row = rows[i].split(';');
//             const rowData = {};

//             // Map data to column names
//             Object.keys(columnIndexMap).forEach((col) => {
//                 rowData[col] = row[columnIndexMap[col]].trim();
//             });

//             // Insert data into MySQL tables
//             await importData(rowData);
//         }

//         return res.status(200).send('CSV file processed and data inserted into MySQL tables.');
//     } catch (error) {
//         console.error('Error processing CSV file:', error);
//         return res.status(500).send('Internal Server Error.');
//     }
// });