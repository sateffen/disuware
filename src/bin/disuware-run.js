#!/usr/bin/env node
const debug = require('debug')('disuware:bin:run');
const commander = require('commander');
const disuwareRunConfigSchema = require('../schemas/disuwarerunconfig');

debug('Start loading moduls');

const config = require('../modules/configuration');
const cluster = require('../modules/cluster');
const loader = require('../modules/loader');
const linker = require('../modules/linker');
const executor = require('../modules/executor');

debug('Finished loading moduls');
debug('Start parsing process arguments');

commander
    .usage('[options] <configFile>')
    .parse(process.argv);

debug('Finished parsing process arguments');
debug('Start executing disuware');

if (typeof commander.args[0] !== 'string') {
    throw new Error('disuware run needs a configuration file to run');
}

config.execute(commander.args[0], disuwareRunConfigSchema)
    .then(cluster.execute)
    .then(loader.execute)
    .then(linker.execute)
    .then(executor.execute)
    .then(() => debug('Finished executing disuware, everything should be up and running'))
    .catch((aPotentialError) => {
        if (aPotentialError !== null) {
            // eslint-disable-next-line no-console
            console.error(aPotentialError);
        }
        // else we're in cluster mode, so everything is fine
    });
