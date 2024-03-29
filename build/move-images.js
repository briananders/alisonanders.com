const fs = require('fs-extra');
const copy = require('copy');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = function moveImages({ dir, completionFlags, buildEvents }) {
  completionFlags.IMAGES_ARE_MOVED = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} moveImages()`);
  log(`${timestamp.stamp()} moveFonts()`);
  log(`${timestamp.stamp()} moveTxt()`);

  // move images over
  fs.copy(`${dir.src}images/`, `${dir.package}images/`, (err) => {
    if (err) throw err;
    log(`${timestamp.stamp()} moveImages(): ${'DONE'.bold.green}`);
    completionFlags.IMAGES_ARE_MOVED = true;
    buildEvents.emit(BUILD_EVENTS.imagesMoved);
  });

  // move humans and robots text files
  copy(`${dir.src}*.txt`, `${dir.package}`, (err) => {
    if (err) throw err;
    log(`${timestamp.stamp()} moveTxt(): ${'DONE'.bold.green}`);
  });

  // move humans and robots text files
  fs.copy(`${dir.src}fonts/`, `${dir.package}fonts/`, (err) => {
    if (err) throw err;
    log(`${timestamp.stamp()} moveFonts(): ${'DONE'.bold.green}`);
  });
};
