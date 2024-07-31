const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');


listSubdomains = function(scanId, targetId, targetName) {
  rengine.getSubdomains(scanId, targetId, targetName)
    .then((resp) => {
      util.prettyprint(resp);
    },
      (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
      });
}

listNewSubdomains = function(scanId) {
  rengine.getNewSubdomains(scanId)
    .then((resp) => {
      util.prettyprint(resp.new_subs);
    },
      (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
      });
}
module.exports = { listSubdomains, listNewSubdomains }

