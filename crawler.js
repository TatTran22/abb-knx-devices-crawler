const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
const URL = require('url-parse');
const fs = require('fs');
const xlsxFile = require('read-excel-file/node');

let orderCode = [];
let products = [];

xlsxFile('./Solution Center 12.04.2019.xlsx').then((rows) => {
  rows.map((col) => {
    if (!/\s/.test(col[0]) && (col[0] || col[3])) {
      let product = {
        id: col[3],
        vnDescription: col[4],
      };

      orderCode.push(product);
    }
  });

  // let data = JSON.stringify(orderCode, null, 2);
  // let productsFileName = `ABB-KNX-Products_VN.json`;

  // console.log(productsFileName);

  // fs.writeFile(`./data/${productsFileName}`, data, (err) => {
  //   if (err) throw err;
  //   console.log('Data written to file');
  // });
});

console.log(`Number of order code: ${orderCode.length}`);

const crawlData = async (id, index) => {
  let options = {
    uri: `https://new.abb.com/products/${id}/`,
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  rp(options)
    .then(function ($) {
      productInformation = {
        key: index,
        id: id,
        title: $('title').text(),
        generalInformation: {
          extendedProductType: $("dd[data-code='ExtendedProductType']").text(),
          productId: $("dd[data-code='ProductId']").text(),
          ean: $("dd[data-code='Ean']").first().text(),
          catalogDescription: $("dd[data-code='CatalogDescription']").text(),
          longDescription: $("dd[data-code='LongDescription']").text(),
          imageUrl: $("meta[itemprop='image']").first().attr('content'),
        },
        categories: $('.categories-section-wrapper li').text(),
      };

      products.push(productInformation);
      // return products;
      console.log(`Current index: ${index}`);

      // console.log(products);
      let data = JSON.stringify(products, null, 2);
      let productsFileName = `ABB-KNX-Products.json`;

      console.log(productsFileName);

      fs.writeFile(`./data/${productsFileName}`, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
      });
    })
    .catch(function (err) {
      // console.log(err);
    });
};

const getData = async () => {
  return Promise.all(orderCode.map((item, i) => crawlData(item.id, i)));
};

getData().then((data) => {
  console.log(data);
});

function addZero(x, n) {
  while (x.toString().length < n) {
    x = '0' + x;
  }
  return x;
}

function getDateTime() {
  let d = new Date();
  let h = addZero(d.getHours(), 2);
  let m = addZero(d.getMinutes(), 2);
  let s = addZero(d.getSeconds(), 2);
  let ms = addZero(d.getMilliseconds(), 3);
  let x = h + ':' + m + ':' + s + ':' + ms;
  let z = '__' + h + '-' + m + '-' + s + '-' + ms;
  console.log(x);
  return z;
}
