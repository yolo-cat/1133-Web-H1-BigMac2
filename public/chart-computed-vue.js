/**
 * Vue 3 圖表計算組合式函數 (Composable)
 * 僅用於計算 Big Mac Index 價格走勢（Price Trend）
 */

export function useChartComputed() {
  /**
   * 計算價格走勢（Price Trend）
   * 以第一年價格為基準（1），計算每一年價格的相對指數與變動幅度
   * relativePriceIndex = 當前價格 / 第一年的價格
   * changePercentage = (relativePriceIndex - 1) * 100
   * 例如：2022 年 relativePriceIndex = 60/50 = 1.2，changePercentage = (1.2-1)*100 = 20.00%
   * @param {Array} data - 已排序的價格數據陣列，包含 date 和 local_price 欄位
   * @returns {Array} - 包含日期、相對價格指數、原始價格和變動幅度的數據陣列
   */
  const calculatePriceTrend = (data) => {
    const sortedData = data.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const trendData = [];

    if (sortedData.length === 0) return trendData;

    // 取得第一年價格作為基準（定義為 1）
    const firstLocalPrice = parseFloat(sortedData[0].local_price);

    if (isNaN(firstLocalPrice) || firstLocalPrice === 0) {
      console.warn('第一個價格數據無效或為零，無法計算價格走勢');
      return trendData;
    }

    for (let i = 0; i < sortedData.length; i++) {
      const currentPrice = parseFloat(sortedData[i].local_price);

      // 計算相對價格指數 = 當前價格 / 第一年的價格
      if (!isNaN(currentPrice)) {
        const relativePriceIndex = currentPrice / firstLocalPrice;

        // 計算變動幅度 = (relativePriceIndex - 1) * 100
        const changePercentage = (relativePriceIndex - 1) * 100;

        trendData.push({
          date: sortedData[i].date,
          relativePriceIndex: relativePriceIndex.toFixed(4), // 保留四位小數
          originalPrice: currentPrice.toFixed(2), // 原始價格
          changePercentage: changePercentage.toFixed(2) // 變動幅度百分比
        });
      }
    }

    return trendData;
  };

  /**
   * 為圖表準備價格走勢數據
   * @param {Array} rawData - 原始數據
   * @returns {Object} - 包含標籤、數據和額外資訊的物件
   */
  const preparePriceTrendChartData = (rawData) => {
    const trendData = calculatePriceTrend(rawData);

    return {
      labels: trendData.map(item => item.date),
      data: trendData.map(item => parseFloat(item.relativePriceIndex)),
      originalPrices: trendData.map(item => item.originalPrice),
      changePercentages: trendData.map(item => item.changePercentage)
    };
  };

  // 僅返回價格走勢相關方法
  return {
    calculatePriceTrend,
    preparePriceTrendChartData
  };
}

// 驗證單元測試（僅供開發時驗證，正式可移除）
if (typeof window !== 'undefined' && !window.__CHART_COMPUTED_TESTED__) {
  window.__CHART_COMPUTED_TESTED__ = true;
  const testData = [
    { date: '2020', local_price: 50 },
    { date: '2021', local_price: 55 },
    { date: '2022', local_price: 60 }
  ];
  const cc = useChartComputed();
  // 價格走勢: 2020=1, 2021=1.1, 2022=1.2
  console.assert(cc.calculatePriceTrend(testData)[1].relativePriceIndex === '1.1000', 'PriceTrend 2021 應為 1.1000');
  console.assert(cc.calculatePriceTrend(testData)[2].relativePriceIndex === '1.2000', 'PriceTrend 2022 應為 1.2000');
}
