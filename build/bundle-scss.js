const sass = require('sass');
const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const CleanCSS = require('clean-css');
const notifier = require('node-notifier');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function bundleSCSS({
  dir, completionFlags, buildEvents, debug,
}) {
  completionFlags.CSS_IS_MINIFIED = false;

  const timestamp = require(`${dir.build}timestamp`);
  const production = require(`${dir.build}production`);

  log(`${timestamp.stamp()} bundleSCSS()`);

  const stylesGlob = globSync(`${dir.src}**/**/[^_]*.scss`);
  let processed = 0;

  for (const scssFilename of stylesGlob) {
    const outFile = scssFilename.replace(dir.src, dir.package).replace(/\.scss$/, '.css');

    if (debug) {
      log(`${timestamp.stamp()} ${chalk.magenta('REQUEST')} - Compiling SASS - ${outFile.split(/styles/)[1]}`);
    }

    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await sass.compileAsync(scssFilename, {
        loadPaths: [`${dir.src}styles/`, dir.nodeModules],
        sourceMap: false,
      });

      // eslint-disable-next-line no-await-in-loop
      await fs.mkdirp(path.dirname(outFile));

      const cssOutput = production
        ? new CleanCSS().minify(result.css).styles
        : result.css;

      // eslint-disable-next-line no-await-in-loop
      await fs.writeFile(outFile, cssOutput);

      if (debug) {
        log(`${timestamp.stamp()} ${chalk.bold.green('SUCCESS')} - Compiled SASS - ${outFile.split(/styles/)[1]}`);
      }
    } catch (error) {
      if (production) throw error;
      console.error(chalk.red(error.message));
      notifier.notify({ title: 'SASS Error', message: error.message });
    }

    processed += 1;
  }

  log(`${timestamp.stamp()} bundleSCSS(): ${chalk.bold.green('DONE')}`);
  completionFlags.CSS_IS_MINIFIED = true;
  buildEvents.emit(BUILD_EVENTS.stylesMoved);
};
