const fs = require('fs-extra');
const { globSync } = require('glob');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function updateCSSwithImageHashes({
  dir, buildEvents, hashingFileNameList, debug,
}) {
  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} hashingUpdateCSS()`);

  const cssGlob = globSync(`${dir.package}**/*.css`);
  const hashEntries = Object.entries(hashingFileNameList);

  await Promise.all(cssGlob.map(async (file) => {
    let fileContents = (await fs.readFile(file)).toString();

    for (const [key, hashedPath] of hashEntries) {
      const fileName = key.split(dir.package)[1];
      const fileNameHash = hashedPath.split(dir.package)[1];
      if (debug) log(`${timestamp.stamp()} hashingUpdateCSS():: ${fileName}`);
      if (fileContents.includes(fileName)) {
        fileContents = fileContents.split(fileName).join(fileNameHash);
      }
    }

    await fs.writeFile(file, fileContents);
    if (debug) log(`${timestamp.stamp()} hashingUpdateCSS()::: ${file}: ${chalk.bold.green('DONE')}`);
  }));

  log(`${timestamp.stamp()} hashingUpdateCSS(): ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.indexCssForHashing);
};
