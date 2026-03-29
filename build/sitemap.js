const ejs = require('ejs');
const fs = require('fs-extra');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = async function sitemap({
  dir, completionFlags, buildEvents, pageMappingData,
}) {
  completionFlags.SITE_MAP = false;

  const timestamp = require(`${dir.build}timestamp`);
  const siteData = require(`${dir.build}site-data`)(dir);

  log(`${timestamp.stamp()} sitemap()`);

  const str = await ejs.renderFile(`${dir.src}sitemap.xml.ejs`, {
    pages: pageMappingData,
    siteData,
  }, { compileDebug: true });

  await fs.writeFile(`${dir.package}sitemap.xml`, str);

  completionFlags.SITE_MAP = true;
  log(`${timestamp.stamp()} sitemap(): ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.sitemapDone);
};
