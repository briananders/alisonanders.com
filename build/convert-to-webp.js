'use strict';

const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const sharp = require('sharp');
const chalk = require('chalk');

const { log } = console;

async function convertFile(filePath, debug, stamp) {
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = `${filePath.slice(0, -ext.length)}.webp`;

  // Skip if WebP already exists and is not older than the source.
  if (await fs.pathExists(webpPath)) {
    const [srcStat, webpStat] = await Promise.all([fs.stat(filePath), fs.stat(webpPath)]);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      if (debug) log(`${stamp()} convert webp: ${path.basename(webpPath)} ${chalk.grey('skipped')}`);
      return;
    }
  }

  // PNG sources use lossless WebP to preserve transparency and exact pixels.
  // JPEG sources use lossy WebP at quality 90 — smaller than JPEG at equivalent quality.
  const sharpOptions = ext === '.png'
    ? { lossless: true }
    : { quality: 90, smartSubsample: true };

  const output = await sharp(filePath).webp(sharpOptions).toBuffer();
  await fs.writeFile(webpPath, output);

  if (debug) {
    const srcSize = (await fs.stat(filePath)).size;
    const saved = ((1 - output.length / srcSize) * 100).toFixed(1);
    log(`${stamp()} convert webp: ${path.basename(webpPath)} ${chalk.green(`-${saved}%`)}`);
  }
}

module.exports = async function convertToWebP({ dir, debug }) {
  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} convertToWebP()`);

  const imageFiles = globSync(`${dir.src}images/**/*.{jpg,jpeg,png}`);

  await Promise.all(imageFiles.map((f) => convertFile(f, debug, timestamp.stamp)));

  log(`${timestamp.stamp()} convertToWebP(): ${chalk.bold.green('DONE')}`);
};
