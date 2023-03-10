const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listTargets = function(targetId, targetName) {
    rengine.getTargets(targetId, targetName)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

createTarget  = function(name, desc, h1handle) {
    rengine.createTarget(name, desc, h1handle)
    .then((resp) => {
        process.exit(0);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listTargets, createTarget }