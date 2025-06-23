
import pandas as pd
import numpy as np
import json
import os

def generate_municipality_data():
    municipalities = []
    # 主要な都市のダミーデータを生成
    # 実際のデータと座標は異なる可能性があります
    # 緯度経度は、おおよその位置を示すためのものです
    data = [
        {"name": "札幌市", "lat": 43.06417, "lng": 141.34694, "population": 1970000, "gdp": 70000},
        {"name": "仙台市", "lat": 38.26889, "lng": 140.87194, "population": 1090000, "gdp": 40000},
        {"name": "さいたま市", "lat": 35.86139, "lng": 139.64583, "population": 1320000, "gdp": 50000},
        {"name": "千葉市", "lat": 35.60472, "lng": 140.12333, "population": 980000, "gdp": 35000},
        {"name": "東京都区部", "lat": 35.68944, "lng": 139.69167, "population": 9700000, "gdp": 400000},
        {"name": "横浜市", "lat": 35.44778, "lng": 139.64167, "population": 3770000, "gdp": 150000},
        {"name": "川崎市", "lat": 35.53028, "lng": 139.71667, "population": 1540000, "gdp": 60000},
        {"name": "名古屋市", "lat": 35.18028, "lng": 136.90667, "population": 2330000, "gdp": 90000},
        {"name": "京都市", "lat": 35.02139, "lng": 135.75556, "population": 1470000, "gdp": 55000},
        {"name": "大阪市", "lat": 34.69375, "lng": 135.50222, "population": 2750000, "gdp": 110000},
        {"name": "神戸市", "lat": 34.69139, "lng": 135.18306, "population": 1520000, "gdp": 60000},
        {"name": "広島市", "lat": 34.39639, "lng": 132.45944, "population": 1200000, "gdp": 45000},
        {"name": "福岡市", "lat": 33.59028, "lng": 130.40167, "population": 1630000, "gdp": 65000},
        {"name": "那覇市", "lat": 26.2125, "lng": 127.68111, "population": 320000, "gdp": 12000},
    ]

    for item in data:
        population = item["population"]
        gdp = item["gdp"]
        gdp_per_capita = (gdp * 1000000000000) / population if population > 0 else 0
        
        municipalities.append({
            "municipality_name": item["name"],
            "latitude": item["lat"],
            "longitude": item["lng"],
            "population": population,
            "gdp_million_yen": gdp * 1000, # 兆円から百万円に変換
            "gdp_per_capita": gdp_per_capita,
            "year": 2023
        })

    df = pd.DataFrame(municipalities)
    return df

def save_municipality_data(df, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, 'japan_municipality_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Municipality data saved to {csv_path}")

    json_path = os.path.join(output_dir, 'japan_municipality_data.json')
    df.to_json(json_path, orient='records', indent=2, force_ascii=False)
    print(f"Municipality data saved to {json_path}")

    print(f"\nMunicipality Data Summary:")
    print(f"Total municipalities: {len(df)}")
    print(f"Total population: {df['population'].sum():,}")
    print(f"Total GDP: {df['gdp_million_yen'].sum() / 1000000:,} trillion yen")
    print(f"Average GDP per capita: {df['gdp_per_capita'].mean():,.0f} yen")

if __name__ == "__main__":
    print("Generating municipality data...")
    municipality_df = generate_municipality_data()
    output_dir = "/home/ubuntu/economic-visualization/data"
    save_municipality_data(municipality_df, output_dir)


