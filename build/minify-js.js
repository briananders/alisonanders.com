const fs = require('fs-extra');
const { globSync } = require('glob');
const UglifyJS = require('uglify-js');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function minifyJS({ dir, completionFlags, buildEvents }) {
  completionFlags.JS_IS_MINIFIED = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} minifyJS()`);

  const jsGlob = globSync(`${dir.package}**/*.js`);

  await Promise.all(jsGlob.map(async (jsFileName) => {
    const data = await fs.readFile(jsFileName, 'utf8');
    const uglifiedJS = UglifyJS.minify(data);

    if (uglifiedJS.error) {
      throw new Error(`UglifyJS error in ${jsFileName}: ${uglifiedJS.error}`);
    }

    await fs.writeFile(jsFileName, uglifiedJS.code);
  }));

  log(`${timestamp.stamp()} minifyJS(): ${chalk.bold.green('DONE')}`);
  completionFlags.JS_IS_MINIFIED = true;
  buildEvents.emit(BUILD_EVENTS.jsMinified);
};
