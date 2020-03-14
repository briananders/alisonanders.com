module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}production`);

  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Alison Anders',
    description: 'Write a description HERE.',
    author: 'Alison Anders',
    contact: 'alison.anders.art@gmail.com',
    domain: 'https://alisonanders.com/', // set domain
  };
};
