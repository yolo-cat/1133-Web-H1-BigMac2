1. 安裝 sqlite3 並新增到 package.json
2. 在 db.js 中，使用 sqlite3 來操作資料庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
3. 若資料庫不存在，就新增資料庫
4. 在 db.js 中，若`*big_mac_index*` table 不存在，則會自動建立一個新的table
   table scheme 如下

date	iso_a3	currency_code	name	local_price	dollar_ex	dollar_price	USD_raw	EUR_raw	GBP_raw	JPY_raw	CNY_raw	GDP_bigmac	adj_price	USD_adjusted	EUR_adjusted	GBP_adjusted	JPY_adjusted	CNY_adjusted


```sql
CREATE TABLE big_mac_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    movie_name TEXT NOT NULL,
    quote TEXT NOT NULL,
    votes INTEGER DEFAULT 0
);
```

5. 在 db.js 中，用 SQLite 在 big_mac_index table 新增以下資料
   欄位名稱

```sql
CREATE TABLE big_mac_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    movie_name TEXT NOT NULL,
    quote TEXT NOT NULL,
    votes INTEGER DEFAULT 0
);
```
資料如下，請使用雙引號來表達字串

```
廖旼謙	花束般的戀愛	我們一路走來的風景很美，就只差了一步
李振維	王牌冤家	Blessed are the forgetful, for they get the better even of their blunders。
陳俊諳	鐵達尼號	You jump ,I jump
陶子中	愛在午夜希臘時	不要在愛情上浪費太多時間，友誼與工作會給你帶來更多快樂。
廖卿秀	喜劇之王	我養你啊
簡鍵帆	大話西游	曾經有一份真摯的愛情擺在我面前，我沒有去珍惜，等到失去了才後悔莫及，人世間最痛苦的事莫過於此。如果上天能給我一個再來一次的機會，我會對那個女孩說：我愛你。如果非要在這份愛上加上一個期限，我希望是一萬年。
蕭方雯	真愛挑日子	無論明天發生什麼事，至少我們擁有當下。
周彥廷	殭屍先生	人鬼殊途，人和鬼是不能在一起的．你和他在一起只會害了他
游程鈞	戀夏500日	Some people are meant to fall in love with each other, but not meant to be together.
林政佑	樂來樂愛你	你為什麼把『浪漫』說得像是個骯髒的詞？
謝依晴	霍爾的移動城堡	無論你變成什麼樣子，我都愛你。
陳亭瑜	After	Whatever our souls are made of, his and mine are the same
陳韋翰	刻在你心底的名字	你喜歡女生就可以,我喜歡男生就不行。你有多愛一點,我有少愛一點嗎?
廖卿如	新娘不是我	如果你愛上某人你就說出來，你立刻說出來，大聲地說出來。不然你就會錯過時機了。
周說	蜘蛛人	能力越大，責任越大！
張郁眉	鬼怪	跟你在一起的時間全部都很耀眼。因為天氣好，因為天氣不好，因為天氣剛剛好，每一天，都是美好的。
```
6.執行 db.js
7.驗證 資料庫抓取資料是否成功