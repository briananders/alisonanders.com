'use strict';

const chalk = require('chalk');
const fs = require('fs-extra');
const express = require('express');
const EventEmitter = require('events');
const dir = require('./build/constants/directories')(__dirname);

const timestamp = require(`${dir.build}timestamp`);
const production = require(`${dir.build}production`);

const bundleEJS = require(`${dir.build}bundle-ejs`);
const bundleJS = require(`${dir.build}bundle-js`);
const bundleSCSS = require(`${dir.build}bundle-scss`);
const clean = require(`${dir.build}clean`);
const compilePageMappingData = require(`${dir.build}page-mapping-data`);
const moveImages = require(`${dir.build}move-images`);
const sitemap = require(`${dir.build}sitemap`);
const prodBuilder = require(`${dir.build}prod-builder`);
const previewBuilder = require(`${dir.build}preview-builder`);

const completionFlags = require(`${dir.build}constants/completion-flags`);
const BUILD_EVENTS = require(`${dir.build}constants/build-events`);

const { log } = console;
const debug = process.argv.includes('--verbose');

const app = express();
const buildEvents = new EventEmitter();

const hashingFileNameList = {};
const pageMappingData = [];

const configs = {
  BUILD_EVENTS,
  buildEvents,
  completionFlags,
  debug,
  dir,
  hashingFileNameList,
  pageMappingData,
};

buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, () => bundleEJS(configs));
buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, () => sitemap(configs));
buildEvents.on(BUILD_EVENTS.previewReady, () => log(`${timestamp.stamp()} ${chalk.green.bold('Preview Ready')}`));

if (!production) {
  previewBuilder(configs);
} else {
  prodBuilder(configs);
}

log(chalk.blueBright.bold(`PRODUCTION: ${String(production).toUpperCase()}`));

clean(configs).then(() => {
  if (debug) log(`${timestamp.stamp()} clean().then()`);
  fs.mkdirp(dir.package);
  compilePageMappingData(configs);
  bundleJS(configs);
  bundleSCSS(configs);
  moveImages(configs);
});

if (!production) {
  app.use(express.static(dir.package));

  const server = app.listen(3000, () => {
    log(`${timestamp.stamp()} server is running at %s`, server.address().port);
  });
}
