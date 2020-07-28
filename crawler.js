const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
const URL = require('url-parse');
const fs = require('fs');
const excel = require('exceljs');

const workbook = new excel.Workbook();
const path = './excel_data/SmarthomeDevices.xlsx';

const delayWriteFile = 30000; //30 second
const delayLoad = 7000;
let products_init = [];
let products = [];

const getData = function () {
  //get order code and some information from price list (excel)
  workbook.xlsx
    .readFile(path)
    .then((result) => {
      const worksheet = result.worksheets[0];

      worksheet.eachRow(function (row, rowNumber) {
        if ((row.getCell(1) && !/\s/.test(row.getCell(1))) || (row.getCell(4) && !/\s/.test(row.getCell(4)))) {
          console.log(rowNumber);
          let pr;

          if (row.getCell(6).value != 0) {
            pr = row.getCell(6).value; //price list 2019
          } else if (row.getCell(8).value != 0) {
            pr = row.getCell(8).value; //price list 2018
          } else if (row.getCell(10).value != 0) {
            pr = row.getCell(10).value; //price list 2017
          }

          let product = {
            orderCode: row.getCell(1).value ? row.getCell(1).value : row.getCell(4).value,
            description_vn: row.getCell(5).value, //vietnamese description
            price_vn: pr, //VNĐ
            co: row.getCell(11).value, // certificate of quality and quantity, confirmation of origin,  certificate of warranty
            origin: row.getCell(12).value,
            // minimumOrder: row.getCell(13).value,
            unit_vn: row.getCell(14).value, //vietnamese unit
          };
          products_init.push(product);
        }
      });
    })
    .then(() => {
      // write to file vn
      let data = JSON.stringify(products_init, null, 2);
      let productsFileName = `ABB-KNX-Products_VN.json`;

      console.log(productsFileName);

      fs.writeFile(`./crawled_data/${productsFileName}`, data, (err) => {
        if (err) throw err;
        console.log('Data written to file VN');
      });
    })
    .then(() => {
      //craw data form ABB website each 7s
      let i = 0;
      craw(i);
      console.log(products_init.length);
      // products_init.forEach((el, idx) => {
      //   crawlData(el.orderCode, idx);
      // });
    })
    .catch((err) => {
      console.log(err);
    });
};

function craw(idx) {
  setTimeout(function () {
    console.log(idx);
    crawlData(products_init[idx].orderCode, idx);
    idx++;
    if (idx < products_init.length) craw(idx);
  }, delayLoad);
}

const crawlData = (id, index) => {
  let options = {
    uri: `https://new.abb.com/products/${id}/`,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  rp(options)
    .then(function ($) {
      const NLU = $("dd[data-code='ProductNetDepth']").text().split(' ');
      const NLH = $("dd[data-code='ProductNetHeight']").text().split(' ');
      const NLW = $("dd[data-code='ProductNetWeight']").text().split(' ');
      const MOQ = $("dd[data-code='MinimumOrderQuantity']").text().split(' ');

      productInformation = {
        id: id,
        title: $('title').text().trim(),
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
        netLengthUnit: NLU[NLU.length - 1] ? NLU[NLU.length - 1] : NLH[NLH.length - 1],
        netWeightUnit: NLW[NLW.length - 1],
        minimumOrderQuantity: MOQ[0],
        unit: MOQ[MOQ.length - 1],
        originalLink: `https://new.abb.com/products/${id}/`,
        categories: $('.categories-section-wrapper li').text(),
      };

      products.push(productInformation);
      console.log(`Current index: ${index}`);
      console.log(products);
    })

    .catch(function (err) {
      console.log(err);
    });
};

setTimeout(function () {
  // console.log(products);
  let data = JSON.stringify(products, null, 2);
  let productsFileName = `ABB-KNX-Products.json`;

  console.log(productsFileName);

  fs.writeFile(`./crawled_data/${productsFileName}`, data, (err) => {
    if (err) throw err;
    console.log(`Numer of products: ${products.length}`);
    console.log('Data written to file');
  });
}, delayWriteFile);

// RUN
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
