#!/usr/bin/env node
const debug = require('debug')('disuware:bin');
const commander = require('commander');
const pkg = require('../../package.json');

debug('Start parsing process arguments');

commander
    .version(pkg.version)
    .description(pkg.description)
    .command('run <configFile>', 'Executes given configuration and starts the application')
    .command('list <configFile>', 'Lists all found modules for given config')
    .parse(process.argv);

debug('Finished parsing process arguments');
