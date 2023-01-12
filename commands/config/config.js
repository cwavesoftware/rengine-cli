const os = require('os');
const path = require('path');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require('chalk');
const fs = require('fs');


getConf = async function() {
    return new Promise((resolv, reject) => {
        const url = prompt(chalk.yellow('Rengine URL: '));
        const username = prompt(chalk.yellow('Rengine username: '));
        const password = prompt(chalk.yellow('Rengine password: '), {echo: '*'});

        resolv({url, username, password});
    })
}

writeConf  = async function() {
    await getConf()
    .then((configParams) => {
        var conf = {
            rengine: configParams
        };
        conf = JSON.stringify(conf);
        const cnfFilePath = path.join(`${os.homedir}`, '.config', 'rengine-cli.json');

        try{
            fs.writeFileSync(cnfFilePath, conf);
            console.log(chalk.blue('config saved'));
        } catch (err) {
            console.log(chalk.red(err));
        }
    });
}

module.exports= {writeConf}