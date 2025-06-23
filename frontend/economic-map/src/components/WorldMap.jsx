import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L, { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../config/api';

const WorldMap = () => {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 国データを取得
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/economic/countries`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            setCountryData(data.data);
          } else {
            // APIからデータが取得できない場合はフォールバックデータを使用
            setCountryData(generateFallbackData());
          }
        } else {
          setCountryData(generateFallbackData());
        }
      } catch (error) {
        console.error('国データの取得に失敗しました:', error);
        setCountryData(generateFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, []);

  // フォールバック用のサンプルデータ生成（座標付き）
  const generateFallbackData = () => {
    const sampleCountries = [
      // 上位20カ国（座標付き）
      { countryiso3code: 'USA', name: 'アメリカ合衆国', gdp_current_usd: 25462700000000, population: 331900000, gdp_per_capita: 76770, region: '北アメリカ', lat: 39.8283, lng: -98.5795 },
      { countryiso3code: 'CHN', name: '中国', gdp_current_usd: 17734100000000, population: 1412000000, gdp_per_capita: 12556, region: '東アジア・太平洋', lat: 35.8617, lng: 104.1954 },
      { countryiso3code: 'JPN', name: '日本', gdp_current_usd: 4940900000000, population: 125800000, gdp_per_capita: 39285, region: '東アジア・太平洋', lat: 36.2048, lng: 138.2529 },
      { countryiso3code: 'DEU', name: 'ドイツ', gdp_current_usd: 4259900000000, population: 83200000, gdp_per_capita: 51203, region: 'ヨーロッパ・中央アジア', lat: 51.1657, lng: 10.4515 },
      { countryiso3code: 'IND', name: 'インド', gdp_current_usd: 3385100000000, population: 1380000000, gdp_per_capita: 2451, region: '南アジア', lat: 20.5937, lng: 78.9629 },
      { countryiso3code: 'GBR', name: 'イギリス', gdp_current_usd: 3131400000000, population: 67500000, gdp_per_capita: 46410, region: 'ヨーロッパ・中央アジア', lat: 55.3781, lng: -3.4360 },
      { countryiso3code: 'FRA', name: 'フランス', gdp_current_usd: 2938300000000, population: 67750000, gdp_per_capita: 43518, region: 'ヨーロッパ・中央アジア', lat: 46.2276, lng: 2.2137 },
      { countryiso3code: 'ITA', name: 'イタリア', gdp_current_usd: 2107700000000, population: 59550000, gdp_per_capita: 35395, region: 'ヨーロッパ・中央アジア', lat: 41.8719, lng: 12.5674 },
      { countryiso3code: 'BRA', name: 'ブラジル', gdp_current_usd: 1608900000000, population: 215300000, gdp_per_capita: 7507, region: 'ラテンアメリカ・カリブ海', lat: -14.2350, lng: -51.9253 },
      { countryiso3code: 'CAN', name: 'カナダ', gdp_current_usd: 1988300000000, population: 38250000, gdp_per_capita: 51987, region: '北アメリカ', lat: 56.1304, lng: -106.3468 },
      { countryiso3code: 'RUS', name: 'ロシア', gdp_current_usd: 1775800000000, population: 146000000, gdp_per_capita: 12172, region: 'ヨーロッパ・中央アジア', lat: 61.5240, lng: 105.3188 },
      { countryiso3code: 'KOR', name: '韓国', gdp_current_usd: 1810900000000, population: 51780000, gdp_per_capita: 34980, region: '東アジア・太平洋', lat: 35.9078, lng: 127.7669 },
      { countryiso3code: 'ESP', name: 'スペイン', gdp_current_usd: 1397500000000, population: 47350000, gdp_per_capita: 29520, region: 'ヨーロッパ・中央アジア', lat: 40.4637, lng: -3.7492 },
      { countryiso3code: 'AUS', name: 'オーストラリア', gdp_current_usd: 1552700000000, population: 25690000, gdp_per_capita: 60443, region: '東アジア・太平洋', lat: -25.2744, lng: 133.7751 },
      { countryiso3code: 'MEX', name: 'メキシコ', gdp_current_usd: 1293000000000, population: 128900000, gdp_per_capita: 10030, region: 'ラテンアメリカ・カリブ海', lat: 23.6345, lng: -102.5528 },
      { countryiso3code: 'IDN', name: 'インドネシア', gdp_current_usd: 1289000000000, population: 273500000, gdp_per_capita: 4714, region: '東アジア・太平洋', lat: -0.7893, lng: 113.9213 },
      { countryiso3code: 'NLD', name: 'オランダ', gdp_current_usd: 909100000000, population: 17440000, gdp_per_capita: 52143, region: 'ヨーロッパ・中央アジア', lat: 52.1326, lng: 5.2913 },
      { countryiso3code: 'SAU', name: 'サウジアラビア', gdp_current_usd: 833500000000, population: 35000000, gdp_per_capita: 23814, region: '中東・北アフリカ', lat: 23.8859, lng: 45.0792 },
      { countryiso3code: 'TUR', name: 'トルコ', gdp_current_usd: 761400000000, population: 84340000, gdp_per_capita: 9027, region: 'ヨーロッパ・中央アジア', lat: 38.9637, lng: 35.2433 },
      { countryiso3code: 'TWN', name: '台湾', gdp_current_usd: 790700000000, population: 23570000, gdp_per_capita: 33565, region: '東アジア・太平洋', lat: 23.6978, lng: 120.9605 },
      
      // 中規模経済国
      { countryiso3code: 'CHE', name: 'スイス', gdp_current_usd: 812900000000, population: 8700000, gdp_per_capita: 93457, region: 'ヨーロッパ・中央アジア', lat: 46.8182, lng: 8.2275 },
      { countryiso3code: 'BEL', name: 'ベルギー', gdp_current_usd: 521000000000, population: 11590000, gdp_per_capita: 44967, region: 'ヨーロッパ・中央アジア', lat: 50.5039, lng: 4.4699 },
      { countryiso3code: 'POL', name: 'ポーランド', gdp_current_usd: 679400000000, population: 37970000, gdp_per_capita: 17896, region: 'ヨーロッパ・中央アジア', lat: 51.9194, lng: 19.1451 },
      { countryiso3code: 'ARG', name: 'アルゼンチン', gdp_current_usd: 487200000000, population: 45380000, gdp_per_capita: 10729, region: 'ラテンアメリカ・カリブ海', lat: -38.4161, lng: -63.6167 },
      { countryiso3code: 'IRL', name: 'アイルランド', gdp_current_usd: 498600000000, population: 5010000, gdp_per_capita: 99533, region: 'ヨーロッパ・中央アジア', lat: 53.4129, lng: -8.2439 },
      { countryiso3code: 'AUT', name: 'オーストリア', gdp_current_usd: 481200000000, population: 9040000, gdp_per_capita: 53268, region: 'ヨーロッパ・中央アジア', lat: 47.5162, lng: 14.5501 },
      { countryiso3code: 'ISR', name: 'イスラエル', gdp_current_usd: 481600000000, population: 9450000, gdp_per_capita: 50958, region: '中東・北アフリカ', lat: 31.0461, lng: 34.8516 },
      { countryiso3code: 'NGA', name: 'ナイジェリア', gdp_current_usd: 440800000000, population: 218500000, gdp_per_capita: 2018, region: 'サブサハラアフリカ', lat: 9.0820, lng: 8.6753 },
      { countryiso3code: 'NOR', name: 'ノルウェー', gdp_current_usd: 482200000000, population: 5420000, gdp_per_capita: 89023, region: 'ヨーロッパ・中央アジア', lat: 60.4720, lng: 8.4689 },
      { countryiso3code: 'ARE', name: 'アラブ首長国連邦', gdp_current_usd: 507500000000, population: 9890000, gdp_per_capita: 51308, region: '中東・北アフリカ', lat: 23.4241, lng: 53.8478 },
      { countryiso3code: 'EGY', name: 'エジプト', gdp_current_usd: 469400000000, population: 104300000, gdp_per_capita: 4503, region: '中東・北アフリカ', lat: 26.0975, lng: 30.0444 },
      { countryiso3code: 'ZAF', name: '南アフリカ', gdp_current_usd: 419000000000, population: 60420000, gdp_per_capita: 6937, region: 'サブサハラアフリカ', lat: -30.5595, lng: 22.9375 },
      { countryiso3code: 'MYS', name: 'マレーシア', gdp_current_usd: 432300000000, population: 32780000, gdp_per_capita: 13189, region: '東アジア・太平洋', lat: 4.2105, lng: 101.9758 },
      { countryiso3code: 'PHL', name: 'フィリピン', gdp_current_usd: 394100000000, population: 109600000, gdp_per_capita: 3597, region: '東アジア・太平洋', lat: 12.8797, lng: 121.7740 },
      { countryiso3code: 'SGP', name: 'シンガポール', gdp_current_usd: 396900000000, population: 5900000, gdp_per_capita: 67280, region: '東アジア・太平洋', lat: 1.3521, lng: 103.8198 },
      { countryiso3code: 'DNK', name: 'デンマーク', gdp_current_usd: 390700000000, population: 5830000, gdp_per_capita: 67018, region: 'ヨーロッパ・中央アジア', lat: 56.2639, lng: 9.5018 },
      { countryiso3code: 'BGD', name: 'バングラデシュ', gdp_current_usd: 460200000000, population: 166300000, gdp_per_capita: 2767, region: '南アジア', lat: 23.6850, lng: 90.3563 },
      { countryiso3code: 'FIN', name: 'フィンランド', gdp_current_usd: 297300000000, population: 5540000, gdp_per_capita: 53655, region: 'ヨーロッパ・中央アジア', lat: 61.9241, lng: 25.7482 },
      { countryiso3code: 'VNM', name: 'ベトナム', gdp_current_usd: 408800000000, population: 97340000, gdp_per_capita: 4200, region: '東アジア・太平洋', lat: 14.0583, lng: 108.2772 },
      { countryiso3code: 'CHL', name: 'チリ', gdp_current_usd: 317100000000, population: 19120000, gdp_per_capita: 16581, region: 'ラテンアメリカ・カリブ海', lat: -35.6751, lng: -71.5430 },
      { countryiso3code: 'ROU', name: 'ルーマニア', gdp_current_usd: 284100000000, population: 19120000, gdp_per_capita: 14858, region: 'ヨーロッパ・中央アジア', lat: 45.9432, lng: 24.9668 },
      { countryiso3code: 'CZE', name: 'チェコ', gdp_current_usd: 281800000000, population: 10700000, gdp_per_capita: 26337, region: 'ヨーロッパ・中央アジア', lat: 49.8175, lng: 15.4730 },
      { countryiso3code: 'NZL', name: 'ニュージーランド', gdp_current_usd: 249900000000, population: 5120000, gdp_per_capita: 48781, region: '東アジア・太平洋', lat: -40.9006, lng: 174.8860 },
      { countryiso3code: 'PER', name: 'ペルー', gdp_current_usd: 223300000000, population: 33000000, gdp_per_capita: 6769, region: 'ラテンアメリカ・カリブ海', lat: -9.1900, lng: -75.0152 },
      { countryiso3code: 'PRT', name: 'ポルトガル', gdp_current_usd: 249900000000, population: 10300000, gdp_per_capita: 24252, region: 'ヨーロッパ・中央アジア', lat: 39.3999, lng: -8.2245 },
      { countryiso3code: 'GRC', name: 'ギリシャ', gdp_current_usd: 189400000000, population: 10720000, gdp_per_capita: 17676, region: 'ヨーロッパ・中央アジア', lat: 39.0742, lng: 21.8243 },
      { countryiso3code: 'HUN', name: 'ハンガリー', gdp_current_usd: 181800000000, population: 9750000, gdp_per_capita: 18649, region: 'ヨーロッパ・中央アジア', lat: 47.1625, lng: 19.5033 },
      { countryiso3code: 'UKR', name: 'ウクライナ', gdp_current_usd: 200100000000, population: 43790000, gdp_per_capita: 4571, region: 'ヨーロッパ・中央アジア', lat: 48.3794, lng: 31.1656 },
      { countryiso3code: 'MAR', name: 'モロッコ', gdp_current_usd: 132700000000, population: 37460000, gdp_per_capita: 3542, region: '中東・北アフリカ', lat: 31.7917, lng: -7.0926 },
      { countryiso3code: 'KEN', name: 'ケニア', gdp_current_usd: 110300000000, population: 54000000, gdp_per_capita: 2042, region: 'サブサハラアフリカ', lat: -0.0236, lng: 37.9062 }
    ];
    return sampleCountries;
  };

  // 国のGDPに基づいて円のサイズを計算
  const getCircleRadius = (gdp) => {
    if (!gdp || gdp <= 0) return 8;
    const minRadius = 10;
    const maxRadius = 60;
    const minGdp = Math.min(...countryData.map(c => c.gdp_current_usd || 0).filter(g => g > 0));
    const maxGdp = Math.max(...countryData.map(c => c.gdp_current_usd || 0));
    
    const logGdp = Math.log(gdp);
    const logMinGdp = Math.log(minGdp);
    const logMaxGdp = Math.log(maxGdp);
    
    const normalizedSize = (logGdp - logMinGdp) / (logMaxGdp - logMinGdp);
    return minRadius + (maxRadius - minRadius) * normalizedSize;
  };

  // 国のGDPに基づいて色を計算
  const getCircleColor = (gdp) => {
    if (!gdp || gdp <= 0) return '#cccccc';
    
    const minGdp = Math.min(...countryData.map(c => c.gdp_current_usd || 0).filter(g => g > 0));
    const maxGdp = Math.max(...countryData.map(c => c.gdp_current_usd || 0));
    
    const logGdp = Math.log(gdp);
    const logMinGdp = Math.log(minGdp);
    const logMaxGdp = Math.log(maxGdp);
    
    const normalizedValue = (logGdp - logMinGdp) / (logMaxGdp - logMinGdp);
    
    // 色のグラデーション（青→緑→黄→赤）
    if (normalizedValue < 0.25) {
      const ratio = normalizedValue / 0.25;
      return `rgb(${Math.round(0 + 100 * ratio)}, ${Math.round(100 + 155 * ratio)}, 255)`;
    } else if (normalizedValue < 0.5) {
      const ratio = (normalizedValue - 0.25) / 0.25;
      return `rgb(${Math.round(100 + 155 * ratio)}, 255, ${Math.round(255 - 255 * ratio)})`;
    } else if (normalizedValue < 0.75) {
      const ratio = (normalizedValue - 0.5) / 0.25;
      return `rgb(255, ${Math.round(255 - 100 * ratio)}, 0)`;
    } else {
      const ratio = (normalizedValue - 0.75) / 0.25;
      return `rgb(255, ${Math.round(155 - 155 * ratio)}, 0)`;
    }
  };

  // GDP値をフォーマット（短縮版）
  const formatGDPShort = (gdp) => {
    if (gdp >= 1e12) {
      return `${(gdp / 1e12).toFixed(0)}T`;
    } else if (gdp >= 1e9) {
      return `${(gdp / 1e9).toFixed(0)}B`;
    } else if (gdp >= 1e6) {
      return `${(gdp / 1e6).toFixed(0)}M`;
    } else {
      return `${(gdp / 1e3).toFixed(0)}K`;
    }
  };

  // 世界GDP総計を計算
  const getTotalWorldGDP = () => {
    return countryData.reduce((total, country) => total + (country.gdp_current_usd || 0), 0);
  };

  // 世界GDP割合を計算
  const getWorldGDPPercentage = (countryGDP) => {
    const totalGDP = getTotalWorldGDP();
    if (totalGDP === 0) return 0;
    return ((countryGDP / totalGDP) * 100).toFixed(1);
  };

  // カスタムマーカーアイコンを作成
  const createCustomIcon = (country) => {
    const radius = getCircleRadius(country.gdp_current_usd);
    const color = getCircleColor(country.gdp_current_usd);
    const gdpText = formatGDPShort(country.gdp_current_usd);
    const percentage = getWorldGDPPercentage(country.gdp_current_usd);
    
    // フォントサイズを円のサイズに応じて調整
    const fontSize = Math.max(6, Math.min(12, radius / 4));
    const nameSize = Math.max(5, Math.min(10, radius / 5));
    
    // 国名を短縮（長い場合）
    const shortName = country.name.length > 8 ? country.name.substring(0, 6) + '...' : country.name;
    
    return divIcon({
      html: `
        <div style="
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          text-align: center;
          line-height: 1;
        ">
          <div style="font-size: ${nameSize}px; margin-bottom: 1px;">${shortName}</div>
          <div style="font-size: ${fontSize}px; margin-bottom: 1px;">${gdpText}</div>
          <div style="font-size: ${nameSize}px;">${percentage}%</div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius],
    });
  };

  // GDP値をフォーマット
  const formatGDP = (gdp) => {
    if (gdp >= 1e12) {
      return `${(gdp / 1e12).toFixed(1)} 兆ドル`;
    } else if (gdp >= 1e9) {
      return `${(gdp / 1e9).toFixed(0)} 億ドル`;
    } else {
      return `${gdp.toLocaleString()} ドル`;
    }
  };

  // 人口をフォーマット
  const formatPopulation = (population) => {
    if (population >= 1e8) {
      return `${(population / 1e8).toFixed(1)} 億人`;
    } else if (population >= 1e4) {
      return `${(population / 1e4).toFixed(0)} 万人`;
    } else {
      return `${population.toLocaleString()} 人`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">世界地図データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* 各国をカスタムマーカーで表示 */}
        {countryData.map((country) => (
          <Marker
            key={country.countryiso3code}
            position={[country.lat, country.lng]}
            icon={createCustomIcon(country)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false} interactive={true}>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{country.name}</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>GDP:</strong> {formatGDP(country.gdp_current_usd)}</div>
                  <div><strong>世界GDP割合:</strong> {getWorldGDPPercentage(country.gdp_current_usd)}%</div>
                  <div><strong>人口:</strong> {formatPopulation(country.population)}</div>
                  <div><strong>一人当たりGDP:</strong> {country.gdp_per_capita.toLocaleString()} ドル</div>
                  <div><strong>地域:</strong> {country.region}</div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      
      {/* 凡例 */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
        <h4 className="font-bold text-sm mb-2">GDP規模</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>25兆ドル以上</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>5-25兆ドル</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span>1-5兆ドル</span>
          </div>
          <div className="flex items-center">
            <div className="w-1 h-1 rounded-full bg-blue-500 mr-2"></div>
            <span>1兆ドル未満</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

