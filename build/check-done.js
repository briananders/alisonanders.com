const chalk = require('chalk');

const { log } = console;

module.exports = function checkDone({ dir, debug, completionFlags }) {
  const timestamp = require(`${dir.build}timestamp`);

  if (!completionFlags.ASSET_HASH.DONE
      || !completionFlags.SITE_MAP
      || !completionFlags.IMAGE_COMPRESSION
      || !completionFlags.GZIP) {
    if (debug) {
      log(`${timestamp.stamp()} completionFlags.ASSET_HASH.DONE   : ${chalk.bold.green(String(completionFlags.ASSET_HASH.DONE))}`);
      log(`${timestamp.stamp()} completionFlags.SITE_MAP          : ${chalk.bold.green(String(completionFlags.SITE_MAP))}`);
      log(`${timestamp.stamp()} completionFlags.IMAGE_COMPRESSION : ${chalk.bold.green(String(completionFlags.IMAGE_COMPRESSION))}`);
      log(`${timestamp.stamp()} completionFlags.GZIP              : ${chalk.bold.green(String(completionFlags.GZIP))}`);
    }
    return false;
  }

  log(`${timestamp.stamp()} completionFlags.ASSET_HASH.DONE   : ${chalk.bold.green(String(completionFlags.ASSET_HASH.DONE))}`);
  log(`${timestamp.stamp()} completionFlags.SITE_MAP          : ${chalk.bold.green(String(completionFlags.SITE_MAP))}`);
  log(`${timestamp.stamp()} completionFlags.IMAGE_COMPRESSION : ${chalk.bold.green(String(completionFlags.IMAGE_COMPRESSION))}`);
  log(`${timestamp.stamp()} completionFlags.GZIP              : ${chalk.bold.green(String(completionFlags.GZIP))}`);

  require(`${dir.build}exit-message`)();

  process.exit();
};
