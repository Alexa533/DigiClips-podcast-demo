// script.ts
const calculateTotal = (price: number, tax: number): number => {
    return price + (price * tax);
};

console.log("Calculated Total: $" + calculateTotal(100, 0.15));


// HTML
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>Official TS Standalone Fetcher</title>

//     <!-- Load official browser-ready TypeScript engine -->
//     <script src="https://unpkg.com"></script>
// </head>
// <body>

//     <h1>Official Engine External Fetch</h1>

//     <script>
//         async function loadExternalTS(filePath) {
//             try {
//                 // 1. Fetch the raw TS text from your server
//                 const response = await fetch(filePath);
//                 const tsCode = await response.text();

//                 // 2. Transpile the TS code into plain vanilla JavaScript
//                 const jsCode = window.ts.transpile(tsCode);

//                 // 3. Inject and run it as an active script module
//                 const scriptElement = document.createElement('script');
//                 scriptElement.textContent = jsCode;
//                 document.body.appendChild(scriptElement);
//             } catch (error) {
//                 console.error("Error loading or compiling the TS file:", error);
//             }
//         }

//         // Call the loader with your external file path
//         loadExternalTS('./script.ts');
//     </script>

// </body>
// </html>
