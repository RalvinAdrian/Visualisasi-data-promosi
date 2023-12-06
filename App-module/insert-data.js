// Function to insert data into the 'people' table
async function insertPeopleData(data) {
    const connection = await pool.getConnection();
    try {
        await connection.query('INSERT INTO people SET ?', data);
    } finally {
        connection.release();
    }
}

// Function to insert data into the 'place' table
async function insertPlaceData(data) {
    const connection = await pool.getConnection();
    try {
        await connection.query('INSERT INTO place SET ?', data);
    } finally {
        connection.release();
    }
}

// Function to insert data into the 'products' table
async function insertProductsData(data) {
    const connection = await pool.getConnection();
    try {
        await connection.query('INSERT INTO products SET ?', data);
    } finally {
        connection.release();
    }
}

// Function to insert data into the 'promotion' table
async function insertPromotionData(data) {
    const connection = await pool.getConnection();
    try {
        await connection.query('INSERT INTO promotion SET ?', data);
    } finally {
        connection.release();
    }
}

// Read the CSV file and insert data into the MySQL tables
async function importData(row) {
    try {
        // Extract data for each table
        const peopleData = {
            ID: row.ID,
            Year_Birth: row.Year_Birth,
            Education: row.Education,
            Marital_Status: row.Marital_Status,
            Income: row.Income,
            Kidhome: row.Kidhome,
            Teenhome: row.Teenhome,
            Dt_Customer: row.Dt_Customer,
            Recency: row.Recency,
            Complain: row.Complain,
        };

        const placeData = {
            ID: row.ID,
            NumWebPurchases: row.NumWebPurchases,
            NumCatalogPurchases: row.NumCatalogPurchases,
            NumStorePurchases: row.NumStorePurchases,
            NumWebVisitsMonth: row.NumWebVisitsMonth,
        };

        const productsData = {
            ID: row.ID,
            MntWines: row.MntWines,
            MntFruits: row.MntFruits,
            MntMeatProducts: row.MntMeatProducts,
            MntFishProducts: row.MntFishProducts,
            MntSweetProducts: row.MntSweetProducts,
            MntGoldProds: row.MntGoldProds,
        };

        const promotionData = {
            ID: row.ID,
            NumDealsPurchases: row.NumDealsPurchases,
            AcceptedCmp1: row.AcceptedCmp1,
            AcceptedCmp2: row.AcceptedCmp2,
            AcceptedCmp3: row.AcceptedCmp3,
            AcceptedCmp4: row.AcceptedCmp4,
            AcceptedCmp5: row.AcceptedCmp5,
            Response: row.Response,
        };

        // Insert data into respective tables
        await insertPeopleData(peopleData);
        await insertPlaceData(placeData);
        await insertProductsData(productsData);
        await insertPromotionData(promotionData);

        console.log('Data from row successfully inserted into MySQL tables.');
    } catch (error) {
        console.error('Error inserting data into MySQL tables:', error);
    }
}

export default { importData }