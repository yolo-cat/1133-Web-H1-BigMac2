const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const dbPath = './db/sqlite.db';

// 確認資料夾存在
if (!fs.existsSync('./db')) {
    fs.mkdirSync('./db');
}

// 連線到資料庫
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('資料庫開啟失敗:', err.message);
    } else {
        console.log('資料庫成功開啟');
    }
});

// 建立表格（如果不存在）
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS big_mac_index (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 date TEXT,
                                                 iso_a3 TEXT,
                                                 currency_code TEXT,
                                                 name TEXT,
                                                 local_price REAL,
                                                 dollar_ex REAL,
                                                 dollar_price REAL,
                                                 USD_raw REAL,
                                                 EUR_raw REAL,
                                                 GBP_raw REAL,
                                                 JPY_raw REAL,
                                                 CNY_raw REAL,
                                                 GDP_bigmac REAL,
                                                 adj_price REAL,
                                                 USD_adjusted REAL,
                                                 EUR_adjusted REAL,
                                                 GBP_adjusted REAL,
                                                 JPY_adjusted REAL,
                                                 CNY_adjusted REAL
    );
`;

db.serialize(() => {
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('建立表格失敗:', err.message);
            db.close();
            return;
        }
        console.log('big_mac_index 表格確認存在');

        // 批次插入 CSV
        const insertSQL = `
            INSERT INTO big_mac_index (
                date, iso_a3, currency_code, name, local_price, dollar_ex, dollar_price,
                USD_raw, EUR_raw, GBP_raw, JPY_raw, CNY_raw,
                GDP_bigmac, adj_price, USD_adjusted, EUR_adjusted, GBP_adjusted, JPY_adjusted, CNY_adjusted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 開啟 CSV 並一行一行插入
        const results = [];
        fs.createReadStream('./big-mac-full-index.csv')
            .pipe(csv())
            .on('data', (row) => {
                // 轉換欄位到正確型別
                const data = [
                    row.date,
                    row.iso_a3,
                    row.currency_code,
                    row.name,
                    parseFloat(row.local_price),
                    parseFloat(row.dollar_ex),
                    parseFloat(row.dollar_price),
                    parseFloat(row.USD_raw),
                    parseFloat(row.EUR_raw),
                    parseFloat(row.GBP_raw),
                    parseFloat(row.JPY_raw),
                    parseFloat(row.CNY_raw),
                    parseFloat(row.GDP_bigmac),
                    parseFloat(row.adj_price),
                    parseFloat(row.USD_adjusted),
                    parseFloat(row.EUR_adjusted),
                    parseFloat(row.GBP_adjusted),
                    parseFloat(row.JPY_adjusted),
                    parseFloat(row.CNY_adjusted)
                ];
                db.run(insertSQL, data, function(err) {
                    if (err) {
                        console.error('插入失敗:', err.message, data);
                    }
                });
            })
            .on('end', () => {
                console.log('所有 CSV 資料已插入完畢！');
                // 驗證前5筆
                db.all('SELECT * FROM big_mac_index LIMIT 5', [], (err, rows) => {
                    if (err) throw err;
                    console.log('前5筆資料:', rows);
                    db.close();
                });
            });
    });
});
