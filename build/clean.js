const fs = require('fs-extra');
const chalk = require('chalk');
const timestamp = require('./timestamp');

const { log } = console;

module.exports = async ({ dir }) => {
  log(`${timestamp.stamp()} clean()`);
  await fs.emptyDir(dir.package);
  log(`${timestamp.stamp()} clean(): ${chalk.bold.green('DONE')}`);
};
