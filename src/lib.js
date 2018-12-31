const debug = require('debug')('disuware:lib');

const disuwareRunConfigSchema = require('./schemas/disuwarerunconfig');

const config = require('./modules/configuration');
const cluster = require('./modules/cluster');
const loader = require('./modules/loader');
const linker = require('./modules/linker');
const executor = require('./modules/executor');
const printer = require('./modules/printer');

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

/**
 * Lists all found modules for given configuration and prints it to the console
 * @param {string} aExecutionDir The directory, which represents the executiondirectory (where to resolve files from)
 * @param {Object} aConfigObject The config object for the process to use
 * @param {Object} aCommandLineFlags An object containing the command line flags, that format the output
 * @return {Promise}
 */
function list(aExecutionDir, aConfigObject, aCommandLineFlags) {
    let executionChain = config.execute(aExecutionDir, aConfigObject, disuwareRunConfigSchema)
        .then(loader.execute);

    if (aCommandLineFlags.linked === true) {
        debug('Should execute linker as well');
        executionChain = executionChain.then(linker.execute);
    }

    return executionChain
        .then((aDisuwareModuleList) => printer.execute(aDisuwareModuleList, aCommandLineFlags.dependencies))
        // eslint-disable-next-line no-console
        .catch((aError) => console.error(aError));
}

module.exports = {
    run,
    list,
};
