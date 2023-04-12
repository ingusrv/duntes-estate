import express from "express";
import favicon from "serve-favicon";
import path from "path";
import xlsx from "xlsx";
import fs from "fs";

// definējam pāris mainīgos
const __dirname = path.resolve();
const PORT = 3000;
const API = "/api/v1";

const app = express();

const url = "https://siguldaspv.edu.lv/wp-content/uploads/2023/02/stundu_saraksts__6_02_23.xlsx";

if (!fs.existsSync("stundu_saraksts.xlsx")) {
    console.log("stundu saraksts netika atrasts, lejupielādējam jaunu")
    // lejupielādē stundu sarakstu un saglabā kā failu
    fetch(url).then(async (res) => {
        const blob = await res.blob();
        console.log(blob);
        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync("stundu_saraksts.xlsx", buffer);
    });
}

const workbook = xlsx.readFile("stundu_saraksts.xlsx");
let worksheet = undefined;

// worksheet = workbook.Sheets["Ind. un grupu nod. 5_I"];
// worksheet["!ref"] = "A3:E20";

worksheet = workbook.Sheets["10_12klase_16_01_2023"];
worksheet["!ref"] = "A2:AB16";//A2:AB64

const data = xlsx.utils.sheet_to_json(worksheet);

console.log(data);



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
    res.redirect("https://siguldaspv.edu.lv/wp-content/uploads/2023/02/Kons_graf_2_sem_22_23.pdf");
});

// startējam serveri
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
}); 