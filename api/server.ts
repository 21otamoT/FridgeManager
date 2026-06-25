import router from "./routes/index.ts";
import express from "express";

const app = express();

app.use(express.json());
app.use("/", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Server is running on ${url}`);
});
