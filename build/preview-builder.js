const chokidar = require('chokidar');
const chalk = require('chalk');

const { log } = console;

const timestamp = require('./timestamp');
const BUILD_EVENTS = require('./constants/build-events');
const bundleJS = require('./bundle-js');
const bundleSCSS = require('./bundle-scss');
const compilePageMappingData = require('./page-mapping-data');
const convertToWebP = require('./convert-to-webp');
const moveImages = require('./move-images');

function watchForPreviewReady({ buildEvents, completionFlags }) {
  const eventsToWatch = {
    jsMoved: false,
    templatesMoved: false,
    stylesMoved: false,
    imagesMoved: false,
  };

  function check() {
    if (Object.values(eventsToWatch).every(Boolean)) {
      completionFlags.PREVIEW_READY = true;
      buildEvents.emit(BUILD_EVENTS.previewReady);
    }
  }

  buildEvents.on(BUILD_EVENTS.jsMoved, () => { eventsToWatch.jsMoved = true; check(); });
  buildEvents.on(BUILD_EVENTS.templatesMoved, () => { eventsToWatch.templatesMoved = true; check(); });
  buildEvents.on(BUILD_EVENTS.stylesMoved, () => { eventsToWatch.stylesMoved = true; check(); });
  buildEvents.on(BUILD_EVENTS.imagesMoved, () => { eventsToWatch.imagesMoved = true; check(); });
}

module.exports = (configs) => {
  const { dir } = configs;

  watchForPreviewReady(configs);

  function update(filePath) {
    if (filePath.includes('.DS_Store')) return;
    log(`${timestamp.stamp()} ${chalk.yellow(`File modified: ${filePath.split('alisonanders.com')[1]}`)}`);

    switch (true) {
      case filePath.includes(`${dir.src}js/`):
        bundleJS(configs);
        break;
      case filePath.includes(`${dir.src}styles/`):
        bundleSCSS(configs);
        break;
      case filePath.includes(`${dir.src}templates/`):
      case filePath.includes(`${dir.src}partials/`):
      case filePath.includes(`${dir.src}layout/`):
        compilePageMappingData(configs);
        break;
      case filePath.includes(`${dir.src}images/`):
        convertToWebP(configs).then(() => moveImages(configs));
        break;
      default:
    }
  }

  function buildChanged(filePath) {
    if (filePath.includes('.DS_Store')) return;
    log(`${timestamp.stamp()} ${chalk.bold.red(`Build file modified: ${filePath.split('alisonanders.com')[1]}`)}`);
    process.exit();
  }

  const buildDirWatcher = chokidar.watch(dir.build);
  const indexWatcher = chokidar.watch(`${dir.root}index.js`);
  const sourceWatcher = chokidar.watch(dir.src);

  buildDirWatcher.on('ready', () => {
    buildDirWatcher
      .on('change', buildChanged)
      .on('add', buildChanged)
      .on('unlink', buildChanged)
      .on('addDir', buildChanged)
      .on('unlinkDir', buildChanged);
  });

  indexWatcher.on('change', buildChanged);

  sourceWatcher.on('ready', () => {
    sourceWatcher
      .on('change', update)
      .on('add', update)
      .on('unlink', update)
      .on('addDir', update)
      .on('unlinkDir', update);
  });
};
