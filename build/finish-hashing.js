const fs = require('fs-extra');
const { globSync } = require('glob');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function finishHashing({
  dir, completionFlags, buildEvents, hashingFileNameList, debug,
}) {
  completionFlags.ASSET_HASH.DONE = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} finishHashing()`);

  if (debug) {
    log(`${timestamp.stamp()} finishHashing(): ${Object.keys(hashingFileNameList)}`);
    log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.IMAGES : ${completionFlags.ASSET_HASH.IMAGES}`);
    log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.CSS    : ${completionFlags.ASSET_HASH.CSS}`);
    log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.JS     : ${completionFlags.ASSET_HASH.JS}`);
  }

  if (!completionFlags.ASSET_HASH.IMAGES
      || !completionFlags.ASSET_HASH.CSS
      || !completionFlags.ASSET_HASH.JS) {
    return false;
  }

  if (debug) log(`${timestamp.stamp()} finishHashing(): ${Object.keys(hashingFileNameList)}`);

  const htmlGlob = globSync(`${dir.package}**/*.html`);
  const hashEntries = Object.entries(hashingFileNameList);

  await Promise.all(htmlGlob.map(async (file) => {
    let fileContents = (await fs.readFile(file)).toString();

    for (const [key, hashedPath] of hashEntries) {
      const fileName = key.split(dir.package)[1];
      const fileNameHash = hashedPath.split(dir.package)[1];
      if (debug) log(`${timestamp.stamp()} finishHashing():: ${fileName}`);
      if (fileContents.includes(fileName)) {
        fileContents = fileContents.split(fileName).join(fileNameHash);
      }
    }

    await fs.writeFile(file, fileContents);
    if (debug) log(`${timestamp.stamp()} finishHashing()::: ${file}: ${chalk.bold.green('DONE')}`);
  }));

  log(`${timestamp.stamp()} finishHashing(): ${chalk.bold.green('DONE')}`);
  completionFlags.ASSET_HASH.DONE = true;
  buildEvents.emit(BUILD_EVENTS.hashingDone);

  return true;
};
