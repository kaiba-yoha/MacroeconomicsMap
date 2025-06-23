import React, { useState } from 'react';
import WorldMap from './components/WorldMap';
import JapanMap from './components/JapanMap';
import DataSources from './components/DataSources';
import './App.css';

// シンプルなButtonコンポーネント
const Button = ({ variant, onClick, disabled, children }) => {
  const baseClasses = "px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base";
  const variantClasses = variant === 'default' 
    ? "bg-blue-600 text-white hover:bg-blue-700" 
    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('world');

  return (
    <div className="w-full h-screen relative">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-20 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            経済データ可視化マップ
          </h1>
          <div className="flex space-x-1 sm:space-x-2">
            <Button 
              variant={currentView === 'world' ? 'default' : 'outline'}
              onClick={() => setCurrentView('world')}
            >
              世界地図
            </Button>
            <Button 
              variant={currentView === 'japan' ? 'default' : 'outline'}
              onClick={() => setCurrentView('japan')}
            >
              日本
            </Button>
            <Button 
              variant={currentView === 'companies' ? 'default' : 'outline'}
              onClick={() => setCurrentView('companies')}
              disabled
            >
              <span className="hidden sm:inline">企業詳細（準備中）</span>
              <span className="sm:hidden">企業</span>
            </Button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="absolute top-12 sm:top-20 bottom-0 left-0 right-0">
        {currentView === 'world' && <WorldMap />}
        {currentView === 'japan' && <JapanMap />}
        {currentView === 'companies' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-gray-600">企業詳細ビューは準備中です</div>
          </div>
        )}
      </div>

      {/* データソース引用元リスト（常時表示） */}
      <DataSources />
    </div>
  );
}

export default App;
