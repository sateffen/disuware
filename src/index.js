const debug = require('debug')('disuware:main');
const commander = require('commander');
const pkg = require('../package.json');

debug('Start loading moduls');

const config = require('./configuration');
const cluster = require('./modules/cluster');
const loader = require('./modules/loader');
const linker = require('./modules/linker');
const executor = require('./modules/executor');

debug('Finished loading moduls');
debug('Start parsing process arguments');

commander
    .version(pkg.version)
    .description(pkg.description)
    .option('-c, --config <file>', 'The config file to use')
    .parse(process.argv);

debug('Finished parsing process arguments');
debug('Start executing disuware');

config.execute(commander.config)
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
