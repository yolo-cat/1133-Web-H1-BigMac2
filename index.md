1. 在 public/index.html 中，透過 /api/quotes，用 async/await fetch ，在最下方用 table 顯示 big_mac_index 所有資料。
2. 在 index.html 中，產生可以輸入"國家/地區" (name)、"當地價格"(local price)的表單，不使用 action。
3. 在 index.html 中，將上面表單的資料，透過 fetch async await 來發送 POST 請求到 /api/insert ，並在成功後，用 p 顯示伺服器回傳的【純文字】訊息，不是 json 。
