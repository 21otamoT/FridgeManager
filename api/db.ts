import { Pool } from "pg";
import dotenv from "dotenv";

// これを書くことで、ローカル環境では `.env` ファイルの中身が読み込まれます。
// Render環境では、Renderのダッシュボードで設定した環境変数が優先して読み込まれます。
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 自動的に切り替わる！
  ssl: {
    rejectUnauthorized: false,
  },
});
