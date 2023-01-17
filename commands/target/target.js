const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listTargets = function() {
    rengine.getTargets()
    .then((resp) => {
        util.prettyprint(resp);
    })
    .catch((error) => {
        console.error(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listTargets}