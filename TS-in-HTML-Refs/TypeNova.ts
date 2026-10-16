// app.ts
interface Config {
    siteName: string;
    version: number;
}

const siteInfo: Config = {
    siteName: "My Dynamic Website",
    version: 2026
};

console.log(`Running ${siteInfo.siteName} (v${siteInfo.version}) from an external file!`);
document.body.innerHTML += `<h2>Loaded: ${siteInfo.siteName}</h2>`;



// HTML
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>External TS Example</title>

//     <!-- Load the TypeNova CDN Engine -->
//     <script src="https://cdn.jsdelivr.net/gh/pjdeveloper896/TSNova@latest/dist/ts-runtime.min.js"></script>
// </head>
// <body>

//     <h1>TypeNova External Loader</h1>

//     <!-- Trigger the function to load and execute your remote TS file -->
//     <script>
//         runTSFromURL("./app.ts");
//     </script>

// </body>
// </html>
