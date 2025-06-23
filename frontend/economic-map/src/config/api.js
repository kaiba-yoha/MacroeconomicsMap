// 環境変数からAPI URLを取得、フォールバックとして本番環境URLを使用
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ogh5izcvpyn3.manus.space';

// 開発環境用API設定（コメントアウト）
// export const API_BASE_URL = 'http://localhost:5001';

