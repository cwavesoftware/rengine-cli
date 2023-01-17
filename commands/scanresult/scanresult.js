
const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listScanResults  = function(scanId) {
    rengine.getScanResults(scanId)
    .then(({resp, err}) => {
        if (err) {
            console.error(chalk.red('err'));
        } else {
            util.prettyprint(resp);
        }
    })
}

module.exports= {listScanResults}

