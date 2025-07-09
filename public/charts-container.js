/**
 * Charts Container - 數據預處理與地圖渲染模組
 * 專門處理 Choropleth Map 的數據預處理和渲染邏輯
 */

class ChoroplethMapRenderer {
  constructor() {
    this.countryCoordinates = this.initCountryCoordinates();
    // 修改：調整分類門檻，使用百分比偏差概念
    this.colorThresholds = {
      undervalued: -10,    // USD_adjusted ≤ -10% (貨幣被低估)
      overvalued: 10       // USD_adjusted ≥ +10% (貨幣被高估)
    };
    this.colors = {
      undervalued: 'rgba(34, 197, 94, 0.8)',   // 綠色 - 被低估 (≤ -10%)
      neutral: 'rgba(251, 146, 60, 0.8)',      // 橙色 - 合理 (-10% ~ +10%)
      overvalued: 'rgba(239, 68, 68, 0.8)'     // 紅色 - 被高估 (≥ +10%)
    };
  }

  /**
   * 初始化國家座標數據（大幅擴展版本）
   */
  initCountryCoordinates() {
    return {
      // 主要經濟體
      'United States': [39.8283, -98.5795],
      'China': [35.8617, 104.1954],
      'Japan': [36.2048, 138.2529],
      'United Kingdom': [55.3781, -3.4360],
      'Germany': [51.1657, 10.4515],
      'France': [46.6034, 1.8883],
      'Canada': [56.1304, -106.3468],
      'Australia': [-25.2744, 133.7751],
      'Brazil': [-14.2350, -51.9253],
      'India': [20.5937, 78.9629],
      'Russia': [61.5240, 105.3188],
      'Italy': [41.8719, 12.5674],

      // 亞太地區
      'South Korea': [35.9078, 127.7669],
      'Thailand': [15.8700, 100.9925],
      'Malaysia': [4.2105, 101.9758],
      'Singapore': [1.3521, 103.8198],
      'Indonesia': [-0.7893, 113.9213],
      'Philippines': [12.8797, 121.7740],
      'Taiwan': [23.6978, 120.9605],
      'Hong Kong': [22.3193, 114.1694],

      // 歐洲
      'Switzerland': [46.8182, 8.2275],
      'Sweden': [60.1282, 18.6435],
      'Norway': [60.4720, 8.4689],
      'Denmark': [56.2639, 9.5018],
      'Netherlands': [52.1326, 5.2913],
      'Belgium': [50.5039, 4.4699],
      'Austria': [47.5162, 14.5501],
      'Spain': [40.4637, -3.7492],
      'Portugal': [39.3999, -8.2245],
      'Poland': [51.9194, 19.1451],
      'Czech Republic': [49.8175, 15.4730],
      'Hungary': [47.1625, 19.5033],
      'Finland': [61.9241, 25.7482],
      'Ireland': [53.1424, -7.6921],
      'Greece': [39.0742, 21.8243],

      // 美洲
      'Mexico': [23.6345, -102.5528],
      'Argentina': [-38.4161, -63.6167],
      'Chile': [-35.6751, -71.5430],
      'Colombia': [4.5709, -74.2973],
      'Peru': [-9.1900, -75.0152],
      'Venezuela': [6.4238, -66.5897],
      'Uruguay': [-32.5228, -55.7658],
      'Ecuador': [-1.8312, -78.1834],
      'Bolivia': [-16.2902, -63.5887],
      'Paraguay': [-23.4425, -58.4438],

      // 中東與非洲
      'Turkey': [38.9637, 35.2433],
      'Israel': [31.0461, 34.8516],
      'Saudi Arabia': [23.8859, 45.0792],
      'United Arab Emirates': [23.4241, 53.8478],
      'South Africa': [-30.5595, 22.9375],
      'Egypt': [26.0975, 30.0444],
      'Morocco': [31.7917, -7.0926],
      'Nigeria': [9.0820, 8.6753],
      'Kenya': [-0.0236, 37.9062],
      'Ghana': [7.9465, -1.0232],

      // 其他重要國家
      'New Zealand': [-40.9006, 174.8860],
      'Ukraine': [48.3794, 31.1656],
      'Romania': [45.9432, 24.9668],
      'Bulgaria': [42.7339, 25.4858],
      'Croatia': [45.1000, 15.2000],
      'Serbia': [44.0165, 21.0059],
      'Moldova': [47.4116, 28.3699],
      'Azerbaijan': [40.1431, 47.5769],
      'Georgia': [42.3154, 43.3569],
      'Lebanon': [33.8547, 35.8623],
      'Jordan': [30.5852, 36.2384],
      'Pakistan': [30.3753, 69.3451],
      'Sri Lanka': [7.8731, 80.7718],
      'Bangladesh': [23.6850, 90.3563],
      'Vietnam': [14.0583, 108.2772],
      'Guatemala': [15.7835, -90.2308],
      'Honduras': [15.2000, -86.2419],
      'Nicaragua': [12.2650, -85.2072],
      'Costa Rica': [9.7489, -83.7534],
      'Panama': [8.4380, -80.9821],

      // 額外補充
      'Estonia': [58.5953, 25.0136],
      'Latvia': [56.8796, 24.6032],
      'Lithuania': [55.1694, 23.8813],
      'Slovenia': [46.1512, 14.9955],
      'Slovakia': [48.6690, 19.6990],
      'Iceland': [64.9631, -19.0208],
      'Luxembourg': [49.8153, 6.1296],
      'Cyprus': [35.1264, 33.4299],
      'Malta': [35.9375, 14.3754],
      'Belarus': [53.7098, 27.9534],
      'Armenia': [40.0691, 45.0382],
      'Kazakhstan': [48.0196, 66.9237],
      'Uzbekistan': [41.3775, 64.5853],
      'Mongolia': [47.1164, 106.9057],
      'Cambodia': [12.5657, 104.9910],
      'Laos': [19.8563, 102.4955],
      'Myanmar': [21.9162, 95.9560],
      'Nepal': [28.3949, 84.1240],
      'Bhutan': [27.5142, 90.4336],
      'Maldives': [3.2028, 73.2207],
      'Brunei': [4.5353, 114.7277],
      'Tunisia': [33.8869, 9.5375],
      'Algeria': [28.0339, 1.6596],
      'Libya': [26.3351, 17.2283],
      'Sudan': [12.8628, 30.2176],
      'Ethiopia': [9.1450, 40.4897],
      'Tanzania': [-6.3690, 34.8888],
      'Uganda': [1.3733, 32.2903],
      'Rwanda': [-1.9403, 29.8739],
      'Botswana': [-22.3285, 24.6849],
      'Namibia': [-22.9576, 18.4904],
      'Zambia': [-13.1339, 27.8493],
      'Zimbabwe': [-19.0154, 29.1549],
      'Madagascar': [-18.7669, 46.8691],
      'Mauritius': [-20.3484, 57.5522],
      'Seychelles': [-4.6796, 55.4920]
    };
  }

  /**
   * 預處理 Choropleth 數據
   * @param {Array} rawData - 原始數據
   * @returns {Object} 處理後的數據
   */
  preprocessChoroplethData(rawData) {
    if (!rawData || !Array.isArray(rawData)) {
      console.warn('ChoroplethMapRenderer: 無效的原始數據');
      return { validData: [], invalidData: [], statistics: {} };
    }

    const validData = [];
    const invalidData = [];
    const statistics = {
      total: rawData.length,
      undervalued: 0,
      neutral: 0,
      overvalued: 0,
      noCoordinates: 0,
      invalidUSDValue: 0
    };

    rawData.forEach(item => {
      const { name, USD_adjusted } = item;

      // 檢查 USD_adjusted 是否有效
      if (typeof USD_adjusted !== 'number' || isNaN(USD_adjusted)) {
        invalidData.push({ ...item, reason: 'Invalid USD_adjusted value' });
        statistics.invalidUSDValue++;
        return;
      }

      // 檢查是否有座標資料
      const coordinates = this.countryCoordinates[name];
      if (!coordinates) {
        invalidData.push({ ...item, reason: 'No coordinates found' });
        statistics.noCoordinates++;
        return;
      }

      // 修改：USD_adjusted 本身已經是百分比數據，直接使用
      const percentageDeviation = USD_adjusted;

      // 分類統計（使用新的門檻）
      if (percentageDeviation <= this.colorThresholds.undervalued) {
        statistics.undervalued++;
      } else if (percentageDeviation >= this.colorThresholds.overvalued) {
        statistics.overvalued++;
      } else {
        statistics.neutral++;
      }

      // 計算渲染屬性
      const processedItem = {
        ...item,
        coordinates,
        percentageDeviation, // 新增：百分比偏差值
        color: this.getColorByValue(percentageDeviation),
        radius: this.getRadiusByValue(percentageDeviation),
        category: this.getCategoryByValue(percentageDeviation),
        categoryEmoji: this.getCategoryEmoji(percentageDeviation),
        categoryText: this.getCategoryText(percentageDeviation)
      };

      validData.push(processedItem);
    });

    return {
      validData,
      invalidData,
      statistics,
      hasData: validData.length > 0
    };
  }

  /**
   * 修改：根據百分比偏差值獲取顏色
   */
  getColorByValue(percentageDeviation) {
    if (percentageDeviation <= this.colorThresholds.undervalued) {
      return this.colors.undervalued;
    } else if (percentageDeviation >= this.colorThresholds.overvalued) {
      return this.colors.overvalued;
    } else {
      return this.colors.neutral;
    }
  }

  /**
   * 修改：根據百分比偏差值計算圓圈大小
   */
  getRadiusByValue(percentageDeviation) {
    const absDeviation = Math.abs(percentageDeviation);
    // 基於百分比偏差計算大小：偏差越大，圓圈越大
    return Math.max(8, Math.min(25, 8 + (absDeviation / 10) * 15));
  }

  /**
   * 修改：根據百分比偏差值獲取分類
   */
  getCategoryByValue(percentageDeviation) {
    if (percentageDeviation <= this.colorThresholds.undervalued) {
      return 'undervalued';
    } else if (percentageDeviation >= this.colorThresholds.overvalued) {
      return 'overvalued';
    } else {
      return 'neutral';
    }
  }

  /**
   * 修改：獲取分類表情符號
   */
  getCategoryEmoji(percentageDeviation) {
    if (percentageDeviation <= this.colorThresholds.undervalued) {
      return '🟢';
    } else if (percentageDeviation >= this.colorThresholds.overvalued) {
      return '🔴';
    } else {
      return '🟠';
    }
  }

  /**
   * 修改：獲取分類文字描述
   */
  getCategoryText(percentageDeviation) {
    if (percentageDeviation <= this.colorThresholds.undervalued) {
      return '貨幣被低估';
    } else if (percentageDeviation >= this.colorThresholds.overvalued) {
      return '貨幣被高估';
    } else {
      return '價值合理';
    }
  }

  /**
   * 渲染 Choropleth Map
   * @param {string} containerId - 地圖容器 ID
   * @param {Object} processedData - 預處理後的數據
   * @returns {Object} Leaflet 地圖實例
   */
  renderMap(containerId, processedData) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
      console.error(`ChoroplethMapRenderer: 找不到容器 ${containerId}`);
      return null;
    }

    if (!processedData.hasData) {
      console.warn('ChoroplethMapRenderer: 沒有有效數據可渲染');
      mapContainer.innerHTML = '<div class="no-data-message">📊 暫無有效的地圖數據</div>';
      return null;
    }

    // 清空容器
    mapContainer.innerHTML = '';

    try {
      // 建立地圖
      const map = L.map(mapContainer, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      }).setView([20, 0], 2);

      // 添加地圖瓦片圖層
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Big Mac Index Data'
      }).addTo(map);

      // 添加控制器和圖例
      this.addLegend(map, processedData.statistics);
      this.addInfoControl(map);

      // 渲染數據點
      const markers = this.renderDataPoints(map, processedData.validData);

      // 調整地圖視野
      this.fitMapBounds(map, processedData.validData);

      // 生成渲染報告
      const report = {
        success: true,
        timestamp: new Date().toISOString(),
        validPoints: processedData.validData.length,
        invalidPoints: processedData.invalidData.length,
        statistics: processedData.statistics,
        issues: {
          missingCountries: processedData.invalidData
            .filter(item => item.reason === 'No coordinates found')
            .map(item => item.name)
        }
      };

      console.log('✅ ChoroplethMapRenderer: 地圖渲染完成', report);

      return { map, report, markers };

    } catch (error) {
      console.error('❌ ChoroplethMapRenderer: 地圖渲染失敗', error);
      mapContainer.innerHTML = `<div class="error-message">❌ 地圖載入失敗: ${error.message}</div>`;
      return {
        map: null,
        report: {
          success: false,
          error: error.message,
          statistics: processedData.statistics
        }
      };
    }
  }

  /**
   * 渲染數據點到地圖上
   */
  renderDataPoints(map, validData) {
    const markers = [];

    validData.forEach(item => {
      const { name, coordinates, color, radius, USD_adjusted, categoryEmoji, categoryText } = item;
      const [lat, lng] = coordinates;

      // 創建圓形標記
      const marker = L.circleMarker([lat, lng], {
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.7,
        radius: radius
      });

      // 創建詳細的彈出窗口內容
      const popupContent = this.createPopupContent(item);
      marker.bindPopup(popupContent);

      // 添加鼠標懸停效果
      marker.on('mouseover', function() {
        this.setStyle({
          weight: 3,
          fillOpacity: 0.9,
          radius: radius + 2
        });
      });

      marker.on('mouseout', function() {
        this.setStyle({
          weight: 2,
          fillOpacity: 0.7,
          radius: radius
        });
      });

      marker.addTo(map);
      markers.push(marker);
    });

    return markers;
  }

  /**
   * 修改：創建彈出窗口內容
   */
  createPopupContent(item) {
    const { name, USD_adjusted, percentageDeviation, categoryEmoji, categoryText, local_price, currency_code, dollar_price } = item;

    return `
      <div class="map-popup">
        <h4>${categoryEmoji} ${name}</h4>
        <div class="popup-content">
          <div class="status-badge status-${item.category}">
            ${categoryText}
          </div>
          <table class="popup-table">
            <tr>
              <td><strong>USD 調整值:</strong></td>
              <td>${USD_adjusted?.toFixed(3) || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>偏差程度:</strong></td>
              <td>${percentageDeviation >= 0 ? '+' : ''}${percentageDeviation?.toFixed(1) || 'N/A'}%</td>
            </tr>
            ${local_price ? `
            <tr>
              <td><strong>當地價格:</strong></td>
              <td>${local_price} ${currency_code || ''}</td>
            </tr>
            ` : ''}
            ${dollar_price ? `
            <tr>
              <td><strong>美元價格:</strong></td>
              <td>$${dollar_price}</td>
            </tr>
            ` : ''}
          </table>
          <div class="explanation">
            ${this.getValueExplanation(percentageDeviation)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 修改：獲取數值解釋說明（使用百分比偏差）
   */
  getValueExplanation(percentageDeviation) {
    if (percentageDeviation <= -20) {
      return '🔽 貨幣嚴重被低估，大麥克價格相對非常便宜';
    } else if (percentageDeviation <= -10) {
      return '📉 貨幣被低估，具有價格優勢';
    } else if (percentageDeviation >= 20) {
      return '🔺 貨幣嚴重被高估，大麥克價格相對非常昂貴';
    } else if (percentageDeviation >= 10) {
      return '📈 貨幣被高估，價格偏高';
    } else {
      return '⚖️ 貨幣價值在合理範圍內';
    }
  }

  /**
   * 調整地圖視野以適應所有數據點
   */
  fitMapBounds(map, validData) {
    if (validData.length === 0) return;

    const coordinates = validData.map(item => item.coordinates);
    const bounds = L.latLngBounds(coordinates);

    // 添加適當的邊距
    map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 6
    });
  }

  /**
   * 修改：添加圖例
   */
  addLegend(map, statistics) {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div class="legend-header">
          <strong>🗺️ 貨幣高低估指標</strong>
        </div>
        <div class="legend-items">
          <div class="legend-item">
            <i style="background: ${this.colors.undervalued}"></i>
            <span>被低估 (≤ -10%)</span>
            <strong>${statistics.undervalued} 國</strong>
          </div>
          <div class="legend-item">
            <i style="background: ${this.colors.neutral}"></i>
            <span>價值合理 (-10% ~ +10%)</span>
            <strong>${statistics.neutral} 國</strong>
          </div>
          <div class="legend-item">
            <i style="background: ${this.colors.overvalued}"></i>
            <span>被高估 (≥ +10%)</span>
            <strong>${statistics.overvalued} 國</strong>
          </div>
        </div>
        <div class="legend-footer">
          <small>📊 總計: ${statistics.total} 國家/地區</small>
          ${statistics.noCoordinates > 0 ? 
            `<small style="color: #f59e0b;">⚠️ ${statistics.noCoordinates} 國缺少座標資料</small>` : 
            ''
          }
        </div>
      `;
      return div;
    };
    legend.addTo(map);
  }

  /**
   * 添加信息控制器 - 顯示地圖使用說明
   */
  addInfoControl(map) {
    const info = L.control({ position: 'topright' });
    info.onAdd = () => {
      const div = L.DomUtil.create('div', 'info-control');
      div.innerHTML = `
        <div class="info-header">
          <strong>📋 使用說明</strong>
          <button class="info-toggle" onclick="this.parentElement.nextElementSibling.style.display = this.parentElement.nextElementSibling.style.display === 'none' ? 'block' : 'none'">ℹ️</button>
        </div>
        <div class="info-content" style="display: none;">
          <ul>
            <li>🖱️ 點擊圓點查看詳細資訊</li>
            <li>🎯 圓點大小反映偏離程度</li>
            <li>🎨 顏色表示高低估狀態</li>
            <li>🔍 使用滾輪縮放地圖</li>
          </ul>
        </div>
      `;
      return div;
    };
    info.addTo(map);
  }

  /**
   * 生成統計報告
   */
  generateStatisticsReport(processedData) {
    const { statistics, invalidData } = processedData;

    return {
      summary: {
        total: statistics.total,
        valid: statistics.undervalued + statistics.neutral + statistics.overvalued,
        invalid: statistics.invalidUSDValue + statistics.noCoordinates
      },
      distribution: {
        undervalued: statistics.undervalued,
        neutral: statistics.neutral,
        overvalued: statistics.overvalued
      },
      issues: {
        noCoordinates: statistics.noCoordinates,
        invalidUSDValue: statistics.invalidUSDValue,
        missingCountries: invalidData.filter(item => item.reason === 'No coordinates found').map(item => item.name)
      }
    };
  }
}

// 全域實例和便利函數
window.ChoroplethMapRenderer = ChoroplethMapRenderer;

/**
 * 便利函數：快速創建 Choropleth Map
 * @param {string} containerId - 容器 ID
 * @param {Array} rawData - 原始數據
 * @returns {Object} 地圖實例和報告
 */
window.createChoroplethMap = function(containerId, rawData) {
  const renderer = new ChoroplethMapRenderer();
  const processedData = renderer.preprocessChoroplethData(rawData);
  return renderer.renderMap(containerId, processedData);
};

/**
 * 便利函數：更新現有地圖數據
 * @param {Object} mapInstance - 現有地圖實例
 * @param {Array} newRawData - 新的原始數據
 * @returns {Object} 更新結果
 */
window.updateChoroplethMap = function(mapInstance, newRawData) {
  if (!mapInstance) {
    console.error('updateChoroplethMap: 無效的地圖實例');
    return { success: false };
  }

  const renderer = new ChoroplethMapRenderer();
  const processedData = renderer.preprocessChoroplethData(newRawData);

  // 清除現有標記
  mapInstance.eachLayer(layer => {
    if (layer instanceof L.CircleMarker) {
      mapInstance.removeLayer(layer);
    }
  });

  // 添加新標記
  const markers = renderer.renderDataPoints(mapInstance, processedData.validData);
  renderer.fitMapBounds(mapInstance, processedData.validData);

  return {
    success: true,
    markers,
    statistics: processedData.statistics
  };
};
