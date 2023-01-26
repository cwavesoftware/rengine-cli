#! /usr/bin/env node
const { program } = require('commander');
const { writeConf } = require('./commands/config/config');
const { listTargets, createTarget } = require('./commands/target/target');
const { listSubdomains } = require('./commands/subdomain/subdomain');
const { listScans, triggerScan } = require('./commands/scan/scan');
const { listScanResults } = require('./commands/scanresult/scanresult');
const { listIPs } = require('./commands/ip/ip');
const { listEndpoints } = require('./commands/endpoint/endpoint');
const { listOrgs, createOrg } = require('./commands/org/org');
const {listEngines} = require('./commands/engine/engine')
const {login} = require('./core/rengine');
const chalk = require('chalk');
var pkg = require("./package.json");


processProgOptions = function (program) {
    const progOpts = program.opts();
    if (global.client)
        global.client.defaults.timeout = progOpts.timeout;

    if (progOpts.insecure)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

program.version(pkg.version);
program
    .command('config')
    .description('Configure reNgine server connection parameters')
    .action(writeConf);

program
    .option('-k, --insecure', 'Allow insecure server connections when using SSL', false)
    .option('-T, --timeout <value>', 'Milliseconds to wait for response from server', 5000)

const target = program.command('target');
target
    .command('list')
    .description('list targets')
    .option('-ti, --target-id [value]', 'Get the target with this ID\nCan\'t be used with -tn')
    .option('-tn, --target-name [value]', 'Get the target with this ID\nCan\'t be used with -ti')
    .action((opts)=>{
        if (opts.targetId && opts.targetName ) {
            console.log(chalk.yellow('Please specify either -ti, -tn or none'));
            process.exit(-1);
        }
        processProgOptions(program);
        listTargets(opts.targetId, opts.targetName);
    });
target
    .command('create')
    .description('create a new target')
    .argument('<target-name>', 'Name of the new target', )
    .argument('[target-description]', 'Description of the new target')
    .argument('[target-h1-handler]', 'HackerOne handle')
    .action((name, desc, h1handle) => {
        processProgOptions(program);
        createTarget(name, desc, h1handle);
    } );

const subdomain = program.command('subdomain');
subdomain
    .command('list')
    .description('list subdomains')
    .option('-s, --scan-id [value]', 'Get only for this scan\nCan\'t be used with -t nor -tn')
    .option('-ti, --target-id [value]', 'Get only for this target\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target\nCan\'t be used with -s nor -ti')
    .action(opts => {
        if (opts.scanId && opts.targetId || opts.scanId && opts.targetName || opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, -tn or none'));
            process.exit(-1);
        }
        processProgOptions(program);
        listSubdomains(opts.scanId, opts.targetId, opts.targetName);
    } );

const scan = program.command('scan');
scan
    .command('list')
    .description('list scans')
    .option('-ti, --target-id [value]', 'Get only for this target\nCan\'t be used with -tn')
    .option('-tn, --target-name [value]', 'Get only for this target\nCan\'t be used with -ti')
    .action(opts => {
        if (opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -t, -tn or none'));
            process.exit(-1);
        }
        processProgOptions(program);
        listScans(opts.targetId, opts.targetName);
    } );
scan
    .command('trigger')
    .description('trigger a new scan')
    .argument('<target>', 'Target name to be scanned')
    .argument('<engine>', 'Engine name to be used for the scan')
    .argument('[subdomains-file]', 'Filename containing subdomains to be imported\nSeparate the subdomains using new line\nIf the subdomain does not belong to target, it will be skipped')
    .action((target, engine, subsFile) => {
        processProgOptions(program);
        triggerScan(target, engine, subsFile);
    } );

const scanresult = program.command('scanresult');
scanresult
    .command('list')
    .description('list scans results')
    .argument('<scan-id>')
    .action(id => {
        processProgOptions(program);
        listScanResults(id);
    });

const ip = program.command('ip');
ip
    .command('list')
    .description('list IPs')
    .option('-s, --scan-id [value]', 'Get only for this scan\nCan\'t be used with -ti nor -tn')
    .option('-ti, --target-id [value]', 'Get only for this target\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target\nCan\'t be used with -s nor -ti')
    .option('-p, --port [value]', 'Get only IPs with this port open')
    .action(cmdOpts => {
        if (cmdOpts.scanId && cmdOpts.targetId || cmdOpts.scanId && cmdOpts.targetName || cmdOpts.targetId && cmdOpts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, or none'));
            process.exit(-1);
        }
        processProgOptions(program);
        listIPs(cmdOpts.scanId, cmdOpts.targetId, cmdOpts.targetName, cmdOpts.port);
    } );

const endpoint = program.command('endpoint');
endpoint
    .command('list')
    .description('list endpoints')
    .option('-s, --scan-id [value]', 'Get only for this scan\nCan\'t be used with -ti nor -tn')
    .option('-ti, --target-id [value]', 'Get only for this target\nCan\'t be used with -s nor -tn')
    .option('-tn, --target-name [value]', 'Get only for this target\nCan\'t be used with -s nor -ti')
    .action(opts => {
        if (opts.scanId && opts.targetId || opts.scanId && opts.targetName || opts.targetId && opts.targetName) {
            console.log(chalk.yellow('Please specify either -s, -t, -tn or none'));
            process.exit(-1);
        }
        processProgOptions(program);
        listEndpoints(opts.scanId, opts.targetId, opts.targetName);
    } );

const org = program.command('org');
org
    .command('list')
    .description('list organizations')
    .option('-on, --org-name [value]', 'Get only for this organization')
    .action(opts => {
        processProgOptions(program);
        listOrgs(opts.orgName);
    } );

org
    .command('create')
    .description('create a new organizations')
    .argument('<org-name>', 'Name of the organization', )
    .argument('[org-description]', 'Description of the organization')

    .action((name, desc) => {
        processProgOptions(program);
        createOrg(name, desc);
    } );

const engine = program.command('engine');
engine
    .command('list')
    .description('list engines')
    .option('-en, --engine-name [value]', 'Get the engine with this name')
    .action((opts)=>{
        processProgOptions(program);
        listEngines(opts.engineName);
    });

program.command('login')
.description('login to reNgine server\nUsed mainly for testing configuration')
.action(login)

program.parse(process.argv);


