const https = require('https');
const xlsx = require('xlsx');
const fs = require('fs');

function readXls(file) {
  let body = Buffer.from([]);
  return  new Promise((resolve) => {
    https.get(`https://www.soumu.go.jp/main_content/${file}`, res => {
      res.on('data', data => { body = Buffer.concat([body, data]) });
      res.on('end', () => {
        resolve(xlsx.read(body));
      });
    });
  });
}

const phoneNumbers = {};

Promise.all(
  [
    '000124070.xls',
    '000124071.xls',
    '000124072.xls',
    '000124073.xls',
    '000124074.xls',
    '000124075.xls',
    '000124076.xls',
    '000124077.xls',
    '000124078.xls'
  ].map(file => readXls(file))
).then(workbooks => {
  workbooks.forEach(workbook => {
    const sheet = workbook.Sheets['公開データ'];
    for (let r = 3; r < 65536; r++) {
      if (!sheet[`A${r}`]) break;
      const areaCd = sheet[`D${r}`].v;
      phoneNumbers[areaCd] = {
        ...phoneNumbers[areaCd],
        [sheet[`E${r}`].v]: {
          MA: sheet[`B${r}`].v,
          carrier: sheet[`F${r}`] ? sheet[`F${r}`].v : null,
          status: sheet[`G${r}`] ? sheet[`G${r}`].v : null
        }
      };
    }

    fs.writeFileSync('./phoneNumbers.json', JSON.stringify(phoneNumbers));
  });
});
