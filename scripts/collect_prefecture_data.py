#!/usr/bin/env python3
"""
e-Stat APIから日本の都道府県経済データを取得するスクリプト
"""

import requests
import pandas as pd
import json
import time
from datetime import datetime
import os

class EStatDataCollector:
    def __init__(self, app_id=None):
        self.base_url = "https://api.e-stat.go.jp/rest"
        self.api_version = "3.0"
        # テスト用のアプリケーションID（実際の利用時は登録が必要）
        self.app_id = app_id or "YOUR_APP_ID_HERE"
        
        # 県民経済計算の政府統計コード
        self.stats_id = "00100409"  # 国民経済計算
        
    def search_stats_list(self, search_word="県民経済計算"):
        """統計表を検索"""
        url = f"{self.base_url}/{self.api_version}/app/getStatsList"
        
        params = {
            'appId': self.app_id,
            'searchWord': search_word,
            'searchKind': '1',  # 統計表情報を検索
            'lang': 'J'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            # XMLレスポンスをパース（簡易版）
            content = response.text
            print("Stats list search response received")
            return content
            
        except requests.RequestException as e:
            print(f"Error searching stats list: {e}")
            return None
    
    def get_prefecture_data_mock(self):
        """
        e-Stat APIの代替として、都道府県の模擬データを生成
        実際の実装では、内閣府の県民経済計算データを手動で取得・処理する
        """
        
        # 都道府県の基本情報（実際の座標）
        prefectures = [
            {"code": "01", "name": "北海道", "lat": 43.2203, "lng": 142.8635},
            {"code": "02", "name": "青森県", "lat": 40.5606, "lng": 140.6740},
            {"code": "03", "name": "岩手県", "lat": 39.7036, "lng": 141.1527},
            {"code": "04", "name": "宮城県", "lat": 38.7222, "lng": 140.7275},
            {"code": "05", "name": "秋田県", "lat": 39.7186, "lng": 140.1024},
            {"code": "06", "name": "山形県", "lat": 38.6503, "lng": 140.3311},
            {"code": "07", "name": "福島県", "lat": 37.7503, "lng": 140.4676},
            {"code": "08", "name": "茨城県", "lat": 36.3418, "lng": 140.4468},
            {"code": "09", "name": "栃木県", "lat": 36.5657, "lng": 139.8836},
            {"code": "10", "name": "群馬県", "lat": 36.3911, "lng": 139.0608},
            {"code": "11", "name": "埼玉県", "lat": 35.8617, "lng": 139.6455},
            {"code": "12", "name": "千葉県", "lat": 35.6074, "lng": 140.1065},
            {"code": "13", "name": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"code": "14", "name": "神奈川県", "lat": 35.4478, "lng": 139.6425},
            {"code": "15", "name": "新潟県", "lat": 37.9026, "lng": 139.0232},
            {"code": "16", "name": "富山県", "lat": 36.6959, "lng": 137.2104},
            {"code": "17", "name": "石川県", "lat": 36.5946, "lng": 136.6256},
            {"code": "18", "name": "福井県", "lat": 36.0652, "lng": 136.2217},
            {"code": "19", "name": "山梨県", "lat": 35.6642, "lng": 138.5684},
            {"code": "20", "name": "長野県", "lat": 36.6513, "lng": 138.1810},
            {"code": "21", "name": "岐阜県", "lat": 35.3912, "lng": 136.7223},
            {"code": "22", "name": "静岡県", "lat": 34.9769, "lng": 138.3831},
            {"code": "23", "name": "愛知県", "lat": 35.1802, "lng": 136.9066},
            {"code": "24", "name": "三重県", "lat": 34.7303, "lng": 136.5086},
            {"code": "25", "name": "滋賀県", "lat": 35.0045, "lng": 135.8686},
            {"code": "26", "name": "京都府", "lat": 35.0211, "lng": 135.7556},
            {"code": "27", "name": "大阪府", "lat": 34.6937, "lng": 135.5023},
            {"code": "28", "name": "兵庫県", "lat": 34.6913, "lng": 135.1830},
            {"code": "29", "name": "奈良県", "lat": 34.6851, "lng": 135.8048},
            {"code": "30", "name": "和歌山県", "lat": 34.2261, "lng": 135.1675},
            {"code": "31", "name": "鳥取県", "lat": 35.5038, "lng": 134.2384},
            {"code": "32", "name": "島根県", "lat": 35.4723, "lng": 133.0505},
            {"code": "33", "name": "岡山県", "lat": 34.6617, "lng": 133.9349},
            {"code": "34", "name": "広島県", "lat": 34.3963, "lng": 132.4596},
            {"code": "35", "name": "山口県", "lat": 34.1861, "lng": 131.4706},
            {"code": "36", "name": "徳島県", "lat": 34.0658, "lng": 134.5594},
            {"code": "37", "name": "香川県", "lat": 34.3401, "lng": 134.0434},
            {"code": "38", "name": "愛媛県", "lat": 33.8416, "lng": 132.7657},
            {"code": "39", "name": "高知県", "lat": 33.5597, "lng": 133.5311},
            {"code": "40", "name": "福岡県", "lat": 33.6064, "lng": 130.4181},
            {"code": "41", "name": "佐賀県", "lat": 33.2494, "lng": 130.2989},
            {"code": "42", "name": "長崎県", "lat": 32.7503, "lng": 129.8677},
            {"code": "43", "name": "熊本県", "lat": 32.7898, "lng": 130.7417},
            {"code": "44", "name": "大分県", "lat": 33.2382, "lng": 131.6126},
            {"code": "45", "name": "宮崎県", "lat": 31.9111, "lng": 131.4239},
            {"code": "46", "name": "鹿児島県", "lat": 31.5602, "lng": 130.5581},
            {"code": "47", "name": "沖縄県", "lat": 26.2124, "lng": 127.6792}
        ]
        
        # 実際の県内総生産データ（2022年度、兆円単位）を基にした推定値
        gdp_data = {
            "01": 19.5, "02": 4.8, "03": 5.1, "04": 9.2, "05": 3.7,
            "06": 4.0, "07": 7.8, "08": 13.3, "09": 8.4, "10": 8.4,
            "11": 23.2, "12": 21.8, "13": 104.9, "14": 36.2, "15": 9.2,
            "16": 4.7, "17": 4.6, "18": 3.4, "19": 3.6, "20": 8.5,
            "21": 7.6, "22": 17.1, "23": 41.3, "24": 8.2, "25": 6.1,
            "26": 9.9, "27": 39.1, "28": 20.2, "29": 3.7, "30": 3.6,
            "31": 1.9, "32": 2.4, "33": 7.5, "34": 11.6, "35": 5.6,
            "36": 3.6, "37": 3.9, "38": 4.7, "39": 2.4, "40": 20.1,
            "41": 2.8, "42": 4.2, "43": 5.8, "44": 4.7, "45": 3.8,
            "46": 6.0, "47": 4.3
        }
        
        # 人口データ（2023年、万人単位）
        population_data = {
            "01": 515, "02": 120, "03": 118, "04": 227, "05": 95,
            "06": 106, "07": 183, "08": 286, "09": 192, "10": 193,
            "11": 734, "12": 628, "13": 1404, "14": 920, "15": 218,
            "16": 103, "17": 113, "18": 76, "19": 81, "20": 203,
            "21": 198, "22": 361, "23": 753, "24": 176, "25": 141,
            "26": 256, "27": 881, "28": 545, "29": 133, "30": 92,
            "31": 55, "32": 67, "33": 188, "34": 278, "35": 133,
            "36": 72, "37": 95, "38": 132, "39": 69, "40": 512,
            "41": 81, "42": 132, "43": 174, "44": 113, "45": 107,
            "46": 158, "47": 147
        }
        
        # データを結合
        prefecture_data = []
        for pref in prefectures:
            code = pref["code"]
            gdp_trillion_yen = gdp_data.get(code, 0)
            population_10k = population_data.get(code, 0)
            
            prefecture_data.append({
                "prefecture_code": code,
                "prefecture_name": pref["name"],
                "latitude": pref["lat"],
                "longitude": pref["lng"],
                "gdp_trillion_yen": gdp_trillion_yen,
                "gdp_million_yen": gdp_trillion_yen * 1000000,  # 百万円単位に変換
                "population": population_10k * 10000,  # 人単位に変換
                "gdp_per_capita": (gdp_trillion_yen * 1000000000000) / (population_10k * 10000) if population_10k > 0 else 0,  # 円単位
                "year": 2022
            })
        
        return pd.DataFrame(prefecture_data)
    
    def save_prefecture_data(self, df, output_dir):
        """都道府県データを保存"""
        if df.empty:
            print("No prefecture data to save")
            return
        
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV形式で保存
        csv_path = os.path.join(output_dir, 'japan_prefecture_data.csv')
        df.to_csv(csv_path, index=False)
        print(f"Prefecture data saved to {csv_path}")
        
        # JSON形式でも保存
        json_path = os.path.join(output_dir, 'japan_prefecture_data.json')
        df.to_json(json_path, orient='records', indent=2)
        print(f"Prefecture data saved to {json_path}")
        
        # 統計情報を出力
        print(f"\nPrefecture Data Summary:")
        print(f"Total prefectures: {len(df)}")
        print(f"Total GDP: {df['gdp_trillion_yen'].sum():.1f} trillion yen")
        print(f"Total population: {df['population'].sum():,}")
        print(f"Average GDP per capita: {df['gdp_per_capita'].mean():,.0f} yen")

def main():
    print("Starting e-Stat / Prefecture data collection...")
    print(f"Timestamp: {datetime.now()}")
    
    collector = EStatDataCollector()
    
    # 都道府県データを取得（模擬データ）
    print("\n1. Generating prefecture data...")
    prefecture_df = collector.get_prefecture_data_mock()
    print(f"Generated data for {len(prefecture_df)} prefectures")
    
    # データを保存
    print("\n2. Saving prefecture data...")
    output_dir = "/home/ubuntu/economic-visualization/data"
    collector.save_prefecture_data(prefecture_df, output_dir)
    
    print("\nPrefecture data collection completed!")
    print("Note: This uses estimated data based on actual 2022 prefecture GDP figures.")
    print("For production use, implement actual e-Stat API integration with proper app ID.")

if __name__ == "__main__":
    main()

