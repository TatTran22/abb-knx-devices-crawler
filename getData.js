const excel = require('exceljs');

const workbook = new excel.Workbook();
let products = [];
workbook.xlsx
  .readFile(path)
  .then((result) => {
    const worksheet = result.worksheets[0];

    worksheet.eachRow(function (row, rowNumber) {
      if (row.getCell(1) && !/\s/.test(row.getCell(1))) {
        let product = {
          id: rowNumber,
          orderCode: row.getCell(1).value,
          description_vn: row.getCell(5).value,
          price_vn_2019: row.getCell(6).value.result,
          co: row.getCell(11).value,
          origin: row.getCell(12).value,
          // minimumOrder: row.getCell(13).value,
          unit_vn: row.getCell(14).value,
        };
        products.push(product);
      }
    });
  })
  .then(() => {
    console.log(products);
  })
  .catch((err) => {
    console.log(err);
  });
