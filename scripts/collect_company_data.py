#!/usr/bin/env python3
"""
バフェット・コードAPIから企業データを取得するスクリプト
"""

import requests
import pandas as pd
import json
import time
from datetime import datetime
import os
import random

class CompanyDataCollector:
    def __init__(self):
        self.base_url = "https://api.buffett-code.com/api/v4"
        # テスト用APIキー
        self.api_key = "sAJGq9JH193KiwnF947v74KnDYkO7z634LWQQfPY"
        self.headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        
    def get_company_list(self):
        """企業リストを取得（テスト用キーでは制限あり）"""
        url = f"{self.base_url}/company"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if 'companies' in data:
                return data['companies']
            else:
                print("No companies data found in response")
                return []
                
        except requests.RequestException as e:
            print(f"Error fetching company list: {e}")
            # テスト用キーの制限により、模擬データを生成
            return self.generate_mock_company_data()
    
    def generate_mock_company_data(self):
        """
        実際の上場企業データを基にした模擬データを生成
        テスト用APIキーの制限を回避するため
        """
        
        # 主要企業の実際のデータを基にした模擬データ
        companies = [
            # 東京都
            {"ticker": "7203", "name": "トヨタ自動車", "revenue": 37154269, "employees": 375235, "prefecture": "愛知県", "lat": 35.0844, "lng": 137.1531},
            {"ticker": "9984", "name": "ソフトバンクグループ", "revenue": 6220000, "employees": 255, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "6758", "name": "ソニーグループ", "revenue": 13574000, "employees": 109700, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "9432", "name": "日本電信電話", "revenue": 13938000, "employees": 330000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "8306", "name": "三菱UFJフィナンシャル・グループ", "revenue": 7825000, "employees": 120000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            
            # 大阪府
            {"ticker": "8058", "name": "三菱商事", "revenue": 21038000, "employees": 86000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "4502", "name": "武田薬品工業", "revenue": 3570000, "employees": 50000, "prefecture": "大阪府", "lat": 34.6937, "lng": 135.5023},
            {"ticker": "6501", "name": "日立製作所", "revenue": 10881000, "employees": 350000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "7974", "name": "任天堂", "revenue": 1695000, "employees": 7317, "prefecture": "京都府", "lat": 35.0211, "lng": 135.7556},
            {"ticker": "9983", "name": "ファーストリテイリング", "revenue": 2765000, "employees": 57000, "prefecture": "山口県", "lat": 34.1861, "lng": 131.4706},
            
            # 愛知県
            {"ticker": "7267", "name": "ホンダ", "revenue": 16911000, "employees": 220000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "7201", "name": "日産自動車", "revenue": 10598000, "employees": 131000, "prefecture": "神奈川県", "lat": 35.4478, "lng": 139.6425},
            {"ticker": "8031", "name": "三井物産", "revenue": 14704000, "employees": 45000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "5401", "name": "日本製鉄", "revenue": 7242000, "employees": 106000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "9020", "name": "東日本旅客鉄道", "revenue": 2943000, "employees": 72000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            
            # 神奈川県
            {"ticker": "4063", "name": "信越化学工業", "revenue": 2180000, "employees": 26000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "6954", "name": "ファナック", "revenue": 695000, "employees": 8256, "prefecture": "山梨県", "lat": 35.6642, "lng": 138.5684},
            {"ticker": "4568", "name": "第一三共", "revenue": 1071000, "employees": 15000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "6098", "name": "リクルートホールディングス", "revenue": 2866000, "employees": 60000, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
            {"ticker": "4519", "name": "中外製薬", "revenue": 789000, "employees": 7500, "prefecture": "東京都", "lat": 35.6762, "lng": 139.6503},
        ]
        
        # 都道府県の座標データ
        prefecture_coords = {
            "北海道": {"lat": 43.2203, "lng": 142.8635},
            "青森県": {"lat": 40.5606, "lng": 140.6740},
            "岩手県": {"lat": 39.7036, "lng": 141.1527},
            "宮城県": {"lat": 38.7222, "lng": 140.7275},
            "秋田県": {"lat": 39.7186, "lng": 140.1024},
            "山形県": {"lat": 38.6503, "lng": 140.3311},
            "福島県": {"lat": 37.7503, "lng": 140.4676},
            "茨城県": {"lat": 36.3418, "lng": 140.4468},
            "栃木県": {"lat": 36.5657, "lng": 139.8836},
            "群馬県": {"lat": 36.3911, "lng": 139.0608},
            "埼玉県": {"lat": 35.8617, "lng": 139.6455},
            "千葉県": {"lat": 35.6074, "lng": 140.1065},
            "東京都": {"lat": 35.6762, "lng": 139.6503},
            "神奈川県": {"lat": 35.4478, "lng": 139.6425},
            "新潟県": {"lat": 37.9026, "lng": 139.0232},
            "富山県": {"lat": 36.6959, "lng": 137.2104},
            "石川県": {"lat": 36.5946, "lng": 136.6256},
            "福井県": {"lat": 36.0652, "lng": 136.2217},
            "山梨県": {"lat": 35.6642, "lng": 138.5684},
            "長野県": {"lat": 36.6513, "lng": 138.1810},
            "岐阜県": {"lat": 35.3912, "lng": 136.7223},
            "静岡県": {"lat": 34.9769, "lng": 138.3831},
            "愛知県": {"lat": 35.1802, "lng": 136.9066},
            "三重県": {"lat": 34.7303, "lng": 136.5086},
            "滋賀県": {"lat": 35.0045, "lng": 135.8686},
            "京都府": {"lat": 35.0211, "lng": 135.7556},
            "大阪府": {"lat": 34.6937, "lng": 135.5023},
            "兵庫県": {"lat": 34.6913, "lng": 135.1830},
            "奈良県": {"lat": 34.6851, "lng": 135.8048},
            "和歌山県": {"lat": 34.2261, "lng": 135.1675},
            "鳥取県": {"lat": 35.5038, "lng": 134.2384},
            "島根県": {"lat": 35.4723, "lng": 133.0505},
            "岡山県": {"lat": 34.6617, "lng": 133.9349},
            "広島県": {"lat": 34.3963, "lng": 132.4596},
            "山口県": {"lat": 34.1861, "lng": 131.4706},
            "徳島県": {"lat": 34.0658, "lng": 134.5594},
            "香川県": {"lat": 34.3401, "lng": 134.0434},
            "愛媛県": {"lat": 33.8416, "lng": 132.7657},
            "高知県": {"lat": 33.5597, "lng": 133.5311},
            "福岡県": {"lat": 33.6064, "lng": 130.4181},
            "佐賀県": {"lat": 33.2494, "lng": 130.2989},
            "長崎県": {"lat": 32.7503, "lng": 129.8677},
            "熊本県": {"lat": 32.7898, "lng": 130.7417},
            "大分県": {"lat": 33.2382, "lng": 131.6126},
            "宮崎県": {"lat": 31.9111, "lng": 131.4239},
            "鹿児島県": {"lat": 31.5602, "lng": 130.5581},
            "沖縄県": {"lat": 26.2124, "lng": 127.6792}
        }
        
        # 座標を更新
        for company in companies:
            pref = company["prefecture"]
            if pref in prefecture_coords:
                # 都道府県の中心座標に少しランダムな変動を加える
                base_lat = prefecture_coords[pref]["lat"]
                base_lng = prefecture_coords[pref]["lng"]
                company["lat"] = base_lat + random.uniform(-0.5, 0.5)
                company["lng"] = base_lng + random.uniform(-0.5, 0.5)
        
        return companies
    
    def process_company_data(self, companies):
        """企業データを処理してDataFrameに変換"""
        if not companies:
            return pd.DataFrame()
        
        processed_data = []
        for company in companies:
            processed_data.append({
                "ticker": company.get("ticker", ""),
                "company_name": company.get("name", ""),
                "revenue_million_yen": company.get("revenue", 0),
                "employees": company.get("employees", 0),
                "prefecture": company.get("prefecture", ""),
                "latitude": company.get("lat", 0),
                "longitude": company.get("lng", 0),
                "revenue_per_employee": company.get("revenue", 0) / company.get("employees", 1) if company.get("employees", 0) > 0 else 0,
                "year": 2023
            })
        
        return pd.DataFrame(processed_data)
    
    def save_company_data(self, df, output_dir):
        """企業データを保存"""
        if df.empty:
            print("No company data to save")
            return
        
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV形式で保存
        csv_path = os.path.join(output_dir, 'company_data.csv')
        df.to_csv(csv_path, index=False)
        print(f"Company data saved to {csv_path}")
        
        # JSON形式でも保存
        json_path = os.path.join(output_dir, 'company_data.json')
        df.to_json(json_path, orient='records', indent=2)
        print(f"Company data saved to {json_path}")
        
        # 統計情報を出力
        print(f"\nCompany Data Summary:")
        print(f"Total companies: {len(df)}")
        print(f"Total revenue: {df['revenue_million_yen'].sum():,.0f} million yen")
        print(f"Total employees: {df['employees'].sum():,}")
        print(f"Average revenue per company: {df['revenue_million_yen'].mean():,.0f} million yen")
        print(f"Average employees per company: {df['employees'].mean():,.0f}")

def main():
    print("Starting company data collection...")
    print(f"Timestamp: {datetime.now()}")
    
    collector = CompanyDataCollector()
    
    # 企業リストを取得
    print("\n1. Fetching company list...")
    companies = collector.get_company_list()
    print(f"Found {len(companies)} companies")
    
    if not companies:
        print("No companies found. Exiting.")
        return
    
    # データを処理
    print("\n2. Processing company data...")
    company_df = collector.process_company_data(companies)
    
    # データを保存
    print("\n3. Saving company data...")
    output_dir = "/home/ubuntu/economic-visualization/data"
    collector.save_company_data(company_df, output_dir)
    
    print("\nCompany data collection completed!")
    print("Note: This uses mock data due to API key limitations.")
    print("For production use, implement full Buffett Code API integration.")

if __name__ == "__main__":
    main()

