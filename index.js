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


program
    .command('config')
    .description('Configure reNgine server connection parameters')
    .action(writeConf);

program
    .option('-k, --insecure', 'Allow insecure server connections when using SSL', false)

const target = program.command('target');
target
    .command('list')
    .description('list targets')
    .action(listTargets);

const subdomain = program.command('subdomain');
subdomain
    .command('list')
    .description('list subdomains')
    .option('-s, --scan-id [value]', 'Get only for this scan.\nCan\'t be used with -t nor -tn')
    .option('-t, --target-id [value]', 'Get only for this target.\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target.\nCan\'t be used with -s nor -t')
    .action(opts => {
        if (opts.scanId && opts.targetId || opts.scanId && opts.targetName || opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, -tn or none'));
            process.exit(-1);
        }
        listSubdomains(opts.scanId, opts.targetId, opts.targetName);
    } );

const scan = program.command('scan');
scan
    .command('list')
    .description('list scans')
    .option('-t, --target-id [value]', 'Get only for this target.\nCan\'t be used with -tn')
    .option('-tn, --target-name [value]', 'Get only for this target.\nCan\'t be used with -t')
    .action(opts => {
        listScans(opts.targetId, opts.targetName);
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
    .option('-s, --scan-id [value]', 'Get only for this scan.\nCan\'t be used with -t nor -tn')
    .option('-t, --target-id [value]', 'Get only for this target.\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target.\nCan\'t be used with -s nor -t')
    .option('-p, --port [value]', 'Get only IPs with this port open')
    .action(opts => {
        if (opts.scanId && opts.targetId || opts.scanId && opts.targetName || opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, or none'));
            process.exit(-1);
        }
        listIPs(opts.scanId, opts.targetId, opts.targetName, opts.port);
    } );

const endpoint = program.command('endpoint');
endpoint
    .command('list')
    .description('list endpoints')
    .option('-s, --scan-id [value]', 'Get only for this scan.\nCan\'t be used with -t nor -tn')
    .option('-t, --target-id [value]', 'Get only for this target.\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target.\nCan\'t be used with -s nor -t')
    .action(opts => {
        if (opts.scanId && opts.targetId || opts.scanId && opts.targetName || opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, -tn or none'));
            process.exit(-1);
        }
        listEndpoints(opts.scanId, opts.targetId, opts.targetName);
    } );


program.parse(process.argv);

const options = program.opts();
if (options.insecure)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';