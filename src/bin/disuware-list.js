#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const debug = require('debug')('disuware:bin:list');
const commander = require('commander');
const disuwareLibrary = require('../lib');

debug('Start parsing process arguments');

commander
    .usage('[options] <configFile>')
    .option('-l, --linked', 'Sort the list by linking for order of execution')
    .option('-d, --dependencies', 'Print the dependencies along')
    .parse(process.argv);

debug('Finished parsing process arguments');
debug('Start listing modules for disuware');

if (typeof commander.args[0] !== 'string') {
    throw new Error('disuware list needs a configuration file to find any modules');
}

const configFilePath = path.resolve(process.cwd(), commander.args[0]);
const configFileDir = path.dirname(configFilePath);

if (!fs.existsSync(configFilePath)) {
    throw new ReferenceError(`Given path to config-file does not exist: ${configFilePath}`);
}
// else config file exists, so load it
const configObject = require(configFilePath);
const commandLineFlags = {
    linked: commander.linked ? Boolean(commander.linked) : false,
    dependencies: commander.dependencies ? Boolean(commander.dependencies) : false,
};

disuwareLibrary.list(configFileDir, configObject, commandLineFlags);
