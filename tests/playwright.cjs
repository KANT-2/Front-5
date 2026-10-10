/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
// npm exec --package=playwright가 제공하는 임시 패키지 경로도 지원한다.
const packagePath = process.env.PATH.split(path.delimiter)
  .map((entry) => path.resolve(entry, "../playwright"))
  .find((entry) => fs.existsSync(path.join(entry, "package.json")));
module.exports = packagePath ? require(packagePath) : require("playwright");
