import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(8001, "0.0.0.0", () => {
  console.log("server started");
});
