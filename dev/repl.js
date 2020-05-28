const repl = require('repl').start();
const { parse } = require('../index');

const homeDir = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
repl.setupHistory(`${homeDir}/.node_repl_history`, (err) => {
  if (err) console.error(err);
});

Object.defineProperty(repl.context, 'parse', {
  configurable: false,
  value: parse
});
