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


const desmit_lidz_divpadsmit_klases = xlsx.utils.sheet_to_html(workbook.Sheets["10_12klase_16_01_2023"]);
const viens_lidz_cetri_klases = xlsx.utils.sheet_to_html(workbook.Sheets["1.-4.kl_16_01_2023"]);
const cetri_lidz_sesi_klases = xlsx.utils.sheet_to_html(workbook.Sheets["4_6_klase_6_02_2023"]);

let worksheet = undefined;
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
    },
    {
        "worksheet": "4_6_klase_6_02_2023",
        "irVirzieni": false,
        "klase": ["D2", "H2", "L2", "P2", "T2", "X2", "AB2", "AF2", "AJ2", "AN2", "AR2", "AV2"],
        "4.a": "D3:F14",
        "4.b": "H3:J14",
        "4.c": "L3:N14",
        "4.s": "P3:R14",
        "5.a": "T3:V14",
        "5.b": "X3:Z14",
        "5.c": "AB3:AD14",
        "5.s": "AF3:AH14",
        "6.a": "AJ3:AL14",
        "6.b": "AN3:AP14",
        "6.c": "AR3:AT14",
        "6.s": "AV3:AX14"
    },
    {
        "worksheet": "7.-9._6_02_2023",
        "irVirzieni": false,
        "klase": ["D2", "H2", "L2", "P2", "T2", "X2", "AB2", "AF2", "AJ2", "AN2"],
        "7.a": "D3:F14",
        "7.b": "H3:J14",
        "7.c": "L3:N14",
        "8.a": "P3:R14",
        "8.b": "T3:V14",
        "8.c": "X3:Z14",
        "8.d": "AB3:AD14",
        "9.a": "AF3:AH14",
        "9.b": "AJ3:AL14",
        "9.c": "AN3:AP14",
    }
];

const saraksts = {};

// TODO: apvienot visu vienā
// 1. līdz 3. klase
offsets[0].klase.forEach(klase_offset => {
    worksheet = workbook.Sheets[offsets[0].worksheet];
    const klase = worksheet[klase_offset].v;
    console.log("klase: ", klase);
    saraksts[klase] = [];

    for (let day = 0; day < days; day++) {
        let stundu_offset = offsets[0][klase];
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
        stundas.forEach((stunda, i) => {
            const v = Object.values(stunda);
            const s = {
                numurs: i + 1,
                divi: false,
                nosaukums: v[0],
                kabinets: v[1]
            };
            diena.stundas.push(s);
        });
        saraksts[klase].push(diena);
    }
});

// 4. līdz 6. klase
offsets[1].klase.forEach(klase_offset => {
    worksheet = workbook.Sheets[offsets[1].worksheet];
    const klase = worksheet[klase_offset].v.match(/\d.\w/)[0];
    console.log("klase: ", klase);
    saraksts[klase] = [];

    for (let day = 0; day < days; day++) {
        let stundu_offset = offsets[1][klase];
        let start_offset = Number.parseInt(stundu_offset.match(/\d/)[0]) + 10 * day + 1;
        let end_offset = Number.parseInt(stundu_offset.match(/\d\d/)[0]) + 10 * day + 1;
        // TODO: izņemt šo
        if (day === 0) {
            start_offset -= 1;
            end_offset -= 1;
        }
        if (day === 1) {
            end_offset -= 1;
        }
        if (day === 3) {
            start_offset += 1;
            end_offset += 1;
        }
        if (day === 4) {
            start_offset += 2;
            end_offset += 2;
        }
        stundu_offset = stundu_offset.replace(/\d\d/, end_offset);
        stundu_offset = stundu_offset.replace(/\d/, start_offset);
        console.log("start", start_offset, "end", end_offset);
        console.log("offset: ", stundu_offset);
        worksheet["!ref"] = stundu_offset;
        const stundas = xlsx.utils.sheet_to_json(worksheet);
        console.log(stundas);
        const diena = { diena: day, stundas: [] }
        let n = 1;
        stundas.forEach((stunda, i) => {
            if (i === 1 || i === 2) {
                return;
            }

            const s = {
                numurs: n,
                divi: false,
                nosaukums: undefined,
                kabinets: undefined,
            };
            const v = Object.values(stunda);
            if (v.length === 3) {
                s.divi = true;
                s.nosaukums = v[0];
                s.nosaukums2 = v[1];
                const kabineti = v[2].split("/");
                s.kabinets = kabineti[0];
                s.kabinets2 = kabineti[1];
                diena.stundas.push(s);
                n += 1;
                return;
            }

            s.nosaukums = v[0];
            s.kabinets = v[1];

            diena.stundas.push(s);
            n += 1;
        });
        saraksts[klase].push(diena);
    }
});

// 7. līdz 9. klase
offsets[2].klase.forEach(klase_offset => {
    worksheet = workbook.Sheets[offsets[2].worksheet];
    const klase = worksheet[klase_offset].v.match(/\d.\w/)[0];
    console.log("klase: ", klase);
    saraksts[klase] = [];

    for (let day = 0; day < days; day++) {
        let stundu_offset = offsets[2][klase];
        let start_offset = Number.parseInt(stundu_offset.match(/\d/)[0]) + 10 * day + 1;
        let end_offset = Number.parseInt(stundu_offset.match(/\d\d/)[0]) + 10 * day + 1;
        // TODO: izņemt šo
        if (day === 0) {
            start_offset -= 1;
            end_offset -= 1;
        }
        if (day === 1 || day === 2) {
            end_offset += 1;
        }
        if (day === 2) {
            start_offset += 2;
            end_offset += 2;
        }
        if (day === 3) {
            start_offset += 4;
            end_offset += 4;
        }
        if (day === 4) {
            start_offset += 5;
            end_offset += 5;
        }
        stundu_offset = stundu_offset.replace(/\d\d/, end_offset);
        stundu_offset = stundu_offset.replace(/\d/, start_offset);
        console.log("start", start_offset, "end", end_offset);
        console.log("offset: ", stundu_offset);
        worksheet["!ref"] = stundu_offset;
        const stundas = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
        // console.log(stundas);
        const diena = { diena: day, stundas: [] }
        let n = 1;
        stundas.forEach((stunda, i) => {
            if (i === 1 || i === 2) {
                return;
            }

            const s = {
                numurs: n,
                divi: false,
                nosaukums: undefined,
                kabinets: undefined,
            };
            const v = Object.values(stunda);
            if (v.length === 3) {
                s.divi = true;
                s.nosaukums = v[0];
                s.nosaukums2 = v[1];
                const kabineti = v[2].split("/");
                s.kabinets = kabineti[0];
                s.kabinets2 = kabineti[1];
                diena.stundas.push(s);
                n += 1;
                return;
            }

            s.nosaukums = v[0];
            s.kabinets = v[1];

            diena.stundas.push(s);
            n += 1;
        });
        saraksts[klase].push(diena);
    }
});

console.log("stundu saraksts", saraksts["7.a"][0]);

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

app.get("/4lidz6", (req, res) => {
    res.status(200).send(cetri_lidz_sesi_klases);
});

app.get("/10lidz12", (req, res) => {
    res.status(200).send(desmit_lidz_divpadsmit_klases);
});

// startējam serveri
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
}); 