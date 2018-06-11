#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const debug = require('debug')('disuware:bin:run');
const commander = require('commander');
const disuwareLibrary = require('../lib');

debug('Start parsing process arguments');

commander
    .usage('[options] <configFile>')
    .parse(process.argv);

debug('Finished parsing process arguments');
debug('Start executing disuware');

if (typeof commander.args[0] !== 'string') {
    throw new Error('disuware run needs a configuration file to run');
}

const configFilePath = path.resolve(process.cwd(), commander.args[0]);
const configFileDir = path.dirname(configFilePath);

if (!fs.existsSync(configFilePath)) {
    throw new ReferenceError(`Given path to config-file does not exist: ${configFilePath}`);
}
// else config file exists, so load it
const configObject = require(configFilePath);

disuwareLibrary.run(configFileDir, configObject);
