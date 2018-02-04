const debug = require('debug')('disuware:modules:cluster');
const os = require('os');
const cluster = require('cluster');

const config = require('./configuration');

/**
 * Sets up a cluster of processes if configured
 * @return {Promise.<undefined>} A promise telling about the success (or fail) of cluster initialization
 */
function execute() {
    debug('Start determining the cluster configuration');
    const clusterConfig = config.getKey('cluster');

    // if there is a cluster config, and we're the master, we can actually do something
    if (typeof clusterConfig === 'object' && cluster.isMaster) {
        debug('Found cluster configuration, starting to evaluate it');

        if (typeof clusterConfig.mode === 'number') {
            // determine the num of processes to spawn
            const forkCount = clusterConfig.mode === 0 ? os.cpus().length : clusterConfig.mode;

            debug(`Starting ${forkCount} workers`);

            // and create all workers
            for (let i = 0; i < forkCount; i++) {
                cluster.fork();
                debug(`Started worker number ${i}`);
            }

            debug(`Finished starting ${forkCount} workers`);

            return Promise.reject(null);
        }
    }
    // else no clustering
    debug('No clustering required or in worker process');

    return Promise.resolve();
}

module.exports = {
    execute,
};
