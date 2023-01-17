
const rengine = require('../../core/rengine');
const util = require('./../../utils');
const chalk = require('chalk');

listScans  = function(targetId) {
    rengine.getScans(targetId)
    .then(({resp, err}) => {
        if (err) {
            process.stderr.write(chalk.red('err'));
        } else {
            util.prettyprint(resp);
        }
    })
}

module.exports= {listScans}

