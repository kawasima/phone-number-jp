const repl = require('repl').start();
const { parse,
  MobilePhoneNumber,
  IPPhoneNumber,
  FMCPhoneNumber,
  ServicePhoneNumber,
  M2MNumber,
  PocketBellNumber,
  IMSI
} = require('../index');

const homeDir = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
repl.setupHistory(`${homeDir}/.node_repl_history`, (err) => {
  if (err) console.error(err);
});

const types = {
  parse,
  MobilePhoneNumber,
  IPPhoneNumber,
  FMCPhoneNumber,
  ServicePhoneNumber,
  M2MNumber,
  PocketBellNumber,
  IMSI
};

for (const [name, value] of Object.entries(types)) {
  Object.defineProperty(repl.context, name, {
    configurable: false,
    value
  });
}

repl.defineCommand('types', {
  help: '利用可能なPhoneNumber型を一覧表示',
  action() {
    console.log('  LandLinePhoneNumber   固定電話番号 (0AB-J)');
    console.log('  MobilePhoneNumber     携帯電話番号 (060/070/080/090)');
    console.log('  IPPhoneNumber         IP電話番号 (050)');
    console.log('  FMCPhoneNumber        FMC電話番号 (060-0XXX)');
    console.log('  ServicePhoneNumber    付加的役務電話番号 (0120/0170/0180/0570/0800/0990)');
    console.log('  M2MNumber             M2M番号 (020 11桁/0200 14桁)');
    console.log('  PocketBellNumber      無線呼出番号 (0204)');
    console.log('  IMSI                  IMSI (44...)');
    this.displayPrompt();
  }
});

repl.defineCommand('usage', {
  help: '使い方を表示',
  action() {
    console.log('  parse(number)              デフォルト型でパース');
    console.log('    例: parse("09012345678")');
    console.log('  parse(number, {types: []}) 型を指定してパース');
    console.log('    例: parse("0120123456", {types: [ServicePhoneNumber]})');
    console.log('  Type.parse(number)         特定の型で直接パース');
    console.log('    例: MobilePhoneNumber.parse("09012345678")');
    console.log('  Type.isApplicable(number)  番号が型に該当するか判定');
    console.log('    例: MobilePhoneNumber.isApplicable("09012345678")');
    this.displayPrompt();
  }
});
