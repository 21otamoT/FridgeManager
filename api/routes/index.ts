import search from "./search.ts";
import addProduct from "./addProduct.ts";
import express from "express";

const router = express.Router();

router.use("/api/search", search);
router.use("/api/addProduct", addProduct);

export default router;
