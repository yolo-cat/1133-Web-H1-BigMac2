/**
 * 圖表計算工具函數
 * 用於計算 Big Mac Index 價格增長幅度和相對價格
 */

/**
 * 計算價格增長幅度
 * @param {Array} data - 已排序的價格數據陣列，包含 date 和 local_price 欄位
 * @returns {Array} - 包含日期和增長幅度的數據陣列
 */
function calculateGrowthRate(data) {
  // 註解: 確保數據按日期排序
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  const growthData = [];

  for (let i = 1; i < sortedData.length; i++) {
    const currentPrice = parseFloat(sortedData[i].local_price);
    const previousPrice = parseFloat(sortedData[i - 1].local_price);

    // 註解: 計算增長幅度 = (當前價格 - 前一年價格) / 前一年價格 * 100
    if (previousPrice !== 0 && !isNaN(currentPrice) && !isNaN(previousPrice)) {
      const growthRate = ((currentPrice - previousPrice) / previousPrice) * 100;

      growthData.push({
        date: sortedData[i].date,
        growthRate: growthRate.toFixed(2) // 保留兩位小數
      });
    }
  }

  return growthData;
}

/**
 * 為圖表準備增長幅度數據
 * @param {Array} rawData - 原始數據
 * @returns {Object} - 包含標籤和數據的物件
 */
function prepareGrowthChartData(rawData) {
  const growthData = calculateGrowthRate(rawData);

  return {
    labels: growthData.map(item => item.date),
    data: growthData.map(item => parseFloat(item.growthRate))
  };
}

/**
 * 計算相對價格
 * @param {Array} data - 已排序的價格數據陣列，包含 date 和 local_price 欄位
 * @returns {Array} - 包含日期和相對價格的數據陣列
 */
function calculateRelativePrice(data) {
  // 註解: 確保數據按日期排序
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  const relativePriceData = [];

  if (sortedData.length === 0) return relativePriceData;

  // 註解: 取得最早的價格作為基準
  const firstLocalPrice = parseFloat(sortedData[0].local_price);

  if (isNaN(firstLocalPrice) || firstLocalPrice === 0) {
    console.warn('第一個價格數據無效或為零，無法計算相對價格');
    return relativePriceData;
  }

  for (let i = 0; i < sortedData.length; i++) {
    const currentPrice = parseFloat(sortedData[i].local_price);

    // 註解: 計算相對價格 = (Local_Price - firstLocalPrice) / firstLocalPrice * 100
    if (!isNaN(currentPrice)) {
      const relativePrice = ((currentPrice - firstLocalPrice) / firstLocalPrice) * 100;

      relativePriceData.push({
        date: sortedData[i].date,
        relativePrice: relativePrice.toFixed(2) // 保留兩位小數
      });
    }
  }

  return relativePriceData;
}

/**
 * 為圖表準備相對價格數據
 * @param {Array} rawData - 原始數據
 * @returns {Object} - 包含標籤和數據的物件
 */
function prepareRelativePriceChartData(rawData) {
  const relativePriceData = calculateRelativePrice(rawData);

  return {
    labels: relativePriceData.map(item => item.date),
    data: relativePriceData.map(item => parseFloat(item.relativePrice))
  };
}

/**
 * 計算價格走勢（以第一期價格為基準 1）
 * @param {Array} data - 已排序的價格數據陣列，包含 date 和 local_price 欄位
 * @returns {Array} - 包含日期、相對價格、原始價格和變動幅度的數據陣列
 */
function calculatePriceTrend(data) {
  // 註解: 確保數據按日期排序
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  const trendData = [];

  if (sortedData.length === 0) return trendData;

  // 註解: 取得第一期價格作為基準（定義為 1）
  const firstLocalPrice = parseFloat(sortedData[0].local_price);

  if (isNaN(firstLocalPrice) || firstLocalPrice === 0) {
    console.warn('第一個價格數據無效或為零，無法計算價格走勢');
    return trendData;
  }

  for (let i = 0; i < sortedData.length; i++) {
    const currentPrice = parseFloat(sortedData[i].local_price);

    // 註解: 計算相對價格 = Local_Price / firstLocalPrice
    if (!isNaN(currentPrice)) {
      const relativePriceIndex = currentPrice / firstLocalPrice;

      // 註解: 計算變動幅度 = (relativePriceIndex - 1) * 100
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
}

/**
 * 為圖表準備價格走勢數據
 * @param {Array} rawData - 原始數據
 * @returns {Object} - 包含標籤、數據和額外資訊的物件
 */
function preparePriceTrendChartData(rawData) {
  const trendData = calculatePriceTrend(rawData);

  return {
    labels: trendData.map(item => item.date),
    data: trendData.map(item => parseFloat(item.relativePriceIndex)),
    originalPrices: trendData.map(item => item.originalPrice),
    changePercentages: trendData.map(item => item.changePercentage)
  };
}

// 註解: 如果是在瀏覽器環境中使用，將函數掛載到 window 物件
if (typeof window !== 'undefined') {
  window.ChartComputed = {
    calculateGrowthRate,
    prepareGrowthChartData,
    calculateRelativePrice,
    prepareRelativePriceChartData,
    calculatePriceTrend,
    preparePriceTrendChartData
  };
}

// 註解: 如果是在 Node.js 環境中使用，使用 module.exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateGrowthRate,
    prepareGrowthChartData,
    calculateRelativePrice,
    prepareRelativePriceChartData,
    calculatePriceTrend,
    preparePriceTrendChartData
  };
}
