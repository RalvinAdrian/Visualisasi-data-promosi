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
    try {
        let infoPengeluaran = await getPengeluaranProduk();
        let sourcePenjualan = await getSourcePenjualan();
        let productExpensesChartData = await getExpensesData();
        let averageSalesChartData = await getAverageSalesData();

        res.render('summary', { infoPengeluaran, sourcePenjualan, productExpensesChartData, averageSalesChartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
    // res.render('chart', { data: barData });
    res.json({ data: barData });
})

async function getBarChartData(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results) => {
            // console.log(results)
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    })
}

app.post('/updateScatterplot', async (req, res) => {
    const horizontalAxis = req.body.horizontalAxis;
    const operation = req.body.operation;
    const verticalAxis = req.body.verticalAxis;

    // buat querynya :
    const query = `
    SELECT ${horizontalAxis}, ${verticalAxis}
    FROM marketingdata`

    let scatterData = await getScatterplotData(query);
    // ini kirim ke frontend bentuk jSON, process dari frontend
    res.json({ data: scatterData });
})

async function getScatterplotData(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results) => {
            // console.log(results)
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    })
}



// Fungsi untuk mengambil data dari database untuk bar chart pada summary
async function getDataForBarChart() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT BirthDate, SUM(Income) as totalIncome
        FROM marketingdata
        GROUP BY BirthDate
        ORDER BY BirthDate
      `;
        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}
async function getExpensesData() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                'Wines' as Product, SUM(MntWines) as TotalExpense
            FROM
                marketingdata
            UNION
            SELECT
                'Fruits' as Product, SUM(MntFruits) as TotalExpense
            FROM
                marketingdata
            UNION
            SELECT
                'Meat Products' as Product, SUM(MntMeatProducts) as TotalExpense
            FROM
                marketingdata
            UNION
            SELECT
                'Fish Products' as Product, SUM(MntFishProducts) as TotalExpense
            FROM
                marketingdata
            UNION
            SELECT
                'Sweet Products' as Product, SUM(MntSweetProducts) as TotalExpense
            FROM
                marketingdata
            UNION
            SELECT
                'Gold Prods' as Product, SUM(MntGoldProds) as TotalExpense
            FROM
                marketingdata
        `;
        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}
async function getAverageSalesData() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                'Web' as PurchaseType, AVG(NumWebPurchases) as Average
            FROM
                marketingdata
            UNION
            SELECT
                'Catalog' as PurchaseType, AVG(NumCatalogPurchases) as Average
            FROM
                marketingdata
            UNION
            SELECT
                'Store' as PurchaseType, AVG(NumStorePurchases) as Average
            FROM
                marketingdata
        `;
        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}


// Rute untuk mengambil data bar chart
app.get('/api/bar-chart-data', async (req, res) => {
    try {
        const barChartData = await getDataForBarChart();
        res.json(barChartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rute untuk mengambil data bar chart total expenses
app.get('/api/product-expenses-chart-data', async (req, res) => {
    try {
        const expensesData = await getExpensesData(); // Gantilah ini dengan fungsi yang sesuai
        res.json(expensesData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rute untuk mengambil data bar chart average sales
app.get('/api/average-sales-chart-data', async (req, res) => {
    try {
        const averageSalesData = await getAverageSalesData(); // Gantilah ini dengan fungsi yang sesuai
        res.json(averageSalesData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
