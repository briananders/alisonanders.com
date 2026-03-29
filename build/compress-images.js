'use strict';

const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const sharp = require('sharp');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

// PNG: truly lossless — higher deflate compression level, no pixel data change.
async function compressPng(filePath, debug, stamp) {
  const input = await fs.readFile(filePath);
  const output = await sharp(input)
    .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
    .toBuffer();
  if (output.length < input.length) {
    await fs.writeFile(filePath, output);
    if (debug) {
      const saved = ((1 - output.length / input.length) * 100).toFixed(1);
      log(`${stamp()} compress png: ${path.basename(filePath)} ${chalk.green(`-${saved}%`)}`);
    }
  }
}

// JPEG: near-lossless — mozjpeg at quality 95 with progressive encoding.
// Only written if the output is strictly smaller than the original.
async function compressJpg(filePath, debug, stamp) {
  const input = await fs.readFile(filePath);
  const output = await sharp(input)
    .jpeg({ quality: 95, mozjpeg: true, progressive: true, force: true })
    .toBuffer();
  if (output.length < input.length) {
    await fs.writeFile(filePath, output);
    if (debug) {
      const saved = ((1 - output.length / input.length) * 100).toFixed(1);
      log(`${stamp()} compress jpg: ${path.basename(filePath)} ${chalk.green(`-${saved}%`)}`);
    }
  }
}

module.exports = async function compressImages({
  dir, completionFlags, buildEvents, debug,
}) {
  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} compressImages()`);

  const pngFiles = globSync(`${dir.package}images/**/*.png`);
  const jpgFiles = globSync(`${dir.package}images/**/*.{jpg,jpeg}`);

  await Promise.all([
    ...pngFiles.map((f) => compressPng(f, debug, timestamp.stamp)),
    ...jpgFiles.map((f) => compressJpg(f, debug, timestamp.stamp)),
  ]);

  log(`${timestamp.stamp()} compressImages(): ${chalk.bold.green('DONE')}`);
  completionFlags.IMAGE_COMPRESSION = true;
  buildEvents.emit(BUILD_EVENTS.imageCompressionDone);
};
