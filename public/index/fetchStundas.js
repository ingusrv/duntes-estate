const klaseEl = document.querySelector("#klase");
const virziensEl = document.querySelector("#virziens");
const sarakstsEl = document.querySelector("#stundu-saraksts");

function fetchStunduSaraksts(klase, virziens) {
    const params = new URLSearchParams();
    params.append("klase", klase);
    params.append("virziens", virziens);

    fetch(`/api/v1/stundas?${params.toString()}`).then(async (res) => {
        const body = await res.json();
        console.log(body);

        const day = new Date().getDay();

        const stundas = body[day - 1];
        console.log(stundas);

        stundas.stundas.forEach(stunda => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${stunda.numurs}</td><td>${stunda.nosaukums}</td><td>${stunda.kabinets}</td>`;
            sarakstsEl.appendChild(row);
        });
    });
}

fetchStunduSaraksts(klaseEl.value, virziensEl.value);

klaseEl.addEventListener("change", (e) => {
    console.log("ņemam jaunu sarakstu");
    fetchStunduSaraksts(klaseEl.value, virziensEl.value);
});