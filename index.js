#! /usr/bin/env node

const { program } = require('commander');
const { writeConf } = require('./commands/config/config');
const { listTargets } = require('./commands/target/target');
const { listSubdomains } = require('./commands/subdomain/subdomain');
const { listScans } = require('./commands/scan/scan');
const { listScanResults } = require('./commands/scanresult/scanresult');
const {listIPs} = require('./commands/ip/ip');
const { listEndpoints } = require('./commands/endpoint/endpoint');
const chalk = require('chalk');
const { CONFIG_FILE } = require('./const');


program
    .command('config')
    .description('Configure reNgine server connection parameters.')
    .action(writeConf);

const target = program.command('target');
target
    .command('list')
    .description('list targets')
    .action(listTargets);

const subdomain = program.command('subdomain');
subdomain
    .command('list')
    .description('list subdomains')
    .option('-s, --scan-id [value]', 'Get only for this scan. Can\'t be used with -t.')
    .option('-t, --target-id [value]', 'Get only for this target. Can\'t be used with -s.')
    .action(opts => {
        if (opts.scanId && opts.targetId) {
            console.log(chalk.yellow('Please specify either -s, -t, or none.'));
            process.exit(-1);
        }
        listSubdomains(opts.scanId, opts.targetId);
    } );

const scan = program.command('scan');
scan
    .command('list')
    .description('list scans')
    .option('-t, --target-id [value]', 'Get only for this target. Can\'t be used with -s.')
    .action(opts => {
        listScans(opts.targetId);
    } );

const scanresult = program.command('scanresult');
scanresult
    .command('list')
    .description('list scans results')
    .arguments('<scan-id>')
    .action(id => {
        listScanResults(id);
    });

const ip = program.command('ip');
ip
    .command('list')
    .description('list IPs')
    .action(listIPs);

const endpoint = program.command('endpoint');
endpoint
    .command('list')
    .description('list endpoints')
    .action(listEndpoints);


program.parse(process.argv);
