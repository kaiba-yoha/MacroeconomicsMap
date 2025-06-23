import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const DataSources = () => {
  const [sources, setSources] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/economic/sources`);
        const data = await response.json();
        if (data.status === 'success') {
          setSources(data.data);
        }
      } catch (error) {
        console.error('データソース情報の取得に失敗しました:', error);
        // フォールバック用のデータソース情報
        setSources([
          {
            name: "世界銀行 World Bank API",
            description: "世界各国のGDP、人口データ",
            url: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898599",
            data_year: "2023年",
            license: "Creative Commons Attribution 4.0"
          },
          {
            name: "内閣府 県民経済計算",
            description: "日本の都道府県別GDP、人口データ",
            url: "https://www.esri.cao.go.jp/jp/sna/sonota/kenmin/kenmin_top.html",
            data_year: "2022年度",
            license: "政府標準利用規約"
          },
          {
            name: "企業売上データ",
            description: "上場企業の売上高、従業員数データ（模擬データ）",
            url: "#",
            data_year: "2023年",
            license: "サンプルデータ"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg p-3 z-50 max-w-xs">
        <div className="text-sm text-gray-600">データソース読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg z-50 max-w-sm">
      {/* ヘッダー部分（常時表示） */}
      <div 
        className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">データソース</span>
        </div>
        <div className="text-gray-500">
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>

      {/* 展開可能な詳細部分 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3 max-h-80 overflow-y-auto">
          {sources.map((source, index) => (
            <div key={index} className="text-xs space-y-1">
              <div className="font-semibold text-gray-800">{source.name}</div>
              <div className="text-gray-600">{source.description}</div>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>📅 {source.data_year}</span>
                <span>📄 {source.license}</span>
              </div>
              {source.url && source.url !== '#' && (
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline block"
                >
                  詳細情報 →
                </a>
              )}
              {index < sources.length - 1 && <hr className="border-gray-200 mt-2" />}
            </div>
          ))}
          
          {/* 更新情報 */}
          <div className="border-t border-gray-200 pt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>🔄</span>
              <span>最終更新: {new Date().toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 折りたたみ時の簡易表示 */}
      {!isExpanded && (
        <div className="px-3 pb-2 text-xs text-gray-500">
          {sources.length}件のデータソース
        </div>
      )}
    </div>
  );
};

export default DataSources;

