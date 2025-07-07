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

// 註解: 移除直接啟動服務器的代碼，改為匯出 app 實例
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });

// 註解: 匯出 Express 應用實例，供 bin/www 使用
module.exports = app;
