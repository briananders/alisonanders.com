const fs = require('fs-extra');
const { globSync } = require('glob');
const zlib = require('zlib');
const { promisify } = require('util');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;
const gzip = promisify(zlib.gzip);

module.exports = async function gzipFiles({
  dir, completionFlags, buildEvents, debug,
}) {
  completionFlags.GZIP = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} gzip()`);

  const overallGlob = globSync(`${dir.package}**/*.+(html|xml|css|js)`);

  if (debug) log(`overallGlob: ${overallGlob.length} \n\n ${overallGlob} \n`);

  await Promise.all(overallGlob.map(async (file) => {
    const data = await fs.readFile(file);
    const compressed = await gzip(data);
    await fs.writeFile(`${file}.gz`, compressed);
    if (debug) log(`${timestamp.stamp()} gzip: ${file} ${chalk.bold.green('complete')}`);
  }));

  log(`${timestamp.stamp()} gzip(): ${chalk.bold.green('DONE')}`);
  completionFlags.GZIP = true;
  buildEvents.emit(BUILD_EVENTS.gzipDone);
};
