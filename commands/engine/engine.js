const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');


listEngines = function(name) {
    rengine.getEngines(name)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}


module.exports= {listEngines}

