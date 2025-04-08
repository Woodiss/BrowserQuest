const Log = require('log');

const logLevel = 'info'; // tu peux rendre ça dynamique si tu veux
const log = new Log(logLevel, process.stdout);

module.exports = {
  info: log.info ? log.info.bind(log) : console.log,
  warn: log.warn ? log.warn.bind(log) : console.warn,
  error: log.error ? log.error.bind(log) : console.error,
  debug: log.debug ? log.debug.bind(log) : console.debug
};
