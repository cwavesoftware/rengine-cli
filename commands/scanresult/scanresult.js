
const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listScanResults  = function(scanId) {
    rengine.getScanResults(scanId)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listScanResults}

