var express = require('express');
var path = require('path');
var router = express.Router();
var db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

/* API: 取得所有國家/地區名稱 */
router.get('/api/names', function(req, res, next) {
  const sql = 'SELECT DISTINCT name FROM bigmac ORDER BY name';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }
    const names = rows.map(row => row.name);
    res.json(names);
  });
});

/* API: 根據國家名稱查詢 Big Mac 資料 */
router.get('/api/bigmac', function(req, res, next) {
  const { name, year, startYear, endYear } = req.query;

  let sql = 'SELECT * FROM bigmac WHERE 1=1';
  let params = [];

  if (name) {
    sql += ' AND name = ?';
    params.push(name);
  }

  if (year) {
    sql += ' AND substr(date, 1, 4) = ?';
    params.push(year);
  }

  if (startYear && endYear) {
    sql += ' AND substr(date, 1, 4) BETWEEN ? AND ?';
    params.push(startYear, endYear);
  } else if (startYear) {
    sql += ' AND substr(date, 1, 4) >= ?';
    params.push(startYear);
  } else if (endYear) {
    sql += ' AND substr(date, 1, 4) <= ?';
    params.push(endYear);
  }

  sql += ' ORDER BY date';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }
    res.json(rows);
  });
});

/* API: 取得最新的 USD 調整值資料，用於全球貨幣高低估地理分布圖 */
router.get('/api/latest-usd-adjusted', function(req, res, next) {
  // 先獲取最新日期
  const latestDateSql = 'SELECT MAX(date) as latest_date FROM bigmac WHERE USD_adjusted IS NOT NULL';

  db.get(latestDateSql, [], (err, row) => {
    if (err) {
      console.error('取得最新日期錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }

    if (!row || !row.latest_date) {
      res.status(404).json({ error: '找不到有效的 USD 調整值資料' });
      return;
    }

    const latestDate = row.latest_date;

    // 獲取最新日期的所有國家 USD 調整值資料
    const sql = `
      SELECT 
        name, 
        USD_adjusted, 
        local_price, 
        currency_code, 
        dollar_price,
        date
      FROM bigmac 
      WHERE date = ? AND USD_adjusted IS NOT NULL
      ORDER BY name
    `;

    db.all(sql, [latestDate], (err, rows) => {
      if (err) {
        console.error('SQL 錯誤:', err.message);
        res.status(500).json({ error: '資料庫查詢失敗' });
        return;
      }

      const response = {
        date: latestDate,
        data: rows,
        count: rows.length
      };

      res.json(response);
    });
  });
});

/* API: 取得全球大麥克統計資料（最貴、最便宜、最超值） */
router.get('/api/global-stats', function(req, res, next) {
  // 先獲取最新日期
  const latestDateSql = 'SELECT MAX(date) as latest_date FROM bigmac WHERE dollar_price IS NOT NULL AND USD_adjusted IS NOT NULL';

  db.get(latestDateSql, [], (err, dateRow) => {
    if (err) {
      console.error('取得最新日期錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }

    if (!dateRow || !dateRow.latest_date) {
      res.status(404).json({ error: '找不到有效的統計資料' });
      return;
    }

    const latestDate = dateRow.latest_date;

    // 獲取最新日期的統計數據
    const statsSql = `
      SELECT 
        name,
        dollar_price,
        local_price,
        currency_code,
        USD_adjusted
      FROM bigmac 
      WHERE date = ? 
        AND dollar_price IS NOT NULL 
        AND USD_adjusted IS NOT NULL
      ORDER BY dollar_price
    `;

    db.all(statsSql, [latestDate], (err, rows) => {
      if (err) {
        console.error('SQL 錯誤:', err.message);
        res.status(500).json({ error: '資料庫查詢失敗' });
        return;
      }

      if (rows.length === 0) {
        res.status(404).json({ error: '找不到統計資料' });
        return;
      }

      // 計算統計數據
      const mostExpensive = rows[rows.length - 1]; // 美元價格最高
      const cheapest = rows[0]; // 美元價格最低

      // 找到最超值（USD_adjusted 最低，即被最低估的）
      const bestValue = rows.reduce((min, current) => {
        return current.USD_adjusted < min.USD_adjusted ? current : min;
      });

      // 修正：USD_adjusted 已經是百分比形式的數據，直接使用
      const calculatePercentageDeviation = (usdAdjusted) => {
        return usdAdjusted;
      };

      const response = {
        hasData: true,
        date: latestDate,
        mostExpensive: {
          name: mostExpensive.name,
          dollar_price: mostExpensive.dollar_price,
          local_price: mostExpensive.local_price,
          currency_code: mostExpensive.currency_code,
          USD_adjusted: mostExpensive.USD_adjusted,
          percentageDeviation: calculatePercentageDeviation(mostExpensive.USD_adjusted)
        },
        cheapest: {
          name: cheapest.name,
          dollar_price: cheapest.dollar_price,
          local_price: cheapest.local_price,
          currency_code: cheapest.currency_code,
          USD_adjusted: cheapest.USD_adjusted,
          percentageDeviation: calculatePercentageDeviation(cheapest.USD_adjusted)
        },
        bestValue: {
                name: bestValue.name,
                dollar_price: bestValue.dollar_price,
                local_price: bestValue.local_price,
                currency_code: bestValue.currency_code,
                USD_adjusted: bestValue.USD_adjusted,
                percentageDeviation: calculatePercentageDeviation(bestValue.USD_adjusted)

        },
        totalCountries: rows.length
      };

      res.json(response);
    });
  });
});

/* API: 取得全球統計摘要 */
router.get('/api/global-summary', function(req, res, next) {
  const sql = `
    SELECT 
      COUNT(DISTINCT name) as total_countries,
      COUNT(DISTINCT date) as total_dates,
      MIN(date) as earliest_date,
      MAX(date) as latest_date,
      AVG(USD_adjusted) as avg_usd_adjusted,
      MIN(USD_adjusted) as min_usd_adjusted,
      MAX(USD_adjusted) as max_usd_adjusted
    FROM bigmac 
    WHERE USD_adjusted IS NOT NULL
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }
    res.json(row);
  });
});

/* API: 取得特定國家的歷史趨勢 */
router.get('/api/country-trend/:name', function(req, res, next) {
  const { name } = req.params;
  const { limit } = req.query;

  let sql = `
    SELECT 
      date,
      local_price,
      dollar_price,
      USD_adjusted,
      currency_code
    FROM bigmac 
    WHERE name = ? 
    ORDER BY date DESC
  `;

  let params = [name];

  if (limit && !isNaN(limit)) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }

    const response = {
      country: name,
      data: rows.reverse(), // 返回時間升序
      count: rows.length
    };

    res.json(response);
  });
});

/* API: 比較多個國家 */
router.get('/api/compare-countries', function(req, res, next) {
  const { countries, date } = req.query;

  if (!countries) {
    res.status(400).json({ error: '需要提供國家名稱參數' });
    return;
  }

  const countryList = Array.isArray(countries) ? countries : countries.split(',');
  const placeholders = countryList.map(() => '?').join(',');

  let sql = `
    SELECT 
      name,
      date,
      local_price,
      dollar_price,
      USD_adjusted,
      currency_code
    FROM bigmac 
    WHERE name IN (${placeholders})
  `;

  let params = countryList;

  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  }

  sql += ' ORDER BY name, date';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }

    const response = {
      countries: countryList,
      data: rows,
      count: rows.length
    };

    res.json(response);
  });
});

/* API: 取得貨幣分類統計 */
router.get('/api/currency-classification', function(req, res, next) {
  const { date } = req.query;

  let sql = `
    SELECT 
      name,
      USD_adjusted,
      CASE 
        WHEN USD_adjusted < 0.9 THEN 'undervalued'
        WHEN USD_adjusted > 1.1 THEN 'overvalued'
        ELSE 'neutral'
      END as classification
    FROM bigmac 
    WHERE USD_adjusted IS NOT NULL
  `;

  let params = [];

  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  } else {
    // 如果沒有指定日期，使用最新日期
    sql += ` AND date = (SELECT MAX(date) FROM bigmac WHERE USD_adjusted IS NOT NULL)`;
  }

  sql += ' ORDER BY USD_adjusted';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('SQL 錯誤:', err.message);
      res.status(500).json({ error: '資料庫查詢失敗' });
      return;
    }

    // 統計各分類數量
    const stats = {
      undervalued: 0,
      neutral: 0,
      overvalued: 0
    };

    rows.forEach(row => {
      stats[row.classification]++;
    });

    const response = {
      data: rows,
      statistics: stats,
      total: rows.length
    };

    res.json(response);
  });
});

module.exports = router;
