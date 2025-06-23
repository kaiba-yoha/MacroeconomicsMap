from flask import Blueprint, jsonify, request
import json
import os
import csv
from flask_cors import cross_origin

economic_bp = Blueprint('economic', __name__)

# データファイルのパス
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def read_csv_to_dict(filepath):
    """CSVファイルを辞書のリストとして読み込む"""
    data = []
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # 数値データの変換
                for key, value in row.items():
                    if value == '' or value == 'nan':
                        row[key] = 0
                    else:
                        try:
                            # 数値に変換を試行
                            if '.' in value:
                                row[key] = float(value)
                            else:
                                row[key] = int(value)
                        except (ValueError, TypeError):
                            # 文字列のまま保持
                            pass
                data.append(row)
    except Exception as e:
        print(f"Error reading CSV file {filepath}: {e}")
    return data

@economic_bp.route('/countries', methods=['GET'])
@cross_origin()
def get_countries():
    """世界各国のGDPデータを取得"""
    try:
        # JSONファイルを直接読み込み
        json_path = os.path.join(DATA_DIR, 'world_bank_data_2023.json')
        if not os.path.exists(json_path):
            json_path = os.path.join(DATA_DIR, 'world_bank_data.json')
        
        if not os.path.exists(json_path):
            return jsonify({"error": "Country data not found"}), 404
        
        with open(json_path, 'r', encoding='utf-8') as file:
            countries_data = json.load(file)
        
        return jsonify({
            "status": "success",
            "data": countries_data,
            "count": len(countries_data)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@economic_bp.route('/prefectures', methods=['GET'])
@cross_origin()
def get_prefectures():
    """日本の都道府県データを取得"""
    try:
        json_path = os.path.join(DATA_DIR, 'japan_prefecture_data.json')
        
        if not os.path.exists(json_path):
            return jsonify({"error": "Prefecture data not found"}), 404
        
        with open(json_path, 'r', encoding='utf-8') as file:
            prefectures_data = json.load(file)
        
        return jsonify({
            "status": "success",
            "data": prefectures_data,
            "count": len(prefectures_data)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@economic_bp.route('/companies', methods=['GET'])
@cross_origin()
def get_companies():
    """企業データを取得"""
    try:
        json_path = os.path.join(DATA_DIR, 'company_data.json')
        
        if not os.path.exists(json_path):
            return jsonify({"error": "Company data not found"}), 404
        
        with open(json_path, 'r', encoding='utf-8') as file:
            companies_data = json.load(file)
        
        # クエリパラメータで都道府県フィルタリング
        prefecture = request.args.get('prefecture')
        if prefecture:
            companies_data = [c for c in companies_data if c.get('prefecture') == prefecture]
        
        # 売上高でフィルタリング（最小値）
        min_revenue = request.args.get('min_revenue', type=int)
        if min_revenue:
            companies_data = [c for c in companies_data if c.get('revenue_million_yen', 0) >= min_revenue]
        
        return jsonify({
            "status": "success",
            "data": companies_data,
            "count": len(companies_data)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@economic_bp.route('/stats', methods=['GET'])
@cross_origin()
def get_stats():
    """統計情報を取得"""
    try:
        stats = {}
        
        # 世界データの統計
        world_json = os.path.join(DATA_DIR, 'world_bank_data_2023.json')
        if os.path.exists(world_json):
            with open(world_json, 'r', encoding='utf-8') as file:
                world_data = json.load(file)
            
            total_gdp = sum(item.get('gdp_current_usd', 0) for item in world_data)
            total_population = sum(item.get('population', 0) for item in world_data)
            gdp_per_capita_values = [item.get('gdp_per_capita', 0) for item in world_data if item.get('gdp_per_capita', 0) > 0]
            avg_gdp_per_capita = sum(gdp_per_capita_values) / len(gdp_per_capita_values) if gdp_per_capita_values else 0
            
            stats['world'] = {
                "total_countries": len(world_data),
                "total_gdp_usd": total_gdp,
                "total_population": total_population,
                "avg_gdp_per_capita": avg_gdp_per_capita
            }
        
        # 日本都道府県データの統計
        pref_json = os.path.join(DATA_DIR, 'japan_prefecture_data.json')
        if os.path.exists(pref_json):
            with open(pref_json, 'r', encoding='utf-8') as file:
                pref_data = json.load(file)
            
            total_gdp = sum(item.get('gdp_trillion_yen', 0) for item in pref_data)
            total_population = sum(item.get('population', 0) for item in pref_data)
            gdp_per_capita_values = [item.get('gdp_per_capita', 0) for item in pref_data if item.get('gdp_per_capita', 0) > 0]
            avg_gdp_per_capita = sum(gdp_per_capita_values) / len(gdp_per_capita_values) if gdp_per_capita_values else 0
            
            stats['japan_prefectures'] = {
                "total_prefectures": len(pref_data),
                "total_gdp_trillion_yen": total_gdp,
                "total_population": total_population,
                "avg_gdp_per_capita": avg_gdp_per_capita
            }
        
        # 企業データの統計
        company_json = os.path.join(DATA_DIR, 'company_data.json')
        if os.path.exists(company_json):
            with open(company_json, 'r', encoding='utf-8') as file:
                company_data = json.load(file)
            
            total_revenue = sum(item.get('revenue_million_yen', 0) for item in company_data)
            total_employees = sum(item.get('employees', 0) for item in company_data)
            revenue_per_employee_values = [item.get('revenue_per_employee', 0) for item in company_data if item.get('revenue_per_employee', 0) > 0]
            avg_revenue_per_employee = sum(revenue_per_employee_values) / len(revenue_per_employee_values) if revenue_per_employee_values else 0
            
            stats['companies'] = {
                "total_companies": len(company_data),
                "total_revenue_million_yen": total_revenue,
                "total_employees": total_employees,
                "avg_revenue_per_employee": avg_revenue_per_employee
            }
        
        return jsonify({
            "status": "success",
            "data": stats
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@economic_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """ヘルスチェック"""
    return jsonify({
        "status": "healthy",
        "service": "Economic Data API",
        "version": "1.0.0"
    })

@economic_bp.route('/data-info', methods=['GET'])
@cross_origin()
def get_data_info():
    """データファイルの情報を取得"""
    try:
        data_info = {}
        
        # データファイルの存在確認
        files_to_check = [
            'world_bank_data.json',
            'world_bank_data_2023.json',
            'japan_prefecture_data.json',
            'company_data.json'
        ]
        
        for filename in files_to_check:
            filepath = os.path.join(DATA_DIR, filename)
            if os.path.exists(filepath):
                stat = os.stat(filepath)
                data_info[filename] = {
                    "exists": True,
                    "size_bytes": stat.st_size,
                    "modified_time": stat.st_mtime
                }
            else:
                data_info[filename] = {
                    "exists": False
                }
        
        return jsonify({
            "status": "success",
            "data_directory": DATA_DIR,
            "files": data_info
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@economic_bp.route('/sources', methods=['GET'])
@cross_origin()
def get_data_sources():
    """データソースの情報を取得"""
    try:
        sources = [
            {
                "name": "世界銀行 World Bank API",
                "description": "世界各国のGDP、人口データ",
                "url": "https://datahelpdesk.worldbank.org/knowledgebase/articles/898599",
                "data_year": "2023年",
                "license": "Creative Commons Attribution 4.0"
            },
            {
                "name": "内閣府 県民経済計算",
                "description": "日本の都道府県別GDP、人口データ",
                "url": "https://www.esri.cao.go.jp/jp/sna/sonota/kenmin/kenmin_top.html",
                "data_year": "2022年度",
                "license": "政府標準利用規約"
            },
            {
                "name": "企業売上データ",
                "description": "上場企業の売上高、従業員数データ（模擬データ）",
                "url": "https://example.com/company-data",
                "data_year": "2023年",
                "license": "サンプルデータ"
            }
        ]
        
        return jsonify({
            "status": "success",
            "data": sources,
            "count": len(sources)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

