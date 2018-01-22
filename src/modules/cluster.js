const debug = require('debug')('anyware:cluster');
const os = require('os');
const cluster = require('cluster');

const config = require('../configuration');

/**
 * Sets up a cluster of processes if configured
 * @return {Promise.<undefined>} A promise telling about the success (or fail) of cluster initialization
 */
function execute() {
    debug('Start determining the cluster configuration');
    const clusterMode = config.getKey('clusterMode');

    // if the clusterMode is actually given and we're the master
    if (typeof clusterMode === 'number' && cluster.isMaster) {
        // determine the num of processes
        const forkCount = clusterMode === 0 ? os.cpus().length : clusterMode;

        debug(`Starting ${forkCount} workers`);

        // and create all workers
        for (let i = 0; i < forkCount; i++) {
            cluster.fork();
        }

        debug(`Finished starting ${forkCount} workers`);

        return Promise.reject(null);
    }
    // else no clustering
    debug('No clustering required or in worker process');

    return Promise.resolve();
}

module.exports = {
    execute,
};
