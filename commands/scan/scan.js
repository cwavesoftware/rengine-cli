
const rengine = require('../../core/rengine');
const util = require('./../../utils');
const chalk = require('chalk');

listScans = function(targetId, targetName) {
    rengine.getScans(targetId, targetName)
    .then((resp) => {
        util.prettyprint(resp);
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

triggerScan = function(name, engine, subsFile) {
    rengine.getTargets(null, name)
    .then(resp => {
        if (resp && resp.length) {
            const tid = resp[0].id;
            rengine.getEngines(engine)
            .then(resp => {
                if (resp && resp.length){
                    eid = resp[0].id;
                    rengine.triggerScan(tid, eid, subsFile)
                    .then(resp => {
                        process.exit(0);
                    },
                    (error) => {
                        process.stderr.write(chalk.red(error.message));
                        process.exit(-1);
                    })
                } else {
                    console.error(chalk.red(`Scan engine ${engine} not found`));
                    process.exit(-1);
                }
            },
            (error) => {
                process.stderr.write(chalk.red(error.message));
                process.exit(-1);
            })
        } else {
            console.error(chalk.red(`Target ${name} not found`));
            process.exit(-1);
        }
    },
    (error) => {
        process.stderr.write(chalk.red(error.message));
        process.exit(-1);
    });
}

module.exports= {listScans, triggerScan}

