import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../config/api';

// ズームイベントを監視するコンポーネント
const ZoomHandler = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend: () => {
      const currentZoom = map.getZoom();
      onZoomChange(currentZoom);
    },
  });
  return null;
};

const JapanMap = () => {
  const [prefectureData, setPrefectureData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [municipalityData, setMunicipalityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(6);
  const [autoMode, setAutoMode] = useState(true); // 自動切り替えモード
  const [manualDataType, setManualDataType] = useState('prefecture'); // 手動切り替え用: 'prefecture', 'company', 'municipality'
  const [fadeClass, setFadeClass] = useState('opacity-100'); // フェードアニメーション用

  // ズームレベルに基づいて表示データを決定
  const getDataType = () => {
    if (autoMode) {
      if (currentZoom >= 10) return 'municipality'; // ズームレベル10以上で市区町村
      if (currentZoom >= 8) return 'company';       // ズームレベル8以上で企業
      return 'prefecture';                          // それ以下で都道府県
    }
    return manualDataType;
  };

  const currentDataType = getDataType();

  // ズーム変更ハンドラー
  const handleZoomChange = (zoom) => {
    const previousDataType = getDataType();
    setCurrentZoom(zoom);
    
    // データタイプが変わる場合はフェードアニメーションを実行
    if (autoMode) {
      const newDataType = zoom >= 10 ? 'municipality' : zoom >= 8 ? 'company' : 'prefecture';
      if (newDataType !== previousDataType) {
        setFadeClass('opacity-0');
        setTimeout(() => {
          setFadeClass('opacity-100');
        }, 300);
      }
    }
  };

  // 手動切り替え時のフェードアニメーション
  const handleManualDataTypeChange = (newType) => {
    if (newType !== manualDataType) {
      setFadeClass('opacity-0');
      setTimeout(() => {
        setManualDataType(newType);
        setFadeClass('opacity-100');
      }, 300);
    }
  };

  // 都道府県データを取得
  useEffect(() => {
    const fetchPrefectureData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/economic/prefectures`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setPrefectureData(data.data);
        } else {
          console.warn('都道府県データを取得できませんでした。フォールバックデータを使用します。');
          setPrefectureData(generatePrefectureFallbackData());
        }
      } catch (error) {
        console.error('都道府県データの取得に失敗しました:', error);
        setPrefectureData(generatePrefectureFallbackData());
      }
    };

    fetchPrefectureData();
  }, []);

  // 企業データを取得
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/economic/companies`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setCompanyData(data.data);
        } else {
          console.warn('企業データを取得できませんでした。フォールバックデータを使用します。');
          setCompanyData(generateCompanyFallbackData());
        }
      } catch (error) {
        console.error('企業データの取得に失敗しました:', error);
        setCompanyData(generateCompanyFallbackData());
      }
    };

    fetchCompanyData();
  }, []);

  // 市区町村データを取得
  useEffect(() => {
    const fetchMunicipalityData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/economic/municipalities`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setMunicipalityData(data.data);
        } else {
          console.warn('市区町村データを取得できませんでした。フォールバックデータを使用します。');
          setMunicipalityData(generateMunicipalityFallbackData());
        }
      } catch (error) {
        console.error('市区町村データの取得に失敗しました:', error);
        setMunicipalityData(generateMunicipalityFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipalityData();
  }, []);

  // 都道府県フォールバックデータ生成
  const generatePrefectureFallbackData = () => {
    return [
      { name: '北海道', gdp_trillion_yen: 18.6, population: 5224614, gdp_per_capita: 3.56, latitude: 43.2203, longitude: 142.8635 },
      { name: '青森県', gdp_trillion_yen: 4.6, population: 1234567, gdp_per_capita: 3.72, latitude: 40.8243, longitude: 140.7400 },
      { name: '岩手県', gdp_trillion_yen: 4.8, population: 1234567, gdp_per_capita: 3.89, latitude: 39.7036, longitude: 141.1527 },
      { name: '宮城県', gdp_trillion_yen: 9.8, population: 2305000, gdp_per_capita: 4.25, latitude: 38.2682, longitude: 140.8694 },
      { name: '秋田県', gdp_trillion_yen: 3.8, population: 959000, gdp_per_capita: 3.96, latitude: 39.7186, longitude: 140.1024 },
      { name: '山形県', gdp_trillion_yen: 4.2, population: 1085000, gdp_per_capita: 3.87, latitude: 38.2404, longitude: 140.3636 },
      { name: '福島県', gdp_trillion_yen: 6.8, population: 1833000, gdp_per_capita: 3.71, latitude: 37.7503, longitude: 140.4639 },
      { name: '茨城県', gdp_trillion_yen: 9.8, population: 2860000, gdp_per_capita: 3.43, latitude: 36.3418, longitude: 140.4468 },
      { name: '栃木県', gdp_trillion_yen: 7.2, population: 1934000, gdp_per_capita: 3.72, latitude: 36.5659, longitude: 139.8836 },
      { name: '群馬県', gdp_trillion_yen: 7.0, population: 1939000, gdp_per_capita: 3.61, latitude: 36.3912, longitude: 139.0601 },
      { name: '埼玉県', gdp_trillion_yen: 23.2, population: 7344765, gdp_per_capita: 3.16, latitude: 35.8617, longitude: 139.6455 },
      { name: '千葉県', gdp_trillion_yen: 21.3, population: 6284480, gdp_per_capita: 3.39, latitude: 35.6074, longitude: 140.1065 },
      { name: '東京都', gdp_trillion_yen: 104.3, population: 14047594, gdp_per_capita: 7.43, latitude: 35.6762, longitude: 139.6503 },
      { name: '神奈川県', gdp_trillion_yen: 35.4, population: 9237337, gdp_per_capita: 3.83, latitude: 35.4478, longitude: 139.6425 },
      { name: '新潟県', gdp_trillion_yen: 8.8, population: 2201000, gdp_per_capita: 4.00, latitude: 37.9024, longitude: 139.0232 },
      { name: '富山県', gdp_trillion_yen: 4.8, population: 1035000, gdp_per_capita: 4.64, latitude: 36.6953, longitude: 137.2117 },
      { name: '石川県', gdp_trillion_yen: 4.6, population: 1138000, gdp_per_capita: 4.04, latitude: 36.5945, longitude: 136.6256 },
      { name: '福井県', gdp_trillion_yen: 3.4, population: 767000, gdp_per_capita: 4.43, latitude: 36.0652, longitude: 136.2217 },
      { name: '山梨県', gdp_trillion_yen: 3.2, population: 810000, gdp_per_capita: 3.95, latitude: 35.6642, longitude: 138.5684 },
      { name: '長野県', gdp_trillion_yen: 8.0, population: 2049000, gdp_per_capita: 3.90, latitude: 36.6518, longitude: 138.1817 },
      { name: '岐阜県', gdp_trillion_yen: 7.0, population: 1988000, gdp_per_capita: 3.52, latitude: 35.3912, longitude: 136.7223 },
      { name: '静岡県', gdp_trillion_yen: 16.9, population: 3633202, gdp_per_capita: 4.65, latitude: 34.9756, longitude: 138.3828 },
      { name: '愛知県', gdp_trillion_yen: 39.4, population: 7542415, gdp_per_capita: 5.22, latitude: 35.1802, longitude: 136.9066 },
      { name: '三重県', gdp_trillion_yen: 6.8, population: 1770000, gdp_per_capita: 3.84, latitude: 34.7303, longitude: 136.5086 },
      { name: '滋賀県', gdp_trillion_yen: 4.8, population: 1413000, gdp_per_capita: 3.40, latitude: 35.0045, longitude: 135.8685 },
      { name: '京都府', gdp_trillion_yen: 10.2, population: 2579000, gdp_per_capita: 3.95, latitude: 35.0212, longitude: 135.7556 },
      { name: '大阪府', gdp_trillion_yen: 40.1, population: 8837685, gdp_per_capita: 4.54, latitude: 34.6937, longitude: 135.5023 },
      { name: '兵庫県', gdp_trillion_yen: 20.9, population: 5465002, gdp_per_capita: 3.82, latitude: 34.6913, longitude: 135.1830 },
      { name: '奈良県', gdp_trillion_yen: 4.0, population: 1330000, gdp_per_capita: 3.01, latitude: 34.6851, longitude: 135.8328 },
      { name: '和歌山県', gdp_trillion_yen: 3.2, population: 945000, gdp_per_capita: 3.39, latitude: 34.2260, longitude: 135.1675 },
      { name: '鳥取県', gdp_trillion_yen: 1.8, population: 553000, gdp_per_capita: 3.25, latitude: 35.5037, longitude: 134.2382 },
      { name: '島根県', gdp_trillion_yen: 2.4, population: 671000, gdp_per_capita: 3.58, latitude: 35.4723, longitude: 132.9865 },
      { name: '岡山県', gdp_trillion_yen: 7.0, population: 1889000, gdp_per_capita: 3.71, latitude: 34.6617, longitude: 133.9167 },
      { name: '広島県', gdp_trillion_yen: 11.2, population: 2799000, gdp_per_capita: 4.00, latitude: 34.3963, longitude: 132.4594 },
      { name: '山口県', gdp_trillion_yen: 6.0, population: 1342000, gdp_per_capita: 4.47, latitude: 34.1857, longitude: 131.4706 },
      { name: '徳島県', gdp_trillion_yen: 2.6, population: 728000, gdp_per_capita: 3.57, latitude: 34.0657, longitude: 134.5595 },
      { name: '香川県', gdp_trillion_yen: 3.4, population: 950000, gdp_per_capita: 3.58, latitude: 34.3401, longitude: 134.0434 },
      { name: '愛媛県', gdp_trillion_yen: 4.8, population: 1335000, gdp_per_capita: 3.60, latitude: 33.8417, longitude: 132.7662 },
      { name: '高知県', gdp_trillion_yen: 2.6, population: 698000, gdp_per_capita: 3.72, latitude: 33.5597, longitude: 133.5311 },
      { name: '福岡県', gdp_trillion_yen: 20.1, population: 5135214, gdp_per_capita: 3.91, latitude: 33.6064, longitude: 130.4181 },
      { name: '佐賀県', gdp_trillion_yen: 2.4, population: 809000, gdp_per_capita: 2.97, latitude: 33.2494, longitude: 130.2989 },
      { name: '長崎県', gdp_trillion_yen: 4.0, population: 1312000, gdp_per_capita: 3.05, latitude: 32.7503, longitude: 129.8778 },
      { name: '熊本県', gdp_trillion_yen: 5.6, population: 1738000, gdp_per_capita: 3.22, latitude: 32.7898, longitude: 130.7416 },
      { name: '大分県', gdp_trillion_yen: 4.0, population: 1123000, gdp_per_capita: 3.56, latitude: 33.2382, longitude: 131.6125 },
      { name: '宮崎県', gdp_trillion_yen: 3.6, population: 1069000, gdp_per_capita: 3.37, latitude: 31.9111, longitude: 131.4239 },
      { name: '鹿児島県', gdp_trillion_yen: 5.0, population: 1599000, gdp_per_capita: 3.13, latitude: 31.5600, longitude: 130.5586 },
      { name: '沖縄県', gdp_trillion_yen: 2.2, population: 1467000, gdp_per_capita: 1.50, latitude: 26.2124, longitude: 127.6809 }
    ];
  };

  // 企業フォールバックデータ生成（より多くの企業を追加）
  const generateCompanyFallbackData = () => {
    return [
      // 東京都の企業
      { name: 'ソフトバンクグループ', revenue_million_yen: 6220887, employees: 67492, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 92.2 },
      { name: 'NTT', revenue_million_yen: 13938000, employees: 330000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 42.2 },
      { name: 'ホンダ', revenue_million_yen: 16910000, employees: 218674, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 77.3 },
      { name: 'ソニー', revenue_million_yen: 13574000, employees: 109700, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 123.8 },
      { name: '三菱商事', revenue_million_yen: 19493000, employees: 86000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 226.7 },
      { name: '三井物産', revenue_million_yen: 12113000, employees: 45000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 269.2 },
      { name: 'KDDI', revenue_million_yen: 5563000, employees: 48000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 115.9 },
      { name: '東京電力', revenue_million_yen: 5900000, employees: 42000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 140.5 },
      { name: 'JR東日本', revenue_million_yen: 2800000, employees: 72000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 38.9 },
      { name: '日立製作所', revenue_million_yen: 10000000, employees: 370000, prefecture: '東京都', latitude: 35.6762, longitude: 139.6503, revenue_per_employee: 27.0 },

      // 愛知県の企業
      { name: 'トヨタ自動車', revenue_million_yen: 31379152, employees: 375235, prefecture: '愛知県', latitude: 35.1802, longitude: 136.9066, revenue_per_employee: 83.6 },
      { name: 'デンソー', revenue_million_yen: 5500000, employees: 170000, prefecture: '愛知県', latitude: 35.1802, longitude: 136.9066, revenue_per_employee: 32.4 },
      { name: 'アイシン', revenue_million_yen: 3800000, employees: 120000, prefecture: '愛知県', latitude: 35.1802, longitude: 136.9066, revenue_per_employee: 31.7 },
      { name: '豊田自動織機', revenue_million_yen: 2500000, employees: 70000, prefecture: '愛知県', latitude: 35.1802, longitude: 136.9066, revenue_per_employee: 35.7 },

      // 神奈川県の企業
      { name: '日産自動車', revenue_million_yen: 10598000, employees: 131461, prefecture: '神奈川県', latitude: 35.4478, longitude: 139.6425, revenue_per_employee: 80.6 },
      { name: '富士フイルム', revenue_million_yen: 2500000, employees: 73000, prefecture: '神奈川県', latitude: 35.4478, longitude: 139.6425, revenue_per_employee: 34.2 },
      { name: '東芝', revenue_million_yen: 3300000, employees: 110000, prefecture: '神奈川県', latitude: 35.4478, longitude: 139.6425, revenue_per_employee: 30.0 },

      // 大阪府の企業
      { name: 'パナソニック', revenue_million_yen: 8378000, employees: 243540, prefecture: '大阪府', latitude: 34.6937, longitude: 135.5023, revenue_per_employee: 34.4 },
      { name: '関西電力', revenue_million_yen: 3200000, employees: 32000, prefecture: '大阪府', latitude: 34.6937, longitude: 135.5023, revenue_per_employee: 100.0 },
      { name: 'ダイキン工業', revenue_million_yen: 2900000, employees: 88000, prefecture: '大阪府', latitude: 34.6937, longitude: 135.5023, revenue_per_employee: 33.0 },
      { name: '伊藤忠商事', revenue_million_yen: 12000000, employees: 100000, prefecture: '大阪府', latitude: 34.6937, longitude: 135.5023, revenue_per_employee: 120.0 },

      // 福岡県の企業
      { name: '九州電力', revenue_million_yen: 2100000, employees: 22000, prefecture: '福岡県', latitude: 33.6064, longitude: 130.4181, revenue_per_employee: 95.5 },
      { name: 'ソフトバンク', revenue_million_yen: 5600000, employees: 47000, prefecture: '福岡県', latitude: 33.6064, longitude: 130.4181, revenue_per_employee: 119.1 },
      { name: '安川電機', revenue_million_yen: 470000, employees: 15000, prefecture: '福岡県', latitude: 33.6064, longitude: 130.4181, revenue_per_employee: 31.3 },

      // 北海道の企業
      { name: '北海道電力', revenue_million_yen: 700000, employees: 12000, prefecture: '北海道', latitude: 43.2203, longitude: 142.8635, revenue_per_employee: 58.3 },
      { name: 'ニトリ', revenue_million_yen: 700000, employees: 30000, prefecture: '北海道', latitude: 43.2203, longitude: 142.8635, revenue_per_employee: 23.3 },

      // 広島県の企業
      { name: 'マツダ', revenue_million_yen: 3500000, employees: 50000, prefecture: '広島県', latitude: 34.3853, longitude: 132.4553, revenue_per_employee: 70.0 },

      // 静岡県の企業
      { name: 'スズキ', revenue_million_yen: 4000000, employees: 70000, prefecture: '静岡県', latitude: 34.7058, longitude: 137.7344, revenue_per_employee: 57.1 },
      { name: 'ヤマハ発動機', revenue_million_yen: 1800000, employees: 55000, prefecture: '静岡県', latitude: 34.7058, longitude: 137.7344, revenue_per_employee: 32.7 },

      // 京都府の企業
      { name: '任天堂', revenue_million_yen: 1700000, employees: 7000, prefecture: '京都府', latitude: 34.9859, longitude: 135.758, revenue_per_employee: 242.9 },
      { name: '京セラ', revenue_million_yen: 1800000, employees: 83000, prefecture: '京都府', latitude: 34.9859, longitude: 135.758, revenue_per_employee: 21.7 }
    ];
  };

  // 市区町村フォールバックデータ生成
  const generateMunicipalityFallbackData = () => {
    return [
      { municipality_name: '札幌市', latitude: 43.06417, longitude: 141.34694, population: 1970000, gdp_million_yen: 70000000, gdp_per_capita: 35.5 },
      { municipality_name: '仙台市', latitude: 38.26889, longitude: 140.87194, population: 1090000, gdp_million_yen: 40000000, gdp_per_capita: 36.7 },
      { municipality_name: 'さいたま市', latitude: 35.86139, longitude: 139.64583, population: 1320000, gdp_million_yen: 50000000, gdp_per_capita: 37.9 },
      { municipality_name: '千葉市', latitude: 35.60472, longitude: 140.12333, population: 980000, gdp_million_yen: 35000000, gdp_per_capita: 35.7 },
      { municipality_name: '東京都区部', latitude: 35.68944, longitude: 139.69167, population: 9700000, gdp_million_yen: 400000000, gdp_per_capita: 41.2 },
      { municipality_name: '横浜市', latitude: 35.44778, longitude: 139.64167, population: 3770000, gdp_million_yen: 150000000, gdp_per_capita: 39.8 },
      { municipality_name: '川崎市', latitude: 35.53028, longitude: 139.71667, population: 1540000, gdp_million_yen: 60000000, gdp_per_capita: 39.0 },
      { municipality_name: '名古屋市', latitude: 35.18028, longitude: 136.90667, population: 2330000, gdp_million_yen: 90000000, gdp_per_capita: 38.6 },
      { municipality_name: '京都市', latitude: 35.02139, longitude: 135.75556, population: 1470000, gdp_million_yen: 55000000, gdp_per_capita: 37.4 },
      { municipality_name: '大阪市', latitude: 34.69375, longitude: 135.50222, population: 2750000, gdp_million_yen: 110000000, gdp_per_capita: 40.0 },
      { municipality_name: '神戸市', latitude: 34.69139, longitude: 135.18306, population: 1520000, gdp_million_yen: 60000000, gdp_per_capita: 39.5 },
      { municipality_name: '広島市', latitude: 34.39639, longitude: 132.45944, population: 1200000, gdp_million_yen: 45000000, gdp_per_capita: 37.5 },
      { municipality_name: '福岡市', latitude: 33.59028, longitude: 130.40167, population: 1630000, gdp_million_yen: 65000000, gdp_per_capita: 39.9 },
      { municipality_name: '那覇市', latitude: 26.2125, longitude: 127.68111, population: 320000, gdp_million_yen: 12000000, gdp_per_capita: 37.5 },
    ];
  };

  // 日本GDP総計を計算（都道府県データから）
  const getTotalJapanGDP = () => {
    return prefectureData.reduce((total, prefecture) => total + (prefecture.gdp_trillion_yen || 0), 0);
  };

  // 日本GDP割合を計算（都道府県用）
  const getJapanGDPPercentage = (prefectureGDP) => {
    const totalGDP = getTotalJapanGDP();
    if (totalGDP === 0) return 0;
    return ((prefectureGDP / totalGDP) * 100).toFixed(1);
  };

  // 企業の国GDP割合を計算（企業用）
  const getCompanyJapanGDPPercentage = (companyRevenue) => {
    // 日本の名目GDP（約540兆円）を基準とする
    const japanGDPTrillionYen = 540;
    const companyGDPTrillionYen = companyRevenue / 1000000; // 百万円を兆円に変換
    return ((companyGDPTrillionYen / japanGDPTrillionYen) * 100).toFixed(2);
  };

  // 市区町村の国GDP割合を計算（市区町村用）
  const getMunicipalityJapanGDPPercentage = (municipalityGDP) => {
    // 日本の名目GDP（約540兆円）を基準とする
    const japanGDPTrillionYen = 540;
    const municipalityGDPTrillionYen = municipalityGDP / 1000000; // 百万円を兆円に変換
    return ((municipalityGDPTrillionYen / japanGDPTrillionYen) * 100).toFixed(2);
  };

  // 都道府県GDPに基づく円のサイズ計算
  const getPrefectureRadius = (gdp) => {
    if (!gdp || gdp === 0) return 5;
    // 対数スケールでサイズを調整
    const logGdp = Math.log10(gdp * 1000); // 兆円を億円に変換
    return Math.max(5, Math.min(50, logGdp * 8));
  };

  // 企業売上に基づく円のサイズ計算
  const getCompanyRadius = (revenue) => {
    if (!revenue || revenue === 0) return 3;
    // 対数スケールでサイズを調整
    const logRevenue = Math.log10(revenue);
    return Math.max(3, Math.min(40, logRevenue * 5));
  };

  // 市区町村GDPに基づく円のサイズ計算
  const getMunicipalityRadius = (gdp) => {
    if (!gdp || gdp === 0) return 3;
    // 対数スケールでサイズを調整
    const logGdp = Math.log10(gdp);
    return Math.max(3, Math.min(35, logGdp * 4));
  };

  // 都道府県GDPに基づく色分け
  const getPrefectureColor = (gdp) => {
    if (!gdp || gdp === 0) return '#cccccc';
    
    if (gdp >= 100) return '#800026';      // 100兆円以上
    if (gdp >= 50) return '#BD0026';       // 50兆円以上
    if (gdp >= 30) return '#E31A1C';       // 30兆円以上
    if (gdp >= 20) return '#FC4E2A';       // 20兆円以上
    if (gdp >= 15) return '#FD8D3C';       // 15兆円以上
    if (gdp >= 10) return '#FEB24C';       // 10兆円以上
    if (gdp >= 5) return '#FED976';        // 5兆円以上
    return '#FFEDA0';                      // 5兆円未満
  };

  // 企業売上に基づく色分け
  const getCompanyColor = (revenue) => {
    if (!revenue || revenue === 0) return '#cccccc';
    
    const revenueInTrillionYen = revenue / 1000000; // 百万円を兆円に変換
    
    if (revenueInTrillionYen >= 30) return '#4a0e4e';      // 30兆円以上
    if (revenueInTrillionYen >= 20) return '#762a83';      // 20兆円以上
    if (revenueInTrillionYen >= 15) return '#9970ab';      // 15兆円以上
    if (revenueInTrillionYen >= 10) return '#c2a5cf';      // 10兆円以上
    if (revenueInTrillionYen >= 5) return '#e7d4e8';       // 5兆円以上
    if (revenueInTrillionYen >= 1) return '#d9f0d3';       // 1兆円以上
    if (revenueInTrillionYen >= 0.5) return '#a6dba0';     // 0.5兆円以上
    return '#5aae61';                                      // 0.5兆円未満
  };

  // 市区町村GDPに基づく色分け
  const getMunicipalityColor = (gdp) => {
    if (!gdp || gdp === 0) return '#cccccc';
    
    const gdpInTrillionYen = gdp / 1000000; // 百万円を兆円に変換
    
    if (gdpInTrillionYen >= 400) return '#08519c';      // 400兆円以上
    if (gdpInTrillionYen >= 150) return '#3182bd';      // 150兆円以上
    if (gdpInTrillionYen >= 100) return '#6baed6';      // 100兆円以上
    if (gdpInTrillionYen >= 70) return '#9ecae1';       // 70兆円以上
    if (gdpInTrillionYen >= 50) return '#c6dbef';       // 50兆円以上
    if (gdpInTrillionYen >= 30) return '#deebf7';       // 30兆円以上
    return '#f7fbff';                                   // 30兆円未満
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">日本地図データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* 表示切り替えコントロール */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
        <div className="flex flex-col space-y-3">
          {/* 自動/手動切り替え */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">表示モード</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoMode(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  autoMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                自動切り替え
              </button>
              <button
                onClick={() => setAutoMode(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  !autoMode 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                手動切り替え
              </button>
            </div>
          </div>

          {/* 現在のズームレベル表示 */}
          <div className="text-xs text-gray-600">
            ズームレベル: {currentZoom}
          </div>

          {/* 手動切り替えボタン（手動モード時のみ表示） */}
          {!autoMode && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleManualDataTypeChange('prefecture')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  manualDataType === 'prefecture'
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                都道府県
              </button>
              <button
                onClick={() => handleManualDataTypeChange('company')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  manualDataType === 'company'
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                企業
              </button>
              <button
                onClick={() => handleManualDataTypeChange('municipality')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  manualDataType === 'municipality'
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                市区町村
              </button>
            </div>
          )}

          {/* 自動切り替えの説明 */}
          {autoMode && (
            <div className="text-xs text-gray-600 max-w-48">
              ズーム8以上で企業、10以上で市区町村に自動切り替え
            </div>
          )}
        </div>
      </div>

      {/* 凡例 */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-10 max-w-xs">
        {currentDataType === 'prefecture' ? (
          <>
            <h3 className="text-sm font-bold mb-3 text-gray-800">都道府県GDP（兆円）</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#800026'}}></div>
                <span>100兆以上</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#BD0026'}}></div>
                <span>50-100兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#E31A1C'}}></div>
                <span>30-50兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#FC4E2A'}}></div>
                <span>20-30兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#FD8D3C'}}></div>
                <span>15-20兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#FEB24C'}}></div>
                <span>10-15兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#FED976'}}></div>
                <span>5-10兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#FFEDA0'}}></div>
                <span>5兆未満</span>
              </div>
            </div>
          </>
        ) : currentDataType === 'company' ? (
          <>
            <h3 className="text-sm font-bold mb-3 text-gray-800">企業売上高（兆円）</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#4a0e4e'}}></div>
                <span>30兆以上</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#762a83'}}></div>
                <span>20-30兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#9970ab'}}></div>
                <span>15-20兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#c2a5cf'}}></div>
                <span>10-15兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#e7d4e8'}}></div>
                <span>5-10兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#d9f0d3'}}></div>
                <span>1-5兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#a6dba0'}}></div>
                <span>0.5-1兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#5aae61'}}></div>
                <span>0.5兆未満</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-bold mb-3 text-gray-800">市区町村GDP（兆円）</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#08519c'}}></div>
                <span>400兆以上</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#3182bd'}}></div>
                <span>150-400兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#6baed6'}}></div>
                <span>100-150兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#9ecae1'}}></div>
                <span>70-100兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#c6dbef'}}></div>
                <span>50-70兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#deebf7'}}></div>
                <span>30-50兆</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#f7fbff'}}></div>
                <span>30兆未満</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 地図 */}
      <div className={`transition-opacity duration-300 ${fadeClass}`}>
        <MapContainer
          center={[36.2048, 138.2529]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* ズームイベントハンドラー */}
          <ZoomHandler onZoomChange={handleZoomChange} />
          
          {/* 都道府県データ表示 */}
          {currentDataType === 'prefecture' && prefectureData.map((prefecture, index) => (
            <CircleMarker
              key={`prefecture-${index}`}
              center={[prefecture.latitude, prefecture.longitude]}
              radius={getPrefectureRadius(prefecture.gdp_trillion_yen)}
              fillColor={getPrefectureColor(prefecture.gdp_trillion_yen)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              {/* 都道府県の詳細情報を円の中心に表示 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(5, Math.min(10, getPrefectureRadius(prefecture.gdp_trillion_yen) / 5))}px`,
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.1'
                }}
              >
                {/* 都道府県名 */}
                <div style={{fontSize: `${Math.max(5, Math.min(10, getPrefectureRadius(prefecture.gdp_trillion_yen) / 5))}px`, marginBottom: '1px'}}>
                  {prefecture.name.replace('県', '').replace('府', '').replace('都', '').replace('道', '')}
                </div>
                {/* GDP値 */}
                <div style={{fontSize: `${Math.max(6, Math.min(12, getPrefectureRadius(prefecture.gdp_trillion_yen) / 4))}px`, marginBottom: '1px'}}>
                  {prefecture.gdp_trillion_yen}T
                </div>
                {/* 日本GDP割合 */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getPrefectureRadius(prefecture.gdp_trillion_yen) / 6))}px`, marginBottom: '1px'}}>
                  {getJapanGDPPercentage(prefecture.gdp_trillion_yen)}%
                </div>
                {/* 人口（万人） */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getPrefectureRadius(prefecture.gdp_trillion_yen) / 6))}px`, marginBottom: '1px'}}>
                  {(prefecture.population / 10000).toFixed(0)}万人
                </div>
                {/* 一人当たりGDP */}
                <div style={{fontSize: `${Math.max(4, Math.min(7, getPrefectureRadius(prefecture.gdp_trillion_yen) / 7))}px`}}>
                  {prefecture.gdp_per_capita.toFixed(1)}M/人
                </div>
              </div>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false} interactive={true}>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{prefecture.name}</h3>
                  <p style={{ margin: '5px 0' }}><strong>GDP:</strong> {prefecture.gdp_trillion_yen} 兆円</p>
                  <p style={{ margin: '5px 0' }}><strong>日本GDP割合:</strong> {getJapanGDPPercentage(prefecture.gdp_trillion_yen)}%</p>
                  <p style={{ margin: '5px 0' }}><strong>人口:</strong> {(prefecture.population / 10000).toFixed(1)} 万人</p>
                  <p style={{ margin: '5px 0' }}><strong>一人当たりGDP:</strong> {prefecture.gdp_per_capita.toFixed(2)} 百万円</p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* 企業データ表示 */}
          {currentDataType === 'company' && companyData.map((company, index) => (
            <CircleMarker
              key={`company-${index}`}
              center={[company.latitude, company.longitude]}
              radius={getCompanyRadius(company.revenue_million_yen)}
              fillColor={getCompanyColor(company.revenue_million_yen)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              {/* 企業の詳細情報を円の中心に表示 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(5, Math.min(10, getCompanyRadius(company.revenue_million_yen) / 5))}px`,
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: `${getCompanyRadius(company.revenue_million_yen) * 1.8}px`,
                  lineHeight: '1.1'
                }}
              >
                {/* 企業名 */}
                <div style={{fontSize: `${Math.max(5, Math.min(10, getCompanyRadius(company.revenue_million_yen) / 5))}px`, marginBottom: '1px'}}>
                  {company.name.length > 6 ? company.name.substring(0, 4) + '..' : company.name}
                </div>
                {/* 売上高 */}
                <div style={{fontSize: `${Math.max(6, Math.min(12, getCompanyRadius(company.revenue_million_yen) / 4))}px`, marginBottom: '1px'}}>
                  {(company.revenue_million_yen / 1000000).toFixed(1)}T
                </div>
                {/* 日本GDP割合 */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getCompanyRadius(company.revenue_million_yen) / 6))}px`, marginBottom: '1px'}}>
                  {getCompanyJapanGDPPercentage(company.revenue_million_yen)}%
                </div>
                {/* 従業員数 */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getCompanyRadius(company.revenue_million_yen) / 6))}px`, marginBottom: '1px'}}>
                  {company.employees >= 10000 ? `${(company.employees / 10000).toFixed(0)}万人` : `${(company.employees / 1000).toFixed(0)}千人`}
                </div>
                {/* 従業員一人当たり売上 */}
                <div style={{fontSize: `${Math.max(4, Math.min(7, getCompanyRadius(company.revenue_million_yen) / 7))}px`}}>
                  {company.revenue_per_employee.toFixed(0)}M/人
                </div>
              </div>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false} interactive={true}>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{company.name}</h3>
                  <p style={{ margin: '5px 0' }}><strong>売上高:</strong> {(company.revenue_million_yen / 1000000).toFixed(2)} 兆円</p>
                  <p style={{ margin: '5px 0' }}><strong>日本GDP割合:</strong> {getCompanyJapanGDPPercentage(company.revenue_million_yen)}%</p>
                  <p style={{ margin: '5px 0' }}><strong>従業員数:</strong> {company.employees.toLocaleString()} 人</p>
                  <p style={{ margin: '5px 0' }}><strong>所在地:</strong> {company.prefecture}</p>
                  <p style={{ margin: '5px 0' }}><strong>従業員一人当たり売上:</strong> {company.revenue_per_employee.toFixed(1)} 百万円</p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* 市区町村データ表示 */}
          {currentDataType === 'municipality' && municipalityData.map((municipality, index) => (
            <CircleMarker
              key={`municipality-${index}`}
              center={[municipality.latitude, municipality.longitude]}
              radius={getMunicipalityRadius(municipality.gdp_million_yen)}
              fillColor={getMunicipalityColor(municipality.gdp_million_yen)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              {/* 市区町村の詳細情報を円の中心に表示 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(5, Math.min(10, getMunicipalityRadius(municipality.gdp_million_yen) / 5))}px`,
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: `${getMunicipalityRadius(municipality.gdp_million_yen) * 1.8}px`,
                  lineHeight: '1.1'
                }}
              >
                {/* 市区町村名 */}
                <div style={{fontSize: `${Math.max(5, Math.min(10, getMunicipalityRadius(municipality.gdp_million_yen) / 5))}px`, marginBottom: '1px'}}>
                  {municipality.municipality_name.replace('市', '').replace('区', '').replace('町', '').replace('村', '')}
                </div>
                {/* GDP値 */}
                <div style={{fontSize: `${Math.max(6, Math.min(12, getMunicipalityRadius(municipality.gdp_million_yen) / 4))}px`, marginBottom: '1px'}}>
                  {(municipality.gdp_million_yen / 1000000).toFixed(0)}T
                </div>
                {/* 日本GDP割合 */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getMunicipalityRadius(municipality.gdp_million_yen) / 6))}px`, marginBottom: '1px'}}>
                  {getMunicipalityJapanGDPPercentage(municipality.gdp_million_yen)}%
                </div>
                {/* 人口（万人） */}
                <div style={{fontSize: `${Math.max(4, Math.min(8, getMunicipalityRadius(municipality.gdp_million_yen) / 6))}px`, marginBottom: '1px'}}>
                  {(municipality.population / 10000).toFixed(0)}万人
                </div>
                {/* 一人当たりGDP */}
                <div style={{fontSize: `${Math.max(4, Math.min(7, getMunicipalityRadius(municipality.gdp_million_yen) / 7))}px`}}>
                  {municipality.gdp_per_capita.toFixed(1)}M/人
                </div>
              </div>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false} interactive={true}>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{municipality.municipality_name}</h3>
                  <p style={{ margin: '5px 0' }}><strong>GDP:</strong> {(municipality.gdp_million_yen / 1000000).toFixed(2)} 兆円</p>
                  <p style={{ margin: '5px 0' }}><strong>日本GDP割合:</strong> {getMunicipalityJapanGDPPercentage(municipality.gdp_million_yen)}%</p>
                  <p style={{ margin: '5px 0' }}><strong>人口:</strong> {(municipality.population / 10000).toFixed(1)} 万人</p>
                  <p style={{ margin: '5px 0' }}><strong>一人当たりGDP:</strong> {municipality.gdp_per_capita.toFixed(2)} 百万円</p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default JapanMap;

