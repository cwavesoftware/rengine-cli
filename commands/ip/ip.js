
const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');

listIPs  = function(scanId, targetId, port) {
    rengine.getIPs(scanId, targetId, port)
    .then(({resp, err}) => {
        if (err) {
            console.error(chalk.red('err'));
        } else {
            util.prettyprint(resp);
        }
    });
}

module.exports= {listIPs}

