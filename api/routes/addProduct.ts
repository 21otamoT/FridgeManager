import express, { type Request, type Response } from "express";
import axios from "axios";
import { pool } from "../db.ts";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  // 1. リクエストのヘッダーからトークンを取り出す
  const clientToken = req.headers["x-api-key"];

  // 2. トークンが一致するかチェック
  if (clientToken !== process.env.TOKEN) {
    res.status(401).json({ error: "認証エラー：トークンが一致しません" });
    return; // ここで処理を終了
  }
  const { jancode, name } = req.body;
  try {
    const dbResponse = await pool.query(
      "INSERT INTO products (jancode, name) VALUES ($1, $2) RETURNING *",
      [jancode, name],
    );
    res.json(dbResponse.rows[0]);
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({ error: "Failed to insert product" });
  }
});

export default router;
