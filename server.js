const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 3000;
const fs = require("fs");
const path = require('path');
const hbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    helpers: {
        encodeURI: function (index) {
            return encodeURI(index);
        },
        encodeURIComponent: function (index) {
            return encodeURIComponent(index);
        },
        gt: (a, b) => a > b,
        eq: (a, b) => a === b,
    },
    extname: '.hbs',
    partialsDir: "views/partials",
}));
app.set('view engine', 'hbs');
const formidable = require('formidable');
app.use(express.static('static'))
app.use(express.static('files'))

let uploadedFiles = [];

app.get("/", function (req, res) {
    res.render('upload.hbs');
})

app.post('/upload', function (req, res) {
    let form = formidable({});

    form.keepExtensions = true // zapis z rozszerzeniem pliku
    form.multiples = true
    form.uploadDir = __dirname + '/static/upload/' // folder do zapisu zdjęcia

    form.parse(req, function (err, fields, files) {
        let fileArray;
        if (Array.isArray(files.imagetoupload)) {
            fileArray = files.imagetoupload;
        }
        else {
            fileArray = [files.imagetoupload];
        }

        let maxId;
        if (uploadedFiles.length > 0) {
            maxId = 0;

            for (let i = 0; i < uploadedFiles.length; i++) {
                if (uploadedFiles[i].id > maxId) {
                    maxId = uploadedFiles[i].id; // jak id jest większe to aktualizujemy maxId
                };
            };
        }
        else {
            maxId = 0;
        };


        maxId++;

        res.redirect('/filemanager');
    });
});


app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', { uploadedFiles });
});


app.get("/info", function (req, res) {
    res.render('info.hbs');
});


app.get("/show/:id", function (req, res) {
    let fileId = parseInt(req.params.id);

    uploadedFiles.forEach((f) => {
        if (f.id === fileId) {
            file = f;
        }
    });

    let isImage = file.type.startsWith("image/");
    let filePath = "/upload/" + path.basename(file.path); // zwraca tylko nazwę pliku z pełnej ścieżki
    console.log(filePath);

    res.render('show.hbs', { filePath, isImage });
});


app.get("/info/:id", function (req, res) {
    let fileId = parseInt(req.params.id);
    let file = null;

    uploadedFiles.forEach((f) => {
        if (f.id === fileId) {
            file = f;
        }
    });
    res.render("info.hbs", { file });
});


app.get("/download/:id", function (req, res) {
    let fileId = parseInt(req.params.id);
    let file = null;

    uploadedFiles.forEach((f) => {
        if (f.id === fileId) {
            file = f;
        }
    });
    res.download(file.path); //mozna dac file.name i bedzie pobieralo z właściwa nazwa
});


app.get("/delete/:id", function (req, res) {
    let fileId = parseInt(req.params.id);
    let indexToRemove = -1; //indeks pliku na -1 czyli zakładam ze nie znaleziono

    uploadedFiles.forEach((f, index) => {
        if (f.id === fileId) {
            indexToRemove = index;
        }
    });

    if (indexToRemove !== -1) {
        uploadedFiles.splice(indexToRemove, 1); //usuwamy jeden plik o tym indeksie
    };

    res.redirect("/filemanager");
    console.log(uploadedFiles);
});


app.get("/reset", function (req, res) {
    uploadedFiles = [];
    res.redirect('/filemanager');
});


// - - - - - - - - - - - - - - -  czesc 2

// const directoryPath = path.join(__dirname, "files")

// app.get("/filemanager2", function (req, res) {
//     fs.readdir(directoryPath, (err, files) => {
//         if (err) throw err;

//         let uploadedFolders = [];
//         let uploadedFiles = [];

//         if (files.length == 0) {
//             return res.render('filemanager2.hbs', { uploadedFolders, uploadedFiles });
//         }

//         let processed = 0;
//         files.forEach((file) => {
//             const filePath = path.join(directoryPath, file);

//             fs.lstat(filePath, (err, stats) => {
//                 if (err) return;

//                 if (stats.isDirectory()) {
//                     uploadedFolders.push({
//                         name: file,
//                         icon: "DIR"
//                     });
//                 } else {
//                     const extension = path.extname(file);
//                     let icon;
//                     if (extension == ".txt") icon = "TXT"
//                     else if (extension == ".jpg") icon = "JPG"
//                     else if (extension == ".jpeg") icon = "JPEG"
//                     else if (extension == ".gif") icon = "GIF"
//                     else if (extension == ".png") icon = "PNG"
//                     else if (extension == ".ico") icon = "ICO"
//                     else if (extension == ".html") icon = "HTML"
//                     else if (extension == ".css") icon = "CSS"
//                     else if (extension == ".js") icon = "JS"
//                     else if (extension == ".json") icon = "JSON"
//                     else { icon = "---" }

//                     uploadedFiles.push({
//                         name: file,
//                         icon: icon,
//                     });
//                 }

//                 processed++;
//                 if (processed === files.length) {
//                     res.render('filemanager2.hbs', { uploadedFolders, uploadedFiles });
//                 }
//             });
//         });
//     })
// })


// app.post("/filemanager2", function (req, res) {

//     let value_file = req.body.fileName;
//     let value_folder = req.body.folderName;

//     if (value_file) {
//         let originalName = value_file;
//         let filePath = path.join(__dirname, "files", originalName)
//         let counter = 1;

//         while (fs.existsSync(filePath)) {
//             value_file = `kopia_${counter}_${originalName}`;
//             filePath = path.join(__dirname, "files", value_file);
//             counter++;
//         }

//         fs.writeFile(filePath, "tekst do wpisania", (err) => {
//             if (err) throw err;
//             console.log("plik dodany:", value_file);
//             res.redirect("/filemanager2");
//         })
//     }
//     else if (value_folder) {
//         let originalName2 = value_folder;
//         let folderPath = path.join(__dirname, "files", originalName2);
//         let counter2 = 1;

//         while (fs.existsSync(folderPath)) {
//             value_folder = `kopia_${counter2}_${originalName2}`;
//             folderPath = path.join(__dirname, "files", value_folder);
//             counter2++;
//         }

//         fs.mkdir(`./files/${value_folder}`, (err) => {
//             if (err) throw err;
//             console.log("folder dodany:", value_folder);
//             res.redirect("/filemanager2");
//         })
//     } else {
//         console.log("nie podano żadnej nazwy");
//         res.redirect("/filemanager2");
//     }
// })


// app.post('/upload2', function (req, res) {
//     let form = formidable({});

//     form.keepExtensions = true; // zapis z rozszerzeniem pliku
//     form.multiples = true;
//     form.uploadDir = __dirname + '/files/'; // folder do zapisu plików

//     form.parse(req, function (err, fields, files) {
//         if (err) throw err;

//         let fileArray;
//         if (Array.isArray(files.imagetoupload)) {
//             fileArray = files.imagetoupload;
//         }
//         else {
//             fileArray = [files.imagetoupload];
//         }

//         fileArray.forEach((file) => {
//             let originalName = file.name;
//             let filePath = path.join(__dirname, "files", originalName);
//             let counter = 1;

//             while (fs.existsSync(filePath)) {
//                 file.name = `kopia_${counter}_${originalName}`;
//                 filePath = path.join(__dirname, "files", file.name);
//                 counter++;
//             }

//             fs.rename(file.path, filePath, (err) => {
//                 if (err) throw err;
//                 console.log("Plik zapisany: ", file.name);
//             });
//         })

//         res.redirect('/filemanager2');
//     });
// });


// app.get('/delete-folder/:name', (req, res) => {
//     const folderName = decodeURIComponent(req.params.name);

//     fs.rmdir(`./files/${folderName}`, (err) => {
//         if (err) throw err;
//         res.redirect('/filemanager2');
//     });
// });


// app.get('/delete-file/:name', (req, res) => {
//     const fileName = decodeURIComponent(req.params.name);
//     const filePath = path.join(__dirname, 'files', fileName);

//     fs.unlink(filePath, (err) => {
//         if (err) throw err;
//         res.redirect('/filemanager2');
//     });
// });




// - - - - - - - - - - - - - - -  czesc 3

// app.get('/filemanager3', function (req, res) {
//     let currentPath = path.join(__dirname, "files");
//     let relativePath = "";

//     let trail = [{ name: "files", path: "" }];

//     fs.readdir(currentPath, (err, files) => {
//         if (err) throw err;

//         let uploadedFolders = [];
//         let uploadedFiles = [];
//         let processed = 0;

//         if (files.length === 0) {
//             return res.render('filemanager3', {
//                 uploadedFolders,
//                 uploadedFiles,
//                 currentPath: relativePath,
//                 trail,
//                 currentFolderName: path.basename(relativePath)
//             });
//         }

//         files.forEach((file) => {
//             let filePath = path.join(currentPath, file);

//             fs.lstat(filePath, (err, stats) => {
//                 if (err) throw err;

//                 if (stats.isDirectory()) {
//                     uploadedFolders.push({
//                         name: file,
//                         icon: "DIR",
//                         path: file,
//                     });
//                 } else {
//                     let extension = path.extname(file);
//                     let icon;
//                     if (extension == ".txt") icon = "TXT"
//                     else if (extension == ".jpg") icon = "JPG"
//                     else if (extension == ".jpeg") icon = "JPEG"
//                     else if (extension == ".gif") icon = "GIF"
//                     else if (extension == ".png") icon = "PNG"
//                     else if (extension == ".ico") icon = "ICO"
//                     else if (extension == ".html") icon = "HTML"
//                     else if (extension == ".css") icon = "CSS"
//                     else if (extension == ".js") icon = "JS"
//                     else if (extension == ".json") icon = "JSON"
//                     else { icon = "---" }

//                     let fileRelativePath = path.join(relativePath, file);

//                     uploadedFiles.push({
//                         name: file,
//                         icon: icon,
//                         path: fileRelativePath,
//                     });
//                 }

//                 processed++;
//                 if (processed === files.length) {
//                     res.render("filemanager3.hbs", {
//                         uploadedFolders,
//                         uploadedFiles,
//                         currentPath: relativePath,
//                         trail,
//                         currentFolderName: path.basename(relativePath)
//                     });
//                 };
//             });
//         });
//     });
// });


// app.get("/filemanager3/*", function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, "files", relativePath);

//     if (!fs.existsSync(currentPath)) {
//         return res.status(404).send('path nie istnieje');
//     }

//     let pathParts = relativePath.split('/').filter(part => part);
//     let trail = [{ name: "files", path: "" }];

//     for (let i = 0; i < pathParts.length; i++) {
//         let part = pathParts[i];
//         let currentPath = "";

//         for (let j = 0; j <= i; j++) {
//             currentPath += (j > 0 ? "/" : "") + pathParts[j];
//         }

//         trail.push({
//             name: part,
//             path: currentPath
//         });
//     }

//     fs.readdir(currentPath, (err, files) => {
//         if (err) throw err;

//         let uploadedFolders = [];
//         let uploadedFiles = [];
//         let processed = 0;

//         if (files.length === 0) {
//             return res.render('filemanager3', {
//                 uploadedFolders,
//                 uploadedFiles,
//                 currentPath: relativePath,
//                 trail,
//                 currentFolderName: path.basename(relativePath)
//             });
//         };

//         files.forEach((file) => {
//             let filePath = path.join(currentPath, file);

//             fs.lstat(filePath, (err, stats) => {
//                 if (err) throw err;

//                 if (stats.isDirectory()) {
//                     uploadedFolders.push({
//                         name: file,
//                         icon: "DIR",
//                         path: path.join(relativePath, file),
//                     });
//                 } else {
//                     let extension = path.extname(file);
//                     let icon;
//                     if (extension == ".txt") icon = "TXT"
//                     else if (extension == ".jpg") icon = "JPG"
//                     else if (extension == ".jpeg") icon = "JPEG"
//                     else if (extension == ".gif") icon = "GIF"
//                     else if (extension == ".png") icon = "PNG"
//                     else if (extension == ".ico") icon = "ICO"
//                     else if (extension == ".html") icon = "HTML"
//                     else if (extension == ".css") icon = "CSS"
//                     else if (extension == ".js") icon = "JS"
//                     else if (extension == ".json") icon = "JSON"
//                     else { icon = "---" }

//                     let fileRelativePath = path.join(relativePath, file);

//                     uploadedFiles.push({
//                         name: file,
//                         icon: icon,
//                         path: fileRelativePath,
//                     });
//                 }

//                 processed++;
//                 if (processed === files.length) {
//                     res.render("filemanager3.hbs", {
//                         uploadedFolders,
//                         uploadedFiles,
//                         currentPath: relativePath,
//                         trail,
//                         currentFolderName: path.basename(relativePath)
//                     });
//                 };
//             });
//         });
//     });
// });


// app.post('/filemanager3/*', function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);

//     let { fileName, folderName } = req.body;

//     if (fileName) {
//         let newFileName = path.basename(fileName);
//         let filePath = path.join(currentPath, newFileName);
//         let counter = 1;

//         while (fs.existsSync(filePath)) {
//             filePath = path.join(currentPath, `kopia_${counter}_${newFileName}`);
//             counter++;
//         }
//         fs.writeFile(filePath, 'tekst do wpisania', (err) => {
//             if (err) throw err;
//             console.log("plik dodany:", fileName);
//             res.redirect(`/filemanager3/${relativePath}`);
//         });
//     } else if (folderName) {
//         let newFolderName = path.basename(folderName);
//         let folderPath = path.join(currentPath, newFolderName);
//         let counter2 = 1;

//         while (fs.existsSync(folderPath)) {
//             folderPath = path.join(currentPath, `kopia_${counter2}_${newFolderName}`);
//             counter2++;
//         }
//         fs.mkdir(folderPath, (err) => {
//             if (err) throw err;
//             console.log("folder dodany:", folderName);
//             res.redirect(`/filemanager3/${relativePath}`);
//         });
//     } else {
//         console.log("Nie podano żadnej nazwy");
//         res.redirect(`/filemanager3/${relativePath}`);
//     }
// });


// app.post('/upload3/*', function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);

//     let form = formidable({});

//     form.keepExtensions = true; // zapis z rozszerzeniem pliku
//     form.multiples = true;
//     form.uploadDir = currentPath; // folder do zapisu plików

//     form.parse(req, function (err, fields, files) {
//         if (err) throw err;

//         let fileArray;
//         if (Array.isArray(files.imagetoupload)) {
//             fileArray = files.imagetoupload;
//         }
//         else {
//             fileArray = [files.imagetoupload];
//         }

//         fileArray.forEach((file) => {
//             let newPath = path.join(currentPath, file.name);
//             let counter = 1;

//             while (fs.existsSync(newPath)) {
//                 newPath = path.join(currentPath, `kopia_${counter}_${file.name}`);
//                 counter++;
//             }

//             fs.rename(file.path, newPath, (err) => {
//                 if (err) throw err;
//                 console.log("Plik zapisany: ", file.name);
//             });
//         })

//         res.redirect(`/filemanager3/${relativePath}`);
//     });
// });


// app.get('/delete-folder/*', (req, res) => {
//     let folderPath = req.params[0];
//     let fullPath = path.join(__dirname, 'files', folderPath);

//     fs.rm(fullPath, { recursive: true, force: true }, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager3/${path.dirname(folderPath)}`);
//     });
// });


// app.get('/delete-file/*', (req, res) => {
//     let filePath = req.params[0];
//     let fullPath = path.join(__dirname, 'files', filePath);

//     fs.unlink(fullPath, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager3/${path.dirname(filePath)}`);
//     });
// });


// app.post('/rename-folder/*', (req, res) => {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);
//     let { oldName, newName } = req.body;

//     let oldFolderPath = currentPath;
//     let newFolderPath = path.join(path.dirname(currentPath), newName);

//     fs.rename(oldFolderPath, newFolderPath, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager3/${path.dirname(relativePath)}`);
//     });
// });




// // - - - - - - - - - - - - - - -  czesc 4


// app.get('/filemanager4', function (req, res) {
//     let currentPath = path.join(__dirname, "files");
//     let relativePath = "";

//     let trail = [{ name: "files", path: "" }];

//     fs.readdir(currentPath, (err, files) => {
//         if (err) throw err;

//         let uploadedFolders = [];
//         let uploadedFiles = [];
//         let processed = 0;

//         if (files.length === 0) {
//             return res.render('filemanager4', {
//                 uploadedFolders,
//                 uploadedFiles,
//                 currentPath: relativePath,
//                 trail,
//                 currentFolderName: path.basename(relativePath)
//             });
//         }

//         files.forEach((file) => {
//             const filePath = path.join(currentPath, file);

//             fs.lstat(filePath, (err, stats) => {
//                 if (err) throw err;

//                 if (stats.isDirectory()) {
//                     uploadedFolders.push({
//                         name: file,
//                         icon: "DIR",
//                         path: file,
//                     });
//                 } else {
//                     let extension = path.extname(file);
//                     let icon;
//                     if (extension == ".txt") icon = "TXT"
//                     else if (extension == ".jpg") icon = "JPG"
//                     else if (extension == ".jpeg") icon = "JPEG"
//                     else if (extension == ".gif") icon = "GIF"
//                     else if (extension == ".png") icon = "PNG"
//                     else if (extension == ".ico") icon = "ICO"
//                     else if (extension == ".html") icon = "HTML"
//                     else if (extension == ".css") icon = "CSS"
//                     else if (extension == ".js") icon = "JS"
//                     else if (extension == ".json") icon = "JSON"
//                     else { icon = "---" }

//                     let fileRelativePath = path.join(relativePath, file);

//                     uploadedFiles.push({
//                         name: file,
//                         icon: icon,
//                         path: fileRelativePath,
//                     });
//                 }

//                 processed++;
//                 if (processed === files.length) {
//                     res.render("filemanager4.hbs", {
//                         uploadedFolders,
//                         uploadedFiles,
//                         currentPath: relativePath,
//                         trail,
//                         currentFolderName: path.basename(relativePath)
//                     });
//                 };
//             });
//         });
//     });
// });


// app.get("/filemanager4/*", function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, "files", relativePath);

//     let fileName = path.basename(currentPath);

//     let currentExtension = path.extname(fileName);
//     let currentFileNameWithoutExtension = path.basename(fileName, currentExtension);

//     if (!fs.existsSync(currentPath)) {
//         return res.status(404).send('path nie istnieje');
//     }

//     let pathParts = relativePath.split('/').filter(part => part);
//     let trail = [{ name: "files", path: "" }];

//     for (let i = 0; i < pathParts.length; i++) {
//         let part = pathParts[i];
//         let currentPath = "";

//         for (let j = 0; j <= i; j++) {
//             currentPath += (j > 0 ? "/" : "") + pathParts[j];
//         }

//         trail.push({
//             name: part,
//             path: currentPath
//         });
//     }

//     fs.readdir(currentPath, (err, files) => {
//         if (err) throw err;

//         let uploadedFolders = [];
//         let uploadedFiles = [];
//         let processed = 0;

//         if (files.length === 0) {
//             return res.render('filemanager4', {
//                 uploadedFolders,
//                 uploadedFiles,
//                 currentPath: relativePath,
//                 trail,
//                 currentFolderName: path.basename(relativePath),
//                 currentFileName: fileName,
//                 currentExtension,
//                 currentFileNameWithoutExtension,
//                 currentDirectoryPath: relativePath
//             });
//         };

//         files.forEach((file) => {
//             let filePath = path.join(currentPath, file);

//             fs.lstat(filePath, (err, stats) => {
//                 if (err) throw err;

//                 if (stats.isDirectory()) {
//                     uploadedFolders.push({
//                         name: file,
//                         icon: "DIR",
//                         path: path.join(relativePath, file),
//                     });
//                 } else {
//                     let extension = path.extname(file);
//                     let icon;
//                     if (extension == ".txt") icon = "TXT"
//                     else if (extension == ".jpg") icon = "JPG"
//                     else if (extension == ".jpeg") icon = "JPEG"
//                     else if (extension == ".gif") icon = "GIF"
//                     else if (extension == ".png") icon = "PNG"
//                     else if (extension == ".ico") icon = "ICO"
//                     else if (extension == ".html") icon = "HTML"
//                     else if (extension == ".css") icon = "CSS"
//                     else if (extension == ".js") icon = "JS"
//                     else if (extension == ".json") icon = "JSON"
//                     else { icon = "---" }

//                     let fileRelativePath = path.join(relativePath, file);

//                     uploadedFiles.push({
//                         name: file,
//                         icon: icon,
//                         path: fileRelativePath,
//                     });
//                 }

//                 processed++;
//                 if (processed === files.length) {
//                     res.render("filemanager4.hbs", {
//                         uploadedFolders,
//                         uploadedFiles,
//                         currentPath: relativePath,
//                         trail,
//                         currentFolderName: path.basename(relativePath),
//                         currentFileName: fileName,
//                         currentExtension,
//                         currentFileNameWithoutExtension,
//                         currentDirectoryPath: relativePath
//                     });
//                 };
//             });
//         });
//     });
// });


// app.post('/filemanager4/*', function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);
//     let { fileName, folderName } = req.body;

//     if (fileName) {
//         let newFileName = path.basename(fileName);
//         let filePath = path.join(currentPath, newFileName);
//         let counter = 1;

//         while (fs.existsSync(filePath)) {
//             filePath = path.join(currentPath, `kopia_${counter}_${newFileName}`);
//             counter++;
//         }

//         let extension = path.extname(fileName);
//         let content = '';

//         if (extension == ".txt") icon = "TXT"
//         else if (extension == ".jpg") icon = "JPG"
//         else if (extension == ".jpeg") icon = "JPEG"
//         else if (extension == ".gif") icon = "GIF"
//         else if (extension == ".png") icon = "PNG"
//         else if (extension == ".ico") icon = "ICO"
//         else if (extension == ".html") {
//             icon = "HTML";
//             content = "<h1>hello world</h1>";
//         }
//         else if (extension == ".css") {
//             icon = "CSS";
//             content = "body { background: blue; }";
//         }
//         else if (extension == ".js") {
//             icon = "JS";
//             content = "console.log('js');";
//         }
//         else if (extension == ".json") {
//             icon = "JSON";
//             content = JSON.stringify({ a: 1, b: 2, c: 3 });
//         }
//         else { icon = "---"; content = ''; }

//         fs.writeFile(filePath, content, (err) => {
//             if (err) {
//                 console.error('Błąd przy zapisywaniu pliku:', err);
//                 return res.status(500).send('Błąd serwera');
//             }
//             console.log('Plik utworzony:', newFileName);
//             res.redirect(`/filemanager4/${relativePath}`);
//         });

//     } else if (folderName) {
//         let newFolderName = path.basename(folderName);
//         let folderPath = path.join(currentPath, newFolderName);
//         let counter2 = 1;

//         while (fs.existsSync(folderPath)) {
//             folderPath = path.join(currentPath, `kopia_${counter2}_${newFolderName}`);
//             counter2++;
//         }
//         fs.mkdir(folderPath, (err) => {
//             if (err) throw err;
//             console.log("folder dodany:", folderName);
//             res.redirect(`/filemanager4/${relativePath}`);
//         });
//     } else {
//         console.log("Nie podano żadnej nazwy");
//         res.redirect(`/filemanager4/${relativePath}`);
//     }
// });


// app.post('/upload4/*', function (req, res) {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);

//     let form = formidable({});

//     form.keepExtensions = true; // zapis z rozszerzeniem pliku
//     form.multiples = true;
//     form.uploadDir = currentPath; // folder do zapisu plików

//     form.parse(req, function (err, fields, files) {
//         if (err) throw err;

//         let fileArray;
//         if (Array.isArray(files.imagetoupload)) {
//             fileArray = files.imagetoupload;
//         }
//         else {
//             fileArray = [files.imagetoupload];
//         }

//         fileArray.forEach((file) => {
//             let newPath = path.join(currentPath, file.name);
//             let counter = 1;

//             while (fs.existsSync(newPath)) {
//                 newPath = path.join(currentPath, `kopia_${counter}_${file.name}`);
//                 counter++;
//             }

//             fs.rename(file.path, newPath, (err) => {
//                 if (err) throw err;
//                 console.log("Plik zapisany: ", file.name);
//             });
//         })

//         res.redirect(`/filemanager4/${relativePath}`);
//     });
// });


// app.get('/delete-folder/*', (req, res) => {
//     let folderPath = req.params[0];
//     let fullPath = path.join(__dirname, 'files', folderPath);

//     fs.rm(fullPath, { recursive: true, force: true }, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager4/${path.dirname(folderPath)}`);
//     });
// });


// app.get('/delete-file/*', (req, res) => {
//     let filePath = req.params[0];
//     let fullPath = path.join(__dirname, 'files', filePath);

//     fs.unlink(fullPath, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager4/${path.dirname(filePath)}`);
//     });
// });


// app.post('/rename-folder/*', (req, res) => {
//     let relativePath = req.params[0];
//     let currentPath = path.join(__dirname, 'files', relativePath);
//     let { oldName, newName } = req.body;

//     let oldFolderPath = currentPath;
//     let newFolderPath = path.join(path.dirname(currentPath), newName);

//     fs.rename(oldFolderPath, newFolderPath, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager4/${path.dirname(relativePath)}`);
//     });
// });


// app.get('/edytor/*', function (req, res) {
//     let fileName = req.params[0];
//     let filePath = path.join(__dirname, "files", fileName);

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) throw err;

//         if (data.trim() === "") {
//             fs.writeFile(filePath, content, (err) => {
//                 if (err) throw err;
//                 res.render("edytor.hbs", {
//                     fileName,
//                     content,
//                     trail: [{ name: "files", path: "" }],
//                     currentFileName: path.basename(fileName)
//                 });
//             });
//         } else {
//             res.render("edytor.hbs", {
//                 fileName,
//                 content: data,
//                 trail: [{ name: "files", path: "" }],
//                 currentFileName: path.basename(fileName)
//             });
//         }
//     });
// });


// app.post('/rename-file/*', (req, res) => {
//     let relativePath = req.params[0];
//     let currentDir = path.join(__dirname, 'files', relativePath);
//     let { oldName, newName, select } = req.body;

//     let oldFilePath = path.join(currentDir, oldName);
//     let newFilePath = path.join(currentDir, `${newName}${select}`);

//     fs.rename(oldFilePath, newFilePath, (err) => {
//         if (err) throw err;
//         res.redirect(`/filemanager4/${relativePath}`);
//     });
// });


// app.post('/save-file/:fileName', (req, res) => {
//     let fileName = req.params.fileName;
//     let content = req.body.content;

//     let filePath = path.join(__dirname, 'files', fileName);

//     fs.writeFile(filePath, content, 'utf8', (err) => {
//         if (err) throw err;
//         res.json({ success: true });
//     });
// });


// app.get('/preview', (req, res) => {
//     let relativePath = req.query.name;
//     let fullPath = path.join(__dirname, 'files', relativePath);

//     fs.readFile(fullPath, 'utf8', (err, data) => {
//         res.send(data);
//     });
// });


// app.post('/save-editor-config', (req, res) => {
//     let { backgroundColor, fontSize } = req.body;
//     let config = { backgroundColor, fontSize };

//     let filePath = path.join(__dirname, 'editor-config.json');

//     fs.writeFile(filePath, JSON.stringify(config, null, 2), (err) => {
//         if (err) {
//             console.error(err);
//             return res.json({ success: false, message: 'bład zapisu pliku' });
//         }
//         console.log('konf zapisana:', config);
//         res.json({ success: true });
//     });
// });


// app.get('/get-editor-config', (req, res) => {
//     const filePath = path.join(__dirname, 'editor-config.json');

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Błąd odczytu pliku:', err);
//             return res.json({ success: false, message: 'bład odczytu konfiguracji' });
//         }
//         res.json(JSON.parse(data));
//     });
// });






// - - - - - - - - - - - - - - -  czesc 5


app.get('/filemanager5', function (req, res) {
    let currentPath = path.join(__dirname, "files");
    let relativePath = "";

    let trail = [{ name: "files", path: "" }];

    fs.readdir(currentPath, (err, files) => {
        if (err) throw err;

        let uploadedFolders = [];
        let uploadedFiles = [];
        let processed = 0;

        if (files.length === 0) {
            return res.render('filemanager5', {
                uploadedFolders,
                uploadedFiles,
                currentPath: relativePath,
                trail,
                currentFolderName: path.basename(relativePath)
            });
        }

        files.forEach((file) => {
            const filePath = path.join(currentPath, file);

            fs.lstat(filePath, (err, stats) => {
                if (err) throw err;

                if (stats.isDirectory()) {
                    uploadedFolders.push({
                        name: file,
                        icon: "DIR",
                        path: file,
                    });
                } else {
                    let extension = path.extname(file);
                    let icon;
                    if (extension == ".txt") icon = "TXT"
                    else if (extension == ".jpg") icon = "JPG"
                    else if (extension == ".jpeg") icon = "JPEG"
                    else if (extension == ".gif") icon = "GIF"
                    else if (extension == ".png") icon = "PNG"
                    else if (extension == ".ico") icon = "ICO"
                    else if (extension == ".html") icon = "HTML"
                    else if (extension == ".css") icon = "CSS"
                    else if (extension == ".js") icon = "JS"
                    else if (extension == ".json") icon = "JSON"
                    else { icon = "---" }

                    let fileRelativePath = path.join(relativePath, file);

                    uploadedFiles.push({
                        name: file,
                        icon: icon,
                        path: fileRelativePath,
                    });
                }

                processed++;
                if (processed === files.length) {
                    res.render("filemanager5.hbs", {
                        uploadedFolders,
                        uploadedFiles,
                        currentPath: relativePath,
                        trail,
                        currentFolderName: path.basename(relativePath)
                    });
                };
            });
        });
    });
});


app.get("/filemanager5/*", function (req, res) {
    let relativePath = req.params[0];
    let currentPath = path.join(__dirname, "files", relativePath);

    let fileName = path.basename(currentPath);

    let currentExtension = path.extname(fileName);
    let currentFileNameWithoutExtension = path.basename(fileName, currentExtension);

    if (!fs.existsSync(currentPath)) {
        return res.status(404).send('path nie istnieje');
    }

    let pathParts = relativePath.split('/').filter(part => part);
    let trail = [{ name: "files", path: "" }];

    for (let i = 0; i < pathParts.length; i++) {
        let part = pathParts[i];
        let currentPath = "";

        for (let j = 0; j <= i; j++) {
            currentPath += (j > 0 ? "/" : "") + pathParts[j];
        }

        trail.push({
            name: part,
            path: currentPath
        });
    }

    fs.readdir(currentPath, (err, files) => {
        if (err) throw err;

        let uploadedFolders = [];
        let uploadedFiles = [];
        let processed = 0;

        if (files.length === 0) {
            return res.render('filemanager5', {
                uploadedFolders,
                uploadedFiles,
                currentPath: relativePath,
                trail,
                currentFolderName: path.basename(relativePath),
                currentFileName: fileName,
                currentExtension,
                currentFileNameWithoutExtension,
                currentDirectoryPath: relativePath
            });
        };

        files.forEach((file) => {
            let filePath = path.join(currentPath, file);

            fs.lstat(filePath, (err, stats) => {
                if (err) throw err;

                if (stats.isDirectory()) {
                    uploadedFolders.push({
                        name: file,
                        icon: "DIR",
                        path: path.join(relativePath, file),
                    });
                } else {
                    let extension = path.extname(file);
                    let icon;
                    if (extension == ".txt") icon = "TXT"
                    else if (extension == ".jpg") icon = "JPG"
                    else if (extension == ".jpeg") icon = "JPEG"
                    else if (extension == ".gif") icon = "GIF"
                    else if (extension == ".png") icon = "PNG"
                    else if (extension == ".ico") icon = "ICO"
                    else if (extension == ".html") icon = "HTML"
                    else if (extension == ".css") icon = "CSS"
                    else if (extension == ".js") icon = "JS"
                    else if (extension == ".json") icon = "JSON"
                    else { icon = "---" }

                    let fileRelativePath = path.join(relativePath, file);

                    uploadedFiles.push({
                        name: file,
                        icon: icon,
                        path: fileRelativePath,
                    });
                }

                processed++;
                if (processed === files.length) {
                    res.render("filemanager5.hbs", {
                        uploadedFolders,
                        uploadedFiles,
                        currentPath: relativePath,
                        trail,
                        currentFolderName: path.basename(relativePath),
                        currentFileName: fileName,
                        currentExtension,
                        currentFileNameWithoutExtension,
                        currentDirectoryPath: relativePath
                    });
                };
            });
        });
    });
});


app.post('/filemanager5/*', function (req, res) {
    let relativePath = req.params[0];
    let currentPath = path.join(__dirname, 'files', relativePath);
    let { fileName, folderName } = req.body;

    if (fileName) {
        let newFileName = path.basename(fileName);
        let filePath = path.join(currentPath, newFileName);
        let counter = 1;

        while (fs.existsSync(filePath)) {
            filePath = path.join(currentPath, `kopia_${counter}_${newFileName}`);
            counter++;
        }

        let extension = path.extname(fileName);
        let content = '';

        if (extension == ".txt") icon = "TXT"
        else if (extension == ".jpg") icon = "JPG"
        else if (extension == ".jpeg") icon = "JPEG"
        else if (extension == ".gif") icon = "GIF"
        else if (extension == ".png") icon = "PNG"
        else if (extension == ".ico") icon = "ICO"
        else if (extension == ".html") {
            icon = "HTML";
            content = "<h1>hello world</h1>";
        }
        else if (extension == ".css") {
            icon = "CSS";
            content = "body { background: blue; }";
        }
        else if (extension == ".js") {
            icon = "JS";
            content = "console.log('js');";
        }
        else if (extension == ".json") {
            icon = "JSON";
            content = JSON.stringify({ a: 1, b: 2, c: 3 });
        }
        else { icon = "---"; content = ''; }

        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error('Błąd przy zapisywaniu pliku:', err);
                return res.status(500).send('Błąd serwera');
            }
            console.log('Plik utworzony:', newFileName);
            res.redirect(`/filemanager5/${relativePath}`);
        });

    } else if (folderName) {
        let newFolderName = path.basename(folderName);
        let folderPath = path.join(currentPath, newFolderName);
        let counter2 = 1;

        while (fs.existsSync(folderPath)) {
            folderPath = path.join(currentPath, `kopia_${counter2}_${newFolderName}`);
            counter2++;
        }
        fs.mkdir(folderPath, (err) => {
            if (err) throw err;
            console.log("folder dodany:", folderName);
            res.redirect(`/filemanager5/${relativePath}`);
        });
    } else {
        console.log("Nie podano żadnej nazwy");
        res.redirect(`/filemanager5/${relativePath}`);
    }
});


app.post('/upload5/*', function (req, res) {
    let relativePath = req.params[0];
    let currentPath = path.join(__dirname, 'files', relativePath);

    let form = formidable({});

    form.keepExtensions = true; // zapis z rozszerzeniem pliku
    form.multiples = true;
    form.uploadDir = currentPath; // folder do zapisu plików

    form.parse(req, function (err, fields, files) {
        if (err) throw err;

        let fileArray;
        if (Array.isArray(files.imagetoupload)) {
            fileArray = files.imagetoupload;
        }
        else {
            fileArray = [files.imagetoupload];
        }

        fileArray.forEach((file) => {
            let newPath = path.join(currentPath, file.name);
            let counter = 1;

            while (fs.existsSync(newPath)) {
                newPath = path.join(currentPath, `kopia_${counter}_${file.name}`);
                counter++;
            }

            fs.rename(file.path, newPath, (err) => {
                if (err) throw err;
                console.log("Plik zapisany: ", file.name);
            });
        })

        res.redirect(`/filemanager5/${relativePath}`);
    });
});


app.get('/delete-folder/*', (req, res) => {
    let folderPath = req.params[0];
    let fullPath = path.join(__dirname, 'files', folderPath);

    fs.rm(fullPath, { recursive: true, force: true }, (err) => {
        if (err) throw err;
        res.redirect(`/filemanager5/${path.dirname(folderPath)}`);
    });
});


app.get('/delete-file/*', (req, res) => {
    let filePath = req.params[0];
    let fullPath = path.join(__dirname, 'files', filePath);

    fs.unlink(fullPath, (err) => {
        if (err) throw err;
        res.redirect(`/filemanager5/${path.dirname(filePath)}`);
    });
});


app.get('/image/*', function (req, res) {
    const fileName = req.params[0];
    const filePath = path.join(__dirname, "files", fileName);

    res.sendFile(filePath);
});


app.get('/image-view/*', function (req, res) {
    let fileName = req.params[0];
    let filePath = path.join("files", fileName);

    const effects = [
        { name: "grayscale", image_path: `/image/${fileName}`, },
        { name: "contrast", image_path: `/image/${fileName}`, },
        { name: "invert", image_path: `/image/${fileName}`, },
        { name: "sepia", image_path: `/image/${fileName}`, },
        { name: "original", image_path: `/image/${fileName}`, }
    ];

    // console.log(fileName);

    res.render("image.hbs", {
        imageUrl: `/image/${fileName}`,
        fileName,
        currentFileName: path.basename(filePath),
        effects
    });

});

app.post("/save-image", function (req, res) {
    const relativePath = decodeURIComponent(req.query.name);
    const absolutePath = path.join(__dirname, 'files', relativePath);
    const uploadDir = path.dirname(absolutePath);

    // console.log("File save details:", { relativePath, absolutePath, uploadDir });

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        filename: () => path.basename(absolutePath)
    });

    form.parse(req, (err, fields, files) => {
        if (err) throw err;

        const oldPath = files.image.path;

        fs.rename(oldPath, absolutePath, (err) => {
            if (err) throw err;

            res.json({ success: true, path: relativePath, message: "file saved" });
        });
    });
});


app.get('/image-preview/*', (req, res) => {
    let filePath = path.join(__dirname, "files", req.query.path.slice(6));

    // console.log(req.query.path.slice(6));

    // console.log({
    //     fileName,
    //     filePath,
    //     params: req.params,
    //     query: req.query
    // });

    // console.log("Podgląd obrazka212:", req.params);
    // console.log("Podgląd obrazka:", fileName);

    res.sendFile(filePath);
});


app.post('/rename-file/*', (req, res) => {
    let relativePath = req.params[0];
    let currentDir = path.join(__dirname, 'files', relativePath);
    let { oldName, newName, select } = req.body;

    let oldFilePath = path.join(currentDir, oldName);
    let newFilePath = path.join(currentDir, `${newName}${select}`);

    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) throw err;
        res.redirect(`/filemanager5/${relativePath}`);
    });
});


app.get('/preview', (req, res) => {
    let relativePath = req.query.name;
    let fullPath = path.join(__dirname, 'files', relativePath);

    fs.readFile(fullPath, 'utf8', (err, data) => {
        res.send(data);
    });
});


app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

