// exports.log = (msg) => {
//   console.log(`[${new Date().toISOString()}] ${msg}`);
// };

exports.info = (msg) => {
  console.log(`\x1b[32m[INFO] [${new Date().toISOString()}]: ${msg}\x1b[0m`);
};

exports.warn = (msg) => {
  console.warn(`\x1b[33m[WARN] [${new Date().toISOString()}]: ${msg}\x1b[0m`);
};

exports.error = (msg) => {
  console.error(`\x1b[31m[ERROR] [${new Date().toISOString()}]: ${msg}\x1b[0m`);
};
