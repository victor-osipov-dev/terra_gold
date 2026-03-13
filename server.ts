import express from "express";
import cors from "cors";
import { verifyTelegramInitData } from "./libs";

export const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        ok: true,
    });
});

app.post("/api/verify", (req, res) => {
    const { initData } = req.body;

    if (!verifyTelegramInitData(initData)) {
        return res.status(403).json({ error: "Invalid Telegram data" });
    }

    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get("user"));

    res.json({
        ok: true,
        user,
    });
});
