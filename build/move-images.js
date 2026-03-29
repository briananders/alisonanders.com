const fs = require('fs-extra');
const { globSync } = require('glob');
const path = require('path');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function moveImages({ dir, completionFlags, buildEvents }) {
  completionFlags.IMAGES_ARE_MOVED = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} moveImages()`);
  log(`${timestamp.stamp()} moveFonts()`);
  log(`${timestamp.stamp()} moveTxt()`);

  await Promise.all([
    fs.copy(`${dir.src}images/`, `${dir.package}images/`).then(() => {
      log(`${timestamp.stamp()} moveImages(): ${chalk.bold.green('DONE')}`);
      completionFlags.IMAGES_ARE_MOVED = true;
      buildEvents.emit(BUILD_EVENTS.imagesMoved);
    }),

    (async () => {
      const txtFiles = globSync(`${dir.src}*.txt`);
      await Promise.all(txtFiles.map((file) => fs.copy(file, path.join(dir.package, path.basename(file)))));
      log(`${timestamp.stamp()} moveTxt(): ${chalk.bold.green('DONE')}`);
    })(),

    fs.copy(`${dir.src}fonts/`, `${dir.package}fonts/`).then(() => {
      log(`${timestamp.stamp()} moveFonts(): ${chalk.bold.green('DONE')}`);
    }),
  ]);
};
