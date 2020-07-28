const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
const URL = require('url-parse');
const fs = require('fs');
const excel = require('exceljs');
let products_init = [];

const workbook = new excel.Workbook();
let products = [];
const path = './excel_data/Solution Center 12.04.2019.xlsx';

const getData = function () {
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
          products_init.push(product);
        }
      });
    })
    .then(() => {
      products_init.forEach((el, idx) => {
        crawlData(el.orderCode, idx);
      });
    })

    .catch((err) => {
      console.log(err);
    });
};

const crawlData = (id, index) => {
  let options = {
    uri: `https://new.abb.com/products/${id}/`,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  rp(options)
    .then(function ($) {
      productInformation = {
        id: id,
        title: $('title').text(),
        extendedProductType: $("dd[data-code='ExtendedProductType']").text(),
        orderCode: $("dd[data-code='ProductId']").text(),
        ean: $("dd[data-code='Ean']").first().text(),
        catalogDescription: $("dd[data-code='CatalogDescription']").text(),
        longDescription: $("dd[data-code='LongDescription']").text(),
        imageUrl: $("meta[itemprop='image']").first().attr('content'),
        netLength: $("dd[data-code='ProductNetDepth'] span").text(),
        netHeight: $("dd[data-code='ProductNetHeight'] span").text(),
        netWidth: $("dd[data-code='ProductNetWidth'] span").text(),
        netWeight: $("dd[data-code='ProductNetWeight'] span").text(),
        netLengthUnit: $("dd[data-code='ProductNetDepth']").text(),
        netWeightUnit: $("dd[data-code='ProductNetWeight']").text(),
        minimumOrderQuantity: $("dd[data-code='MinimumOrderQuantity']").text(),

        categories: $('.categories-section-wrapper li').text(),
      };

      products.push(productInformation);
      console.log(`Current index: ${index}`);
    })
    .then(() => {
      // console.log(products);
      let data = JSON.stringify(products, null, 2);
      let productsFileName = `ABB-KNX-Products.json`;

      console.log(productsFileName);

      fs.writeFile(`./crawled_data/${productsFileName}`, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
      });
    })

    .catch(function (err) {
      // console.log(err);
    });
};

getData();

// function addZero(x, n) {
//   while (x.toString().length < n) {
//     x = '0' + x;
//   }
//   return x;
// }

// function getDateTime() {
//   let d = new Date();
//   let h = addZero(d.getHours(), 2);
//   let m = addZero(d.getMinutes(), 2);
//   let s = addZero(d.getSeconds(), 2);
//   let ms = addZero(d.getMilliseconds(), 3);
//   let x = h + ':' + m + ':' + s + ':' + ms;
//   let z = '__' + h + '-' + m + '-' + s + '-' + ms;
//   console.log(x);
//   return z;
// }
