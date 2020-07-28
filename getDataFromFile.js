const xlsxFile = require('read-excel-file/node');
const fs = require('fs');

let orderCode = [];

xlsxFile('./excel_data/Solution Center 12.04.2019.xlsx').then((rows) => {
  rows.map((col) => {
    if (!/\s/.test(col[0]) && (col[0] || col[3])) {
      let product = {
        id: col[3],
        vnDescription: col[4],
      };
      orderCode.push(product);
    }
  });

  let data = JSON.stringify(orderCode, null, 2);
  let productsFileName = `ABB-KNX-Products_VN.json`;

  console.log(productsFileName);

  fs.writeFile(`./crawled_data/${productsFileName}`, data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
});
