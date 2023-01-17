const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');


listEndpoints  = function(scanId, targetId) {
    rengine.getEndpoints(scanId, targetId)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listEndpoints}

