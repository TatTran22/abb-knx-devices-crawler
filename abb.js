const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
let productsId = require('./products_id/ABB-KNX-Products-ID.json');

const delayWriteFile = 10000;
const delayLoad = 10000;
let products_init = [];
let products = [];

let init = 0;
let t0 = process.hrtime();
craw(init);

function craw(idx) {
  setTimeout(
    function () {
      console.log(idx);
      crawlData(productsId[idx].trim(), idx);
      idx++;
      let productsFileName = `./crawled_data/KNX/ABB-KNX-Products_${init}-${idx - 1}.json`;
      if (idx <= productsId.length) {
        if (idx === productsId.length || idx === init + 100) {
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
      }
    },
    idx === init ? 0 : delayLoad
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
      // const NLU = $("dd[data-code='ProductNetDepth']").text().split(' ');
      // const NLH = $("dd[data-code='ProductNetHeight']").text().split(' ');
      // const NLW = $("dd[data-code='ProductNetWeight']").text().split(' ');
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
        // id: id,
        title: $('title').text().trim(),
        generalInformation: {
          name: $("dd[data-code='ExtendedProductType']").text().trim(),
          orderCode: $("dd[data-code='ProductId']").text().trim(),
          ean: $("dd[data-code='Ean']").first().text().trim(),
          catalogDescription: $("dd[data-code='CatalogDescription']").text().trim(),
          longDescription: $("dd[data-code='LongDescription']").text().trim(),
          vnDescription: '',
          minimumOrderQuantity: MOQ[0],
          unit: MOQ[MOQ.length - 1],
          unit_vn: '',
          co: '',
          productOrigin: '',
          productBrand: 'ABB',
        },
        imageUrl: image,
        dimensions: {
          netLength: $("dd[data-code='ProductNetDepth']").text().trim(),
          netHeight: $("dd[data-code='ProductNetHeight']").text().trim(),
          netWidth: $("dd[data-code='ProductNetWidth']").text().trim(),
          netWeight: $("dd[data-code='ProductNetWeight']").text().trim(),
        },
        //Technical
        technical: {
          standards: $("dd[data-code='Standards']").text().trim(),
          numberOfPoles: parseInt($("dd[data-code='NumberOfPoles']").text().trim()),
          numberOfProtectPoles: parseInt($("dd[data-code='NumProPol']").text().trim()),
          triCha: $("dd[data-code='TriCha']").text().trim(),
          ratedCurrent: parseInt($("dd[data-code='RatedCurrent']").text().trim().split(' ')[0]),
          ratOpeVol: $("dd[data-code='RatOpeVol']").text().trim(),
          ratSerShoCirBreCap: $("dd[data-code='RatSerShoCirBreCap']").text().trim(),
          ratUltShoCirBreCap: $("dd[data-code='RatUltShoCirBreCap']").text().trim(),
          ratInsShoCirCurSet: $("dd[data-code='RatInsShoCirCurSet']").text().trim(),
          ratOpePowAc3: $("dd[data-code='RatOpePowAc3']").text().trim(),
          ratOpeVol: $("dd[data-code='RatOpeVol']").text().trim(),
          ratOpeCur: parseInt($("dd[data-code='RatOpeCur']").text().trim().split(' ')[0]),
          ratOpeCurAc3: parseInt($("dd[data-code='RatOpeCurAc3']").text().trim().split(' ')[0]),
          ratOpeCurDc5: parseInt($("dd[data-code='RatOpeCurDc5']").text().trim().split(' ')[0]),
          settingRange: $("dd[data-code='ProductNetWeight']").text().trim(),
          powerLoss: $("dd[data-code='PowerLoss']").text().trim(),
          rateInsVol: $("dd[data-code='RatInsVol']").text().trim(),
          operationalVoltage: $("dd[data-code='OperationalVoltage']").text().trim(),
          ratedFrequency: $("dd[data-code='RatedFrequency']").text().trim(),
          ratShoCirCap: $("dd[data-code='RatShoCirCap']").text().trim(),
          energyLimitingClass: $("dd[data-code='EnergyLimitingClass']").text().trim(),
          overvoltageCategory: $("dd[data-code='OvervoltageCategory']").text().trim(),
          pollutionDegree: parseInt($("dd[data-code='PollutionDegree']").text().trim().split(' ')[0]),
          ratImpWitVol: $("dd[data-code='RatImpWitVol']").text().trim(),
          dieTesVol: $("dd[data-code='DieTesVol']").text().trim(),
          houseMaterial: $("dd[data-code='HouseMaterial']").text().trim(),
          typeOpeHea: $("dd[data-code='TypeOpeHea']").text().trim(),
          actuatorMaterial: $("dd[data-code='ActuatorMaterial']").text().trim(),
          conPosInd: $("dd[data-code='ConPosInd']").text().trim(),
          conFreAirTheCur: $("dd[data-code='ConFreAirTheCur']").text().trim(),
          degreeOfProtection: $("dd[data-code='DegreeOfProtection']").text().trim(),
          remarks: $("dd[data-code='Remarks']").text().trim(),
          wirStrLen: $("dd[data-code='WirStrLen']").text().trim(),
          electricalEndurance: $("dd[data-code='ElectricalEndurance']").text().trim(),
          mechanicalEndurance: parseInt($("dd[data-code='mechanicalEndurance']").text().trim().split(' ')[0]),
          termType: $("dd[data-code='TermType']").text().trim(),
          screwTermType: $("dd[data-code='ScrewTermType']").text().trim(),
          connectingCapacity: $("dd[data-code='ConnectingCapacity']").text().trim(),
          tighteningTorque: $("dd[data-code='TighteningTorque']").text().trim(),
          recScrDri: $("dd[data-code='RecScrDri']").text().trim(),
          mountingOnDinRail: $("dd[data-code='MountingOnDinRail']").text().trim(),
          mountingPosition: $("dd[data-code='MountingPosition']").text().trim(),
          minMouDis: $("dd[data-code='MinMouDis']").text().trim(),
          builtinDepth: parseInt($("dd[data-code='BuiltinDepth']").text().trim().split(' ')[0]),
          installationSize: $("dd[data-code='InstallationSize']").text().trim(),
          powSupCon: $("dd[data-code='PowSupCon']").text().trim(),
        },
        documentLink: documentLink,
        originalLink: `https://new.abb.com/products/${id}/`,
        categories: $('.categories-section-wrapper li').text().trim(),
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
