
const rengine = require('../../core/rengine');
const util = require('./../../utils');
const chalk = require('chalk');

listScans  = function(targetId) {
    rengine.getScans(targetId)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listScans}

