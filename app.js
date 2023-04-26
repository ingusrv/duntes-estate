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
worksheet = workbook.Sheets["10_12klase_16_01_2023"];
worksheet["!ref"] = "A2:Q52";
const desmit_lidz_divpadsmit_klases = xlsx.utils.sheet_to_html(worksheet);
worksheet = workbook.Sheets["1.-4.kl_16_01_2023"];
const viens_lidz_cetri_klases = xlsx.utils.sheet_to_html(worksheet);
const days = 5;
// worksheets "1.-4.kl_16_01_2023", "4_6_klase_6_02_2023", "7.-9._6_02_2023", "10_12klase_16_01_2023"
const offsets = [
    {
        "worksheet": "1.-4.kl_16_01_2023",
        "irVirzieni": false,
        "klase": ["E2", "G2", "I2", "J2", "K2", "M2", "O2", "P2", "Q2", "R2", "T2", "V2", "W2"],
        "1.a": "E3:E12",
        "1.b": "G3:G12",
        "1.c": "I3:I12",
        "1.s": "J3:J12",
        "2.a": "K3:K12",
        "2.b": "M3:M12",
        "2.c": "O3:O12",
        "2.s-1": "P3:P12",
        "2.s-2": "Q3:Q12",
        "3.a": "R3:R12",
        "3.b": "T3:T12",
        "3.c": "V3:V12",
        "3.s": "W3:W12"
    }
];
const saraksts = {
    "1.a": [],
    "1.b": [],
    "1.c": [],
    "1.s": [],
    "2.a": [],
    "2.b": [],
    "2.c": [],
    "2.s-1": [],
    "2.s-2": [],
    "3.a": [],
    "3.b": [],
    "3.c": [],
    "3.s": []
};
offsets[0].klase.forEach(klase_offset => {
    // create new thing in saraksts object
    for (let day = 0; day < days; day++) {
        worksheet = workbook.Sheets[offsets[0].worksheet];
        const klase = worksheet[klase_offset].v;
        console.log("klase: ", klase);
        let stundu_offset = offsets[0][klase];
        // stundu_offset = stundu_offset.split(":");
        // stundu_offset.forEach(item => console.log(item.split(/[A-Z]/)));
        const start_offset = Number.parseInt(stundu_offset.match(/\d/)[0]) + 10 * day;
        const end_offset = Number.parseInt(stundu_offset.match(/\d\d/)[0]) + 10 * day;
        stundu_offset = stundu_offset.replace(/\d\d/, end_offset);
        stundu_offset = stundu_offset.replace(/\d/, start_offset);
        console.log("start", start_offset, "end", end_offset);
        console.log("offset: ", stundu_offset);
        worksheet["!ref"] = stundu_offset;
        const stundas = xlsx.utils.sheet_to_json(worksheet);
        console.log(stundas);
        const diena = { diena: day, stundas: [] }
        stundas.forEach((obj) => {
            diena.stundas.push(obj["__EMPTY"]);
        });
        saraksts[klase].push(diena);
    }
});

console.log("stundu saraksts", saraksts);

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

app.get("/1lidz4", (req, res) => {
    res.status(200).send(viens_lidz_cetri_klases);
});

app.get("/10lidz12", (req, res) => {
    res.status(200).send(desmit_lidz_divpadsmit_klases);
});

// startējam serveri
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
}); 