#! /usr/bin/env node

const { program } = require('commander')
const { writeConf } = require('./commands/config/config')
const { listTargets } = require('./commands/target/target')
const { listSubdomains } = require('./commands/subdomain/subdomain')

program
    .command('config')
    .description('Configure reNgine server connection parameters')
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
    .action(listSubdomains);


program.parse()