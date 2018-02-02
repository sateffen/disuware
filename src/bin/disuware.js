#!/usr/bin/env node
const debug = require('debug')('disuware:bin');
const commander = require('commander');
const pkg = require('../../package.json');

debug('Start parsing process arguments');

commander
    .version(pkg.version)
    .description(pkg.description)
    .command('run <configFile>', 'Executes given configuration')
    .parse(process.argv);

debug('Finished parsing process arguments');
