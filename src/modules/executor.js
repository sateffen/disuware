const debug = require('debug')('disuware:modules:executor');
const NodeModule = require('module');
const semver = require('semver');

/**
 * This is a map of node module-ids with their corresponding maps, where required interfaces are mapped
 * to the corresponding node module-ids
 * @type {Object}
 * @example {"nodeModuleId": {"disuware!interface": "realNodeModuleIdOfInterfaceInCorrectVersion"}}
 */
const moduleRequirementsResolveMap = {};

// here we apply a proxy to the require function, which traps the require call and alters the arguments if needed
NodeModule.prototype.require = new Proxy(NodeModule.prototype.require, {
    apply(aTarget, aThisContext, aArgumentsList) {
        // if the module name starts with "disuware!" it might be a module we can resolve
        if (aArgumentsList[0].substr(0, 9) === 'disuware!') {
            debug(`Searching for the correct context for module with id "${aThisContext.id}"`);
            // so first find the correct context for this require
            let contextModule = aThisContext;
            // by going up till there is no parent anymore
            while (aThisContext.parent) {
                contextModule = aThisContext.parent;
            }

            debug(`Found context module with id "${contextModule.id}"`);

            // if we actually found a context, and the module has a known resolve cache
            if (moduleRequirementsResolveMap[contextModule.id]) {
                debug(`Found requirements resolve cache for context "${contextModule.id}"`);

                // so search for the target module we want to load
                const targetModuleId = moduleRequirementsResolveMap[contextModule.id][aArgumentsList[0]];

                // if we found a target module
                if (typeof targetModuleId === 'string') {
                    debug(`Found module to resolve "${aArgumentsList[0]}" in context "${contextModule.id}"`);

                    // return it's exports
                    return require.cache[targetModuleId].exports;
                }
                // else we can't find anything fitting, to the original logic has to help out
                else {
                    debug(`Found no module to resolve "${aArgumentsList[0]}" in context "${contextModule.id}", passing back to node`);
                }
            }
        }

        // finally we do a call through, with whatever arguments list is there
        return Reflect.apply(aTarget, aThisContext, aArgumentsList);
    },
});

/**
 * Generates a map that links the modules requirements to the corresponding real modules
 * @param {Object} aRequirementResolveMap
 * @param {Object} aRequirements
 * @return {Object}
 */
function mGetRequirementsLinkMap(aRequirementResolveMap, aRequirements) {
    // first setup the linkmap and create an array of the required interfaces
    const linkMap = {};
    const requiredInterfaces = Object.keys(aRequirements);

    // then go for each interface and find the fitting module in the requirements resolve map
    for (let i = 0, iLen = requiredInterfaces.length; i < iLen; i++) {
        const neededInterface = requiredInterfaces[i];
        const neededVersion = aRequirements[neededInterface];

        const fittingModule = aRequirementResolveMap[neededInterface]
            .find((aDescription) => semver.satisfies(aDescription.version, neededVersion));

        linkMap['disuware!' + neededInterface] = fittingModule.resolvedPath;
    }

    return linkMap;
}

/**
 * Execute the executor
 * @param {DisuwareModule[]} aDisuwareModuleList The module list to execute. The modules will get initialized
 *                                               in order of the list
 * @return {Promise.<undefined>} A promise telling about the success (or fail) of initialization
 */
function execute(aDisuwareModuleList) {
    debug('Start executing all disuware modules');

    // we create a completetion promise, that is passed to the disuwareInit calls as well
    const completionPromise = new Promise((aResolve, aReject) => {
        // first we setup a promise pointer, that'll point to the next promise we can use for building our chain
        let promisePointer = Promise.resolve();
        const moduleInterfaceResolveCache = {};

        // go for each module, cache its resolve-path and then initialize it
        for (let i = 0, iLen = aDisuwareModuleList.length; i < iLen; i++) {
            // first cache the module pointer
            const moduleToInit = aDisuwareModuleList[i];

            // finally we append the promise chain for initializing the process with the next service
            promisePointer = promisePointer.then(() => {
                debug(`Loading module with interface ${moduleToInit.interface}@${moduleToInit.version}`);

                // first we setup the actual node module, that we wanna use
                const moduleNodeModule = new NodeModule(moduleToInit.resolvedPath);
                // then we generate a map to map all possible requires to real node module ids
                moduleRequirementsResolveMap[moduleToInit.resolvedPath] = mGetRequirementsLinkMap(moduleInterfaceResolveCache, moduleToInit.requires);
                // and write the module to the require cache
                require.cache[moduleToInit.resolvedPath] = moduleNodeModule;

                // when we actually load the module
                moduleNodeModule.load(moduleToInit.resolvedPath);

                // if there is already a list for this interface in the interface resolve cache
                if (Array.isArray(moduleInterfaceResolveCache[moduleToInit.interface])) {
                    // just push the new module
                    moduleInterfaceResolveCache[moduleToInit.interface].push(moduleToInit);
                    moduleInterfaceResolveCache[moduleToInit.interface] = moduleInterfaceResolveCache[moduleToInit.interface]
                        .sort((a, b) => semver.rcompare(a.version, b.version));
                }
                // else create the list
                else {
                    moduleInterfaceResolveCache[moduleToInit.interface] = [moduleToInit];
                }

                // if there is an disuware function in the module, we call it
                if (typeof moduleNodeModule.exports.__disuwareInit === 'function') {
                    debug(`Module with interface ${moduleToInit.interface}@${moduleToInit.version} has an __disuwareInit method, so call it`);

                    // and then call __disuwareInit
                    return moduleNodeModule.exports.__disuwareInit(completionPromise);
                }

                return null;
            });
        }

        // and after all modules got executed, apply the resolve or reject
        promisePointer
            .then(() => aResolve())
            .catch(() => aReject());
    });

    // and return it, so everything
    return completionPromise;
}

module.exports = {
    execute,
};
