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



// Datu nolasīšana

const url = "https://onedrive.live.com/embed?resid=C39F579EE1333DFC%212112358&authkey=%21AFhpEl_KYccQa7c&em=2&wdAllowInteractivity=False&Item=%27Lapa1%27!A1%3AE98&wdHideGridlines=True&wdInConfigurator=True&wdHideHeaders=True&wdInConfigurator=True&wdHideSheetTabs=True";
const table = document.createElement("table");
document.body.appendChild(table);

fetch(url)
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const dataRows = doc.querySelectorAll("table tbody tr");
    dataRows.forEach(row => {
      const cells = row.querySelectorAll("td");
      const tableRow = document.createElement("tr");
      cells.forEach(cell => {
        const tableCell = document.createElement("td");
        tableCell.textContent = cell.textContent;
        tableRow.appendChild(tableCell);
      });
      table.appendChild(tableRow);
    });
  });