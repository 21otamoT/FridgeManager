import express, { type Request, type Response } from "express";
import axios from "axios";
import { pool } from "../db.ts";

const router = express.Router();

// Yahoo! APIのレスポンス型定義（必要なものだけ）
interface YahooHit {
  name: string;
  code: string;
}
interface YahooResponse {
  hits: YahooHit[];
}

// APIのレスポンス型定義
interface ApiResponse {
  source: "yahoo" | "database";
  title: string;
}

router.get("/", async (req: Request, res: Response): Promise<any> => {
  // 1. リクエストのヘッダーからトークンを取り出す
  const clientToken = req.headers["x-api-key"];

  // 2. トークンが一致するかチェック
  if (clientToken !== process.env.TOKEN) {
    res.status(401).json({ error: "認証エラー：トークンが一致しません" });
    return; // ここで処理を終了
  }
  const jan = req.query.jan as string;

  if (!jan) {
    return res
      .status(400)
      .json({ error: "JANコード（jan）を指定してください" });
  }

  try {
    // 1. Yahoo!商品検索APIを呼び出し
    const yahooRes = await axios.get<YahooResponse>(
      "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch",
      {
        params: {
          appid: process.env.YAHOO_APP_ID,
          jan_code: jan,
        },
      },
    );

    // ヒットした場合は結果を返す
    if (yahooRes.data?.hits?.length > 0) {
      const responseData: ApiResponse = {
        source: "yahoo",
        title: yahooRes.data.hits[0]?.name ?? "",
      };
      return res.json(responseData);
    }

    // ヒットしなかった場合はカスタムエラーを投げてcatch節（DB検索）に飛ばす
    throw new Error("NOT_FOUND_IN_YAHOO");
  } catch (error: any) {
    // Yahooの障害、または商品未ヒットの場合はDBを検索
    console.log(
      "Yahoo APIで未検出またはエラー。DB検索に切り替えます。 Reason:",
      error.message,
    );

    try {
      const dbResult = await pool.query(
        "SELECT name FROM products WHERE jancode = $1 LIMIT 1",
        [jan],
      );

      if (dbResult.rows.length > 0) {
        const responseData: ApiResponse = {
          source: "database",
          title: dbResult.rows[0]?.name ?? "",
        };
        return res.json(responseData);
      } else {
        return res
          .status(404)
          .json({ error: "YahooにもDBにも商品が見つかりませんでした" });
      }
    } catch (dbError) {
      console.error("DBエラー:", dbError);
      return res
        .status(500)
        .json({ error: "サーバー内部エラーが発生しました" });
    }
  }
});

export default router;
