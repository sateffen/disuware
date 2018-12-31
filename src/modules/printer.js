const debug = require('debug')('disuware:modules:printer');

/**
 * @param {DisuwareModule[]} aDisuwareModulsList A list of loaded modules, that should get printed
 * @param {boolean} aWithDependencies Whether the dependencies should be printed as well
 * @return {Promise.<DisuwareModule[]>} Resolves with a list of ordered modules
 */
function execute(aDisuwareModulsList, aWithDependencies) {
    debug('Start with printing module list');
    debug(`Should print dependencies: ${aWithDependencies}`);

    aDisuwareModulsList.forEach((aModule) => {
        // eslint-disable-next-line no-console
        console.log(`- ${aModule.interface}@${aModule.version}`);

        if (aWithDependencies === true && aModule.requires) {
            const requirements = Object.keys(aModule.requires);

            // eslint-disable-next-line no-console
            requirements.forEach((aRequirement) => console.log(`|- ${aRequirement}@${aModule.requires[aRequirement]}`));
        }
    });

    debug('Finished printing module list');
    return Promise.resolve(aDisuwareModulsList);
}

module.exports = {
    execute,
};
