const fs = require('fs-extra');
const glob = require('glob');
const XXHash = require('xxhash');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = function assetHashing({
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
    log(`${timestamp.stamp()} completionFlags.JS_IS_MINIFIED :${completionFlags.JS_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.CSS_IS_MINIFIED    :${completionFlags.CSS_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.HTML_IS_MINIFIED     :${completionFlags.HTML_IS_MINIFIED}`);
    log(`${timestamp.stamp()} completionFlags.IMAGES_ARE_MOVED     :${completionFlags.IMAGES_ARE_MOVED}`);
  }

  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  const assetGlob = glob.sync(`${dir.package}images/**/*.{png,svg,jpg,webm,mp4}`);

  let processedJs = 0;
  jsGlob.forEach((file, index, array) => {
    if (debug) log(`${timestamp.stamp()} assetHashing().js: ${file} renamed start`);
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      if (debug) log(`${timestamp.stamp()} assetHashing().js: ${hashedFileName} renamed complete`);
      processedJs++;
      if (processedJs >= array.length) {
        completionFlags.ASSET_HASH.JS = true;
        if (debug) log(`${timestamp.stamp()} assetHashing().js: completionFlags.ASSET_HASH.JS: ${completionFlags.ASSET_HASH.JS}`);
        buildEvents.emit(BUILD_EVENTS.assetHashJsListed);
      }
    });
  });

  let processedImages = 0;
  assetGlob.forEach((file, index, array) => {
    if (debug) log(`${timestamp.stamp()} assetHashing().images: ${file} renamed start`);
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      if (debug) log(`${timestamp.stamp()} assetHashing().images: ${hashedFileName} renamed complete`);
      processedImages++;
      if (processedImages >= array.length) {
        completionFlags.ASSET_HASH.IMAGES = true;
        log(`${timestamp.stamp()} assetHashing().images: ${'DONE'.bold.green}`);
        buildEvents.emit(BUILD_EVENTS.assetHashImagesListed);
      }
    });
  });
};
