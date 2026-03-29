const chalk = require('chalk');

module.exports = {
  stamp() {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()];

    for (let i = 1; i < 3; i++) {
      if (time[i] < 10) {
        time[i] = `0${time[i]}`;
      }
    }

    return chalk.grey(`[${time.join(':')}]`);
  },
};
