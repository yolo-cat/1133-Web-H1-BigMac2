const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
app.use(express.json());

// 靜態檔案服務，讓 public 資料夾自動對外公開
app.use(express.static('public'));

const db = new sqlite3.Database('./db/sqlite.db', (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
    } else {
        console.log('資料庫成功開啟');
    }
});

function getTodayDateStr() {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

// 1. 查詢 API：依 name 查詢
app.get('/api/bigmac', (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.status(400).json({ error: "請提供 name 參數" });
    }
    db.all('SELECT * FROM big_mac_index WHERE name = ?', [name], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.json(rows);
        }
    });
});

// 2. 更新 local_price 與日期 API
app.post('/api/update_local_price', (req, res) => {
    const { name, local_price } = req.body;
    if (!name || typeof local_price !== 'number') {
        return res.status(400).send('請提供 name 與 local_price（數字）');
    }

    const today = getTodayDateStr();

    db.get('SELECT id, date FROM big_mac_index WHERE name = ?', [name], (err, row) => {
        if (err) {
            res.status(500).send('資料庫錯誤');
        } else if (!row) {
            res.status(400).send('指定的 name 不存在');
        } else {
            if (today <= row.date) {
                res.status(400).send('更新日期不可早於或等於現有日期');
            } else {
                db.run(
                    'UPDATE big_mac_index SET local_price = ?, date = ? WHERE name = ?',
                    [local_price, today, name],
                    function(err) {
                        if (err) {
                            res.status(500).send('更新失敗');
                        } else {
                            res.send(`local_price 與 date 更新成功 (${today})`);
                        }
                    }
                );
            }
        }
    });
});

// 3. 新增資料 API：新增一筆 (date, local_price)
// 注意：本 API 僅示範新增，實際應用可擴充欄位
app.post('/api/update', (req, res) => {
    // 從請求取得 date 與 local_price
    const { date, local_price } = req.body;
    // 檢查參數
    if (!date || typeof local_price !== 'number') {
        // 回傳文字訊息（非 JSON）
        return res.status(400).send('請提供 date 與 local_price（數字）');
    }
    // 新增資料到 big_mac_index
    const sql = 'INSERT INTO big_mac_index (date, local_price) VALUES (?, ?)';
    db.run(sql, [date, local_price], function(err) {
        if (err) {
            // 回傳文字訊息（非 JSON）
            return res.status(500).send('新增失敗: ' + err.message);
        }
        // 回傳成功訊息（非 JSON）
        res.send(`成功新增一筆資料，ID: ${this.lastID}`);
    });
});

// 取得所有 name（國家/地區）API
app.get('/api/names', (req, res) => {
    db.all('SELECT DISTINCT name FROM big_mac_index ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows.map(r => r.name));
        }
    });
});

// 新增：取得最新日期的所有國家 USD_adjusted 數據，用於 Choropleth Map
app.get('/api/latest-usd-adjusted', (req, res) => {
    // 先查詢最新日期
    db.get('SELECT MAX(date) as latest_date FROM big_mac_index', [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const latestDate = row.latest_date;
        if (!latestDate) {
            res.json([]);
            return;
        }

        // 查詢該日期的所有國家數據
        db.all(
            'SELECT name, iso_a3, USD_adjusted FROM big_mac_index WHERE date = ? AND USD_adjusted IS NOT NULL ORDER BY name',
            [latestDate],
            (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({
                        date: latestDate,
                        data: rows
                    });
                }
            }
        );
    });
});

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// 註解: 移除直接啟動服務器的代碼，改為匯出 app 實例
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });

// 註解: 匯出 Express 應用實例，供 bin/www 使用
module.exports = app;
