
const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listIPs  = function(scanId, targetId, targetName, port) {
    rengine.getIPs(scanId, targetId, targetName, port)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listIPs}

