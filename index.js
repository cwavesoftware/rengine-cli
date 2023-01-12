#! /usr/bin/env node

const { program } = require('commander')
const { listTargets } = require('./commands/target/target')
const { writeConf } = require('./commands/config/config')

const target = program.command('target');
target
    .command('list')
    .description('list targets')
    .action(listTargets);

program
    .command('config')
    .description('Configure reNgine server connection parameters')
    .action(writeConf);


program.parse()