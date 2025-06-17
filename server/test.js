// const xlsx = require('xlsx');
// const path = require('path');
// const fs = require('fs');

// // Load workbook
// const workbook = xlsx.readFile(path.join(__dirname, 'all companies.xlsx'));

// // Get first sheet name
// const sheetName = workbook.SheetNames[0];

// // Get sheet content
// const worksheet = workbook.Sheets[sheetName];

// // Convert to JSON
// const jsonData = xlsx.utils.sheet_to_json(worksheet);

// // Print or save the JSON
// console.log(jsonData);

// // Optionally write to a file
// fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));


const axios = require('axios');
const fs = require('fs');

async function downloadBinary(url, outputPath) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

console.log(response.data)
  // console.log('Binary file saved at', outputPath);
}

downloadBinary('https://verizonconnect.gainsightcloud.com/v1/ant/storage/a87ad17f-caf8-4001-8ef9-342cb02d7d75/ecec8869-9974-49c8-955c-85104d61a1d6/file?response-content-disposition=attachment%3B%20fileName%3D%22viaturas.xlsx%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250617T153229Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIA5AZBYC7EI6W37VNP%2F20250617%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5745277f8971ad06761338f7bb30025de21ea24dfcc7a3b19b9b7d750cf32910', 'viaturas.xlsx');
