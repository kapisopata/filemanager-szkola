const fs = require("fs")
const path = require("path")


// if (!fs.existsSync("./newdir")) {
//     fs.mkdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("jest");
//     })
// }

// if (fs.existsSync("./newdir")) {
//     fs.rmdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("nie ma ");
//     })
// }

fs.readdir(__dirname, (err, files) => {
    if (err) throw err
    console.log("lista", files);
})




fetch("/test", options)
    .then(response => response.json()) // konwersja na obiekt json, jeśli konieczne
    .then(dataFromServer => alert(JSON.stringify(dataFromServer, null, 5))) // sformatowane z wcięciami dane odpowiedzi z serwera
    .catch(error => console.log(error));