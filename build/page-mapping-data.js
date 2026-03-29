const { globSync } = require('glob');
const matter = require('gray-matter');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = ({ dir, buildEvents, pageMappingData }) => {
  const timestamp = require(`${dir.build}timestamp`);
  const templateGlob = globSync(`${dir.src}templates/**/[^_]*.ejs`);

  pageMappingData.splice(0, pageMappingData.length);

  log(`${timestamp.stamp()} compilePageMappingData()`);

  for (const templatePath of templateGlob) {
    const outputPath = templatePath
      .replace(`${dir.src}templates/`, dir.package)
      .replace(/\.ejs$/, templatePath.includes('.html.ejs') ? '' : '/index.html');
    const frontMatter = matter.read(templatePath);

    pageMappingData.push({
      url: outputPath.replace(dir.package, '').replace('index.html', ''),
      data: frontMatter.data,
    });
  }

  log(`${timestamp.stamp()} compilePageMappingData() ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.pageMappingDataCompiled);
};
