#!/usr/bin/env python3
"""
世界銀行APIから各国のGDPデータを取得するスクリプト
"""

import requests
import pandas as pd
import json
import time
from datetime import datetime
import os

class WorldBankDataCollector:
    def __init__(self):
        self.base_url = "https://api.worldbank.org/v2"
        self.gdp_indicator = "NY.GDP.MKTP.CD"  # GDP (current US$)
        self.population_indicator = "SP.POP.TOTL"  # Total population
        
    def get_countries(self):
        """全ての国のリストを取得"""
        url = f"{self.base_url}/country?format=json&per_page=300"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if len(data) > 1:
                countries = data[1]  # 最初の要素はメタデータ
                # 国のみを抽出（地域や集計データを除外）
                country_list = []
                for country in countries:
                    if country['capitalCity'] and country['longitude'] and country['latitude']:
                        country_list.append({
                            'id': country['id'],
                            'iso2Code': country['iso2Code'],
                            'name': country['name'],
                            'capitalCity': country['capitalCity'],
                            'longitude': float(country['longitude']),
                            'latitude': float(country['latitude']),
                            'region': country['region']['value'] if country['region']['value'] != 'Aggregates' else None,
                            'incomeLevel': country['incomeLevel']['value']
                        })
                
                return [c for c in country_list if c['region']]  # 地域情報があるもののみ
            
        except requests.RequestException as e:
            print(f"Error fetching countries: {e}")
            return []
    
    def get_indicator_data(self, country_codes, indicator, start_year=2010, end_year=2023):
        """指定した指標のデータを取得"""
        # 国コードを50個ずつのバッチに分割（APIの制限対応）
        batch_size = 50
        all_data = []
        
        for i in range(0, len(country_codes), batch_size):
            batch = country_codes[i:i + batch_size]
            country_string = ";".join(batch)
            
            url = f"{self.base_url}/country/{country_string}/indicator/{indicator}"
            params = {
                'format': 'json',
                'date': f"{start_year}:{end_year}",
                'per_page': 10000
            }
            
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if len(data) > 1 and data[1]:
                    all_data.extend(data[1])
                
                # API制限を避けるため少し待機
                time.sleep(0.1)
                
            except requests.RequestException as e:
                print(f"Error fetching data for batch {i//batch_size + 1}: {e}")
                continue
        
        return all_data
    
    def process_data(self, countries, gdp_data, population_data):
        """データを処理してDataFrameに変換"""
        # 国情報をDataFrameに変換
        countries_df = pd.DataFrame(countries)
        
        # GDP データを処理
        gdp_df = pd.DataFrame(gdp_data)
        if not gdp_df.empty:
            gdp_df = gdp_df[gdp_df['value'].notna()]
            gdp_df['year'] = gdp_df['date'].astype(int)
            gdp_df = gdp_df.rename(columns={'value': 'gdp_current_usd'})
            gdp_df = gdp_df[['countryiso3code', 'year', 'gdp_current_usd']]
        
        # 人口データを処理
        pop_df = pd.DataFrame(population_data)
        if not pop_df.empty:
            pop_df = pop_df[pop_df['value'].notna()]
            pop_df['year'] = pop_df['date'].astype(int)
            pop_df = pop_df.rename(columns={'value': 'population'})
            pop_df = pop_df[['countryiso3code', 'year', 'population']]
        
        # データを結合
        if not gdp_df.empty and not pop_df.empty:
            economic_df = pd.merge(gdp_df, pop_df, on=['countryiso3code', 'year'], how='outer')
        elif not gdp_df.empty:
            economic_df = gdp_df
        elif not pop_df.empty:
            economic_df = pop_df
        else:
            economic_df = pd.DataFrame()
        
        # 国情報と結合
        if not economic_df.empty:
            final_df = pd.merge(
                economic_df, 
                countries_df[['id', 'iso2Code', 'name', 'capitalCity', 'longitude', 'latitude', 'region', 'incomeLevel']], 
                left_on='countryiso3code', 
                right_on='id', 
                how='left'
            )
            
            # 1人当たりGDPを計算
            final_df['gdp_per_capita'] = final_df['gdp_current_usd'] / final_df['population']
            
            return final_df
        
        return pd.DataFrame()
    
    def save_data(self, df, output_dir):
        """データを保存"""
        if df.empty:
            print("No data to save")
            return
        
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV形式で保存
        csv_path = os.path.join(output_dir, 'world_bank_data.csv')
        df.to_csv(csv_path, index=False)
        print(f"Data saved to {csv_path}")
        
        # JSON形式でも保存（フロントエンド用）
        json_path = os.path.join(output_dir, 'world_bank_data.json')
        df.to_json(json_path, orient='records', indent=2)
        print(f"Data saved to {json_path}")
        
        # 最新年のデータのみを抽出
        latest_year = df['year'].max()
        latest_df = df[df['year'] == latest_year].copy()
        
        latest_csv_path = os.path.join(output_dir, f'world_bank_data_{latest_year}.csv')
        latest_df.to_csv(latest_csv_path, index=False)
        
        latest_json_path = os.path.join(output_dir, f'world_bank_data_{latest_year}.json')
        latest_df.to_json(latest_json_path, orient='records', indent=2)
        
        print(f"Latest data ({latest_year}) saved to {latest_csv_path} and {latest_json_path}")
        
        # 統計情報を出力
        print(f"\nData Summary:")
        print(f"Total records: {len(df)}")
        print(f"Countries: {df['countryiso3code'].nunique()}")
        print(f"Years: {df['year'].min()} - {df['year'].max()}")
        print(f"Records with GDP data: {df['gdp_current_usd'].notna().sum()}")
        print(f"Records with population data: {df['population'].notna().sum()}")

def main():
    print("Starting World Bank data collection...")
    print(f"Timestamp: {datetime.now()}")
    
    collector = WorldBankDataCollector()
    
    # 1. 国のリストを取得
    print("\n1. Fetching country list...")
    countries = collector.get_countries()
    print(f"Found {len(countries)} countries")
    
    if not countries:
        print("No countries found. Exiting.")
        return
    
    # 国コードのリストを作成
    country_codes = [c['id'] for c in countries]
    
    # 2. GDPデータを取得
    print("\n2. Fetching GDP data...")
    gdp_data = collector.get_indicator_data(country_codes, collector.gdp_indicator)
    print(f"Found {len(gdp_data)} GDP records")
    
    # 3. 人口データを取得
    print("\n3. Fetching population data...")
    population_data = collector.get_indicator_data(country_codes, collector.population_indicator)
    print(f"Found {len(population_data)} population records")
    
    # 4. データを処理
    print("\n4. Processing data...")
    final_df = collector.process_data(countries, gdp_data, population_data)
    
    # 5. データを保存
    print("\n5. Saving data...")
    output_dir = "/home/ubuntu/economic-visualization/data"
    collector.save_data(final_df, output_dir)
    
    print("\nWorld Bank data collection completed!")

if __name__ == "__main__":
    main()

