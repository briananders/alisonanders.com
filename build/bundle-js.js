const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const browserify = require('browserify');
const babelify = require('babelify');
const notifier = require('node-notifier');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function bundleJS({ dir, buildEvents, debug }) {
  const timestamp = require(`${dir.build}timestamp`);
  const production = require(`${dir.build}production`);

  log(`${timestamp.stamp()} bundleJS()`);

  const scriptGlob = globSync(`${dir.src}js/**/[^_]*.js`);

  for (const jsFilename of scriptGlob) {
    const outFile = jsFilename.replace(`${dir.src}js/`, dir.jsOutputPath);

    if (debug) {
      log(`${timestamp.stamp()} ${chalk.magenta('REQUEST')} - Compiling JS - ${outFile.split(/scripts/)[1]}`);
    }

    // eslint-disable-next-line no-await-in-loop
    await fs.mkdirp(path.dirname(outFile));

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve, reject) => {
      browserify(jsFilename, { debug: !production })
        .transform(babelify, { presets: ['@babel/preset-env', '@babel/preset-react'] })
        .bundle()
        .on('error', (error) => {
          if (production) return reject(error);
          console.error(chalk.red(error.message));
          notifier.notify({ title: 'JavaScript Error', message: error.message });
          return resolve();
        })
        .pipe(fs.createWriteStream(outFile))
        .on('finish', resolve)
        .on('error', reject);
    });

    if (debug) {
      log(`${timestamp.stamp()} ${chalk.bold.green('SUCCESS')} - Compiled JS  - ${outFile.split(/scripts/)[1]}`);
    }
  }

  log(`${timestamp.stamp()} bundleJS(): ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.jsMoved);
};
