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

module.exports = async function assetHashing({
  dir, completionFlags, buildEvents, hashingFileNameList, debug,
}) {
  completionFlags.ASSET_HASH.IMAGES = false;
  completionFlags.ASSET_HASH.JS = false;

  const timestamp = require(`${dir.build}timestamp`);

  if (!completionFlags.JS_IS_MINIFIED
      || !completionFlags.CSS_IS_MINIFIED
      || !completionFlags.HTML_IS_MINIFIED
      || !completionFlags.IMAGES_ARE_MOVED) {
    return false;
  }

  log(`${timestamp.stamp()} assetHashing().images`);

  if (debug) {
    log(`${timestamp.stamp()} completionFlags.JS_IS_MINIFIED   : ${completionFlags.JS_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.CSS_IS_MINIFIED  : ${completionFlags.CSS_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.HTML_IS_MINIFIED : ${completionFlags.HTML_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.IMAGES_ARE_MOVED : ${completionFlags.IMAGES_ARE_MOVED}`);
  }

  const jsGlob = globSync(`${dir.package}**/*.js`);
  const assetGlob = globSync(`${dir.package}images/**/*.{png,svg,jpg,jpeg,webp,webm,mp4}`);

  await Promise.all(jsGlob.map(async (file) => {
    if (debug) log(`${timestamp.stamp()} assetHashing().js: ${file} renamed start`);
    const fileContents = await fs.readFile(file);
    const hash = hashFile(fileContents);
    const ext = path.extname(file);
    const base = file.slice(0, file.length - ext.length);
    const hashedFileName = `${base}-${hash}${ext}`;
    hashingFileNameList[file] = hashedFileName;
    await fs.rename(file, hashedFileName);
    if (debug) log(`${timestamp.stamp()} assetHashing().js: ${hashedFileName} renamed complete`);
  }));

  completionFlags.ASSET_HASH.JS = true;
  if (debug) log(`${timestamp.stamp()} assetHashing().js: completionFlags.ASSET_HASH.JS: ${completionFlags.ASSET_HASH.JS}`);
  buildEvents.emit(BUILD_EVENTS.assetHashJsListed);

  await Promise.all(assetGlob.map(async (file) => {
    if (debug) log(`${timestamp.stamp()} assetHashing().images: ${file} renamed start`);
    const fileContents = await fs.readFile(file);
    const hash = hashFile(fileContents);
    const ext = path.extname(file);
    const base = file.slice(0, file.length - ext.length);
    const hashedFileName = `${base}-${hash}${ext}`;
    hashingFileNameList[file] = hashedFileName;
    await fs.rename(file, hashedFileName);
    if (debug) log(`${timestamp.stamp()} assetHashing().images: ${hashedFileName} renamed complete`);
  }));

  completionFlags.ASSET_HASH.IMAGES = true;
  log(`${timestamp.stamp()} assetHashing().images: ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.assetHashImagesListed);

  return true;
};
