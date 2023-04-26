import express from "express";
import favicon from "serve-favicon";
import path from "path";

// definējam pāris mainīgos
const __dirname = path.resolve();
const PORT = 3000;
const API = "/api/v1";

const app = express();

// GIT DEMO

// izmantojam middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public/favicon.ico")));

// sūtam index.html kad lietotājs nonāk galvenajā lapā
app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public/index/index.html"));
});

app.get("/konsultacijas", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public/konsultacijas/konsultacijas.html"));
});

// startējam serveri
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});