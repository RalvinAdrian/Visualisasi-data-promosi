import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 8005;

app.use(express.static('static'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
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
    database: 'dbmanpro-baru'
});
function queryAsync(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results) => {
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
                delimiter: ';',
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

app.get('/chart', async (req, res) => {
    res.render('chart');
})

app.get('/summary', async (req, res) => {
    let infoPengeluaran = await getPengeluaranProduk();
    let sourcePenjualan = await getSourcePenjualan();
    res.render('summary', { infoPengeluaran, sourcePenjualan });
})

async function getPengeluaranProduk() {
    return new Promise((resolve, reject) => {
        const query = `SELECT SUM(MntWines) AS Wine, SUM(MntFruits) AS Buah, SUM(MntMeatProducts) AS Daging, SUM(MntFishProducts) AS Ikan, SUM(MntSweetProducts) AS Sweets, SUM(MntGoldProds) AS Emas FROM marketingdata;`;
        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0]);
        });
    })
}

async function getSourcePenjualan() {
    return new Promise((resolve, reject) => {
        const query = `SELECT AVG(NumWebPurchases) AS "Penjualan dari Web", AVG(NumCatalogPurchases) AS "Penjualan dari Katalog", AVG(NumStorePurchases) AS "Penjualan dari Toko" FROM marketingdata; `;
        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0]);
            console.log(results[0]);
        });
    })
}
app.use(express.json());
app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.post('/updateBarchart', async (req, res) => {
    const horizontalAxis = req.body.horizontalAxis;
    const operation = req.body.operation;
    const verticalAxis = req.body.verticalAxis;

    // buat querynya :
    const query = `
    SELECT ${horizontalAxis}, ${operation}(${verticalAxis}) 
    FROM marketingdata
    GROUP BY ${horizontalAxis}
    ORDER BY ${horizontalAxis}`

    let barData = await getBarChartData(query);
    // ini kirim ke frontend bentuk jSON, process dari frontend
    res.render('chart', { data: barData });
})

async function getBarChartData(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results) => {
            console.log(results)
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    })
}