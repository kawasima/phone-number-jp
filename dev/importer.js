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
    '000697543.xls',
    '000697544.xls',
    '000697545.xls',
    '000697546.xls',
    '000697548.xls',
    '000697549.xls',
    '000697550.xls',
    '000697551.xls',
    '000697552.xls'
  ].map(file => readXls(file))
).then(workbooks => {
  workbooks.forEach(workbook => {
    const sheet = workbook.Sheets['公開データ'];
    for (let r = 3; r < 65536; r++) {
      if (!sheet[`A${r}`]) break;
      const areaCd = sheet[`C${r}`].v;
      const localNumber = sheet[`D${r}`].v;
      phoneNumbers[areaCd] = {
        ...phoneNumbers[areaCd],
        [localNumber]: {
          MA: sheet[`A${r}`].v,
          carrier: sheet[`E${r}`] ? sheet[`E${r}`].v : null,
          status: sheet[`F${r}`] ? sheet[`F${r}`].v : null
        }
      };
    }

    fs.writeFileSync('./phoneNumbers.json', JSON.stringify(phoneNumbers));
  });
});
