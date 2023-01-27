const chalk = require('chalk');
const rengine = require('../../core/rengine');
const util = require('./../../utils');


listOrgs  = function(orgName) {
    rengine.getOrgs(orgName)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

createOrg  = function(orgName, orgDescription) {
    rengine.createOrg(orgName, orgDescription)
    .then((resp) => {
        process.exit(0);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

addTarget = function(orgName, targetName) {
    rengine.getOrgs(orgName)
    .then(orgs =>{
        const oid = orgs[0].id;
        rengine.getTargets(null, targetName)
        .then(targets => {
            const tid = targets[0].id;
            rengine.addTargetToOrg(tid, oid)
            .then(resp => {
                process.exit(0);
            }, (error) => {
                process.stderr.write(chalk.red(error.message));
                process.exit(-1);
            })
        }, (error) => {
            process.stderr.write(chalk.red(error.message));
            process.exit(-1);
        });
    }, (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listOrgs, createOrg, addTarget}

