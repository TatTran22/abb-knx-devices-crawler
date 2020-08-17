const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
// const URL = require('url-parse');
// const fs = require('fs');
// const excel = require('exceljs');
// a = () => {
//   for (let i = 0; i < 100; i++) {
//     let el = document.querySelector(`#productBrowserAdditionalInfo${i}`);
//     let ela = document.querySelectorAll('td.pb_IdColumn a')[i];
//     if (el) {
//       products.push(el.textContent);
//     } else {
//       products.push(ela.textContent);
//     }
//   }
// };
let knx = require('./ABB-KNX-Products-ID.json');

const delayWriteFile = 60000; //60 second
const delayLoad = 10000;
let products_init = [];
let products = [];
// fs.readFile('./ABB-KNX-Products-ID.json', (err, data) => {
//   if (err) throw err;
//   knx = JSON.parse(data);
// }).then(() => {
// console.log(knx);
// });

// console.log('This is after the read call');
let init = 500;
let t0 = process.hrtime();
craw(init);

function craw(idx) {
  setTimeout(
    function () {
      console.log(idx);
      crawlData(knx[idx], idx);
      idx++;
      let productsFileName = `./crawled_data/ABB-KNX-Products_${idx - 100}-${idx}.json`;
      if (idx < knx.length) {
        if (idx % 100 == 0 || idx == knx.length) {
          // console.log(products);

          let data = JSON.stringify(products, null, 2);

          setTimeout(
            () => {
              fs.writeFile(productsFileName, data, (err) => {
                if (err) throw err;
                // console.log(`Numer of products: ${products.length}`);
                console.log(`Data written to file: ${productsFileName}`);
              });
              let t1 = process.hrtime(t0);
              console.log(`Crawled ${products.length} products in ${t1[1] / 1000000} milliseconds.`);
              products = [];
            },
            delayWriteFile ? delayWriteFile : 30000
          );
        } else craw(idx);
      } else {
        // let data = JSON.stringify(products, null, 2);
        // setTimeout(
        //   () => {
        //     fs.writeFile(productsFileName, data, (err) => {
        //       if (err) throw err;
        //       console.log(`Numer of products: ${products.length}`);
        //       console.log(`Data written to file: ${productsFileName}`);
        //     });
        //   },
        //   delayWriteFile ? delayWriteFile : 30000
        // );
      }
    },
    idx % 100 == 0 ? 0 : delayLoad
  );
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
      let image = [];
      let documentLink = [];
      for (let i = 0; i < $("meta[itemprop='image']").length; i++) {
        image.push($("meta[itemprop='image']")[i].attribs.content);
      }
      // console.log($('.document-link')[0].);
      // for (let i = 0; i < $('.document-link').length; i++) {
      //   console.log($('.document-link')[i].baseURI);
      // }
      productInformation = {
        id: id,
        title: $('title').text().trim(),
        extendedProductType: $("dd[data-code='ExtendedProductType']").text(),
        orderCode: $("dd[data-code='ProductId']").text(),
        ean: $("dd[data-code='Ean']").first().text(),
        catalogDescription: $("dd[data-code='CatalogDescription']").text(),
        longDescription: $("dd[data-code='LongDescription']").text(),
        imageUrl: image,
        netLength: $("dd[data-code='ProductNetDepth'] span").text(),
        netHeight: $("dd[data-code='ProductNetHeight'] span").text(),
        netWidth: $("dd[data-code='ProductNetWidth'] span").text(),
        netWeight: $("dd[data-code='ProductNetWeight'] span").text(),
        netLengthUnit: NLU[NLU.length - 1] ? NLU[NLU.length - 1] : NLH[NLH.length - 1],
        netWeightUnit: NLW[NLW.length - 1],
        minimumOrderQuantity: MOQ[0],
        unit: MOQ[MOQ.length - 1],
        documentLink: documentLink,
        originalLink: `https://new.abb.com/products/${id}/`,
        categories: $('.categories-section-wrapper li').text(),
      };

      products.push(productInformation);
      // return productInformation;
      console.log(`Current products: ${index}: ${productInformation.title}`);
      // console.log(products);
    })

    .catch(function (err) {
      console.log(err);
    });
};

// setTimeout(function () {
//   // console.log(products);
//   let data = JSON.stringify(products, null, 2);
//   let productsFileName = `ABB-KNX-Products.json`;

//   console.log(productsFileName);

//   fs.writeFile(`./crawled_data/${productsFileName}`, data, (err) => {
//     if (err) throw err;
//     console.log(`Numer of products: ${products.length}`);
//     console.log('Data written to file');
//   });
// }, delayWriteFile);

// RUN
