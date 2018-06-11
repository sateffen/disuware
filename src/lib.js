const debug = require('debug')('disuware:lib');

const disuwareRunConfigSchema = require('./schemas/disuwarerunconfig');

const config = require('./modules/configuration');
const cluster = require('./modules/cluster');
const loader = require('./modules/loader');
const linker = require('./modules/linker');
const executor = require('./modules/executor');

/**
 * Runs a process with given configuration object
 * @param {string} aExecutionDir The directory, which represents the executiondirectory (where to resolve files from)
 * @param {Object} aConfigObject The config object for the process to run
 * @return {Promise}
 */
function run(aExecutionDir, aConfigObject) {
    return config.execute(aExecutionDir, aConfigObject, disuwareRunConfigSchema)
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
}

module.exports = {
    run,
};
