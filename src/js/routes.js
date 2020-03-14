module.exports = {
  '*': require('./all'),
  '/': require('./index'),
  404: require('./four-oh-four'),
  piece: {
    '*': require('./piece/all'),
  },
};
