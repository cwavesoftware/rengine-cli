#! /usr/bin/env node

const { program } = require('commander')
const { listTargets } = require('./commands/target/target')

const target = program.command('target');
target
    .command('list')
    .description('List targets')
    .action(listTargets)



    program.parse()