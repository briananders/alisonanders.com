const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { globSync } = require('glob');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

function hashFile(fileContents) {
  return crypto.createHash('sha256').update(fileContents).digest('hex').slice(0, 8);
}

module.exports = async function hashCSS({
  dir, completionFlags, buildEvents, hashingFileNameList, debug,
}) {
  completionFlags.ASSET_HASH.CSS = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} assetHashing().css`);

  const cssGlob = globSync(`${dir.package}**/*.css`);

  await Promise.all(cssGlob.map(async (file) => {
    const fileContents = await fs.readFile(file);
    const hash = hashFile(fileContents);
    const ext = path.extname(file);
    const base = file.slice(0, file.length - ext.length);
    const hashedFileName = `${base}-${hash}${ext}`;
    hashingFileNameList[file] = hashedFileName;
    await fs.rename(file, hashedFileName);
    if (debug) log(`${timestamp.stamp()} assetHashing().css: ${hashedFileName} renamed complete`);
  }));

  completionFlags.ASSET_HASH.CSS = true;
  log(`${timestamp.stamp()} assetHashing().css: ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.assetHashCssListed);
};
