const fs = require('fs-extra');
const { globSync } = require('glob');
const { minify } = require('html-minifier-terser');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function minifyHTML({
  dir, completionFlags, buildEvents, debug,
}) {
  completionFlags.HTML_IS_MINIFIED = false;

  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} minifyHTML()`);

  const htmlGlob = globSync(`${dir.package}**/*.html`);

  await Promise.all(htmlGlob.map(async (htmlFileName) => {
    if (debug) log(`${timestamp.stamp()} minifyHTML - ${htmlFileName.split('/package/')[1]}`);

    const data = await fs.readFile(htmlFileName, 'utf8');
    const minifiedHtml = await minify(data, {
      caseSensitive: true,
      collapseWhitespace: false,
      conservativeCollapse: true,
      html5: true,
      keepClosingSlash: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeComments: true,
      sortClassName: true,
      useShortDoctype: true,
    });

    await fs.writeFile(htmlFileName, minifiedHtml);
  }));

  log(`${timestamp.stamp()} minifyHTML(): ${chalk.bold.green('DONE')}`);
  completionFlags.HTML_IS_MINIFIED = true;
  buildEvents.emit(BUILD_EVENTS.htmlMinified);
};
