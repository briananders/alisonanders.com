const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const ejs = require('ejs');
const matter = require('gray-matter');
const notifier = require('node-notifier');
const chalk = require('chalk');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

function handleTemplateError(e) {
  console.error(chalk.red(e.message));
  notifier.notify({ title: 'Template Error', message: e.message });
  return `
    <html>
      <head></head>
      <body>
        <h1>There was an error.</h1>
        <div style="color: red; font-family: monospace;">
          ${
  e.message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
    .replace(/\s\s/g, '&nbsp;&nbsp;')
}
        </div>
      </body>
    </html>`;
}

async function renderTemplate({
  templatePath,
  ejsFunctions,
  siteData,
  dir,
  production,
  ejsOptions,
  pagePath,
  frontMatter,
}) {
  const templateData = { ...ejsFunctions, ...siteData, ...frontMatter.data, path: pagePath };

  if (!production && !templateData.layout) {
    const errorMessage = `You are missing a template definition in ${templatePath}`;
    console.error(chalk.red(errorMessage));
    notifier.notify({ title: 'Template undefined', message: errorMessage });
    throw new Error(errorMessage);
  }

  let fileData;
  try {
    fileData = (await fs.readFile(`${dir.src}layout/${templateData.layout}.ejs`)).toString();
  } catch (error) {
    if (production) throw error;
    console.error(chalk.red(error.message));
    notifier.notify({ title: 'Template Error', message: error.message });
    throw error;
  }

  let html;
  try {
    const renderedTemplate = ejs.render(frontMatter.content, templateData, ejsOptions);
    html = ejs.render(fileData, { content: renderedTemplate, ...templateData }, ejsOptions);
  } catch (e) {
    html = handleTemplateError(e);
  }

  if (matter.test(html)) {
    const nextFrontMatter = matter(html);
    // eslint-disable-next-line no-param-reassign
    frontMatter.content = nextFrontMatter.content;
    // eslint-disable-next-line no-param-reassign
    frontMatter.data = { ...frontMatter.data, ...nextFrontMatter.data };
    return renderTemplate({
      templatePath,
      ejsFunctions,
      siteData,
      dir,
      production,
      ejsOptions,
      pagePath,
      frontMatter,
    });
  }

  return html;
}

module.exports = async function bundleEJS({
  dir, buildEvents, pageMappingData, debug,
}) {
  const siteData = require(`${dir.build}site-data`)(dir);
  const timestamp = require(`${dir.build}timestamp`);
  const production = require(`${dir.build}production`);

  log(`${timestamp.stamp()} bundleEJS()`);

  const templateGlob = globSync(`${dir.src}templates/**/[^_]*.ejs`);
  let processed = 0;

  for (const templatePath of templateGlob) {
    if (debug) {
      log(`${timestamp.stamp()} ${chalk.magenta('REQUEST')} - Compiling Template - ${templatePath.split(/templates/)[1]}`);
    }

    const ejsFunctions = require(`${dir.build}ejs-functions`)(dir, pageMappingData);
    const ejsOptions = {
      compileDebug: true,
      filename: templatePath,
      root: `${dir.src}templates/`,
    };
    const outputPath = templatePath
      .replace(`${dir.src}templates/`, dir.package)
      .replace(/\.ejs$/, templatePath.includes('.html.ejs') ? '' : '/index.html');
    const pagePath = outputPath.replace(dir.package, '').replace('index.html', '');
    const frontMatter = matter.read(templatePath);

    try {
      // eslint-disable-next-line no-await-in-loop
      const html = await renderTemplate({
        templatePath,
        ejsFunctions,
        siteData,
        dir,
        production,
        ejsOptions,
        pagePath,
        frontMatter,
      });

      // eslint-disable-next-line no-await-in-loop
      await fs.mkdirp(path.dirname(outputPath));
      // eslint-disable-next-line no-await-in-loop
      await fs.writeFile(outputPath, html);

      if (debug) {
        log(`${timestamp.stamp()} ${chalk.bold.green('SUCCESS')} - Compiled Template - ${outputPath.split(/package/)[1]}`);
      }
    } catch (err) {
      if (err && production) throw err;
      else if (err) {
        console.error(chalk.red(err.message));
        notifier.notify({ title: 'Template Error', message: err.message });
      }
    }

    processed += 1;
  }

  log(`${timestamp.stamp()} bundleEJS(): ${chalk.bold.green('DONE')}`);
  buildEvents.emit(BUILD_EVENTS.templatesMoved);
};
