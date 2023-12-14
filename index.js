import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = 8005;

app.use(express.static('static'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/', async (req, res) => {
    res.render('home');
})

import mysql from 'mysql';
// Handle CSV file upload and data insertion
import { parse } from 'csv-parse'
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbmanpro'
});

async function insertData(record) {
    // Insert data into constants table
    await executeQuery('INSERT INTO constants (Z_CostContact, Z_Revenue) VALUES (?, ?)', [record.Z_CostContact, record.Z_Revenue]);

    // Insert data into people table
    await executeQuery('INSERT INTO people (ID, Year_Birth, Education, Marital_Status, Income, Kidhome, Teenhome, Dt_Customer, Recency, Complain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [record.ID, record.Year_Birth, record.Education, record.Marital_Status, record.Income, record.Kidhome, record.Teenhome, record.Dt_Customer, record.Recency, record.Complain]);

    // Insert data into place table
    await executeQuery('INSERT INTO place (ID, NumWebPurchases, NumCatalogPurchases, NumStorePurchases, NumWebVisitsMonth) VALUES (?, ?, ?, ?, ?)',
        [record.ID, record.NumWebPurchases, record.NumCatalogPurchases, record.NumStorePurchases, record.NumWebVisitsMonth]);

    // Insert data into products table
    await executeQuery('INSERT INTO products (ID, MntWines, MntFruits, MntMeatProducts, MntFishProducts, MntSweetProducts, MntGoldProds) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [record.ID, record.MntWines, record.MntFruits, record.MntMeatProducts, record.MntFishProducts, record.MntSweetProducts, record.MntGoldProds]);

    // Insert data into promotion table
    await executeQuery('INSERT INTO promotion (ID, NumDealsPurchases, AcceptedCmp1, AcceptedCmp2, AcceptedCmp3, AcceptedCmp4, AcceptedCmp5, Response) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [record.ID, record.NumDealsPurchases, record.AcceptedCmp1, record.AcceptedCmp2, record.AcceptedCmp3, record.AcceptedCmp4, record.AcceptedCmp5, record.Response]);
}

async function executeQuery(sql, values) {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
// Handling the file upload and data insertion
app.post('/upload-csv', upload.single('csv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const csvData = req.file.buffer.toString('utf8');

        // Parse CSV data
        const records = await new Promise((resolve, reject) => {
            const parsedData = [];
            parse(csvData, {
                delimiter: '\t', // Assuming tab-separated values
                columns: true,
            })
                .on('data', (record) => {
                    parsedData.push(record);
                })
                .on('end', () => {
                    resolve(parsedData);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });

        // Insert data into MySQL tables
        for (const record of records) {
            await insertData(record);
        }

        // Respond with success
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});