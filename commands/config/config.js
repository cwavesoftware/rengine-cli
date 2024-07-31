const prompt = require('prompt-sync')({ sigint: true });
const chalk = require('chalk');
const fs = require('fs');
const { CONFIG_FILE } = require('../../const');

getConf = async function(opts) {
  return new Promise((resolv, reject) => {
    const url = opts.url || prompt(chalk.yellow('Rengine URL: '));
    const username = opts.user || prompt(chalk.yellow('Rengine username: '));
    const password = opts.password || prompt(chalk.yellow('Rengine password: '), { echo: '*' });

    resolv({ url, username, password });
  })
}

writeConf = async function(opts) {
  await getConf(opts)
    .then((configParams) => {
      if (fs.existsSync(CONFIG_FILE)) {
        conf = require(CONFIG_FILE);
      } else {
        conf = {
        }
      }
      conf.rengine = configParams;
      conf = JSON.stringify(conf);

      try {
        fs.writeFileSync(CONFIG_FILE, conf);
        console.log(chalk.blue('config saved'));
      } catch (err) {
        console.error(chalk.red(err));
      }
    });
}

module.exports = { writeConf }
