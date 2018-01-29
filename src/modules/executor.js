const debug = require('debug')('disuware:executor');
const NodeModule = require('module');
const semver = require('semver');

const config = require('../configuration');

/**
 * This is a map of node module-ids with their corresponding maps, where required interfaces are mapped
 * to the corresponding node module-ids
 * @type {Object}
 */
const pkgRequirementsResolveMap = {};

// here we apply a proxy to the require function, which traps the require call and alters the arguments if needed
NodeModule.prototype.require = new Proxy(NodeModule.prototype.require, {
    apply(aTarget, aThisContext, aArgumentsList) {
        // if the module name starts with "disuware!" it might be a package we can resolve
        if (aArgumentsList[0].indexOf('disuware!') === 0) {
            debug(`Searching for the correct context for module with id "${aThisContext.id}"`);
            // so first find the correct context for this require
            let contextModule = aThisContext;
            // by going up till there is no parent anymore
            while (aThisContext.parent) {
                contextModule = aThisContext.parent;
            }

            debug(`Found context module with id "${contextModule.id}"`);

            // if we actually found a context, and the package has a known resolve cache
            if (pkgRequirementsResolveMap[contextModule.id]) {
                debug(`Found requirements resolve cache for context "${contextModule.id}"`);

                // so search for the target module we want to load
                const targetModuleId = pkgRequirementsResolveMap[contextModule.id][aArgumentsList[0]];

                // if we found a target module
                if (typeof targetModuleId === 'string') {
                    debug(`Found package to resolve "${aArgumentsList[0]}" in context "${contextModule.id}"`);

                    // return it's exports
                    return require.cache[targetModuleId].exports;
                }
                // else we can't find anything fitting, to the original logic has to help out
                else {
                    debug(`Found no package to resolve "${aArgumentsList[0]}" in context "${contextModule.id}", passing back to node`);
                }
            }
        }

        // finally we do a call through, with whatever arguments list is there
        return Reflect.apply(aTarget, aThisContext, aArgumentsList);
    },
});

/**
 * Generates a map that links the packages requirements to the corresponding modules
 * @param {Object} aRequirementResolveMap
 * @param {Object} aRequirements
 * @return {Object}
 */
function mGetRequirementsLinkMap(aRequirementResolveMap, aRequirements) {
    // first setup the linkmap and create an array of the required interfaces
    const linkMap = {};
    const requiredInterfaces = Object.keys(aRequirements);

    // then go for each interface and find the fitting package in the requirements resolve map
    for (let i = 0, iLen = requiredInterfaces.length; i < iLen; i++) {
        const neededInterface = requiredInterfaces[i];
        const neededVersion = aRequirements[neededInterface];

        const fittingPkg = aRequirementResolveMap[neededInterface]
            .find((aDescription) => semver.satisfies(aDescription.version, neededVersion));

        linkMap['disuware!' + neededInterface] = fittingPkg.resolvedPath;
    }

    return linkMap;
}

/**
 * Execute the executor
 * @param {Package[]} aPackageList The package list to execute. The packages will get initialized
 *                                 in order of the list
 * @return {Promise.<undefined>} A promise telling about the success (or fail) of initialization
 */
function execute(aPackageList) {
    debug('Start executing all disuware packages');

    // first we setup a promise pointer, that'll point to the next promise we can use for building our chain
    let promisePointer = Promise.resolve();
    const generalConfig = config.getConfigPointer();
    const pkgInterfaceResolveCache = {};

    // go for each package, cache its resolve-path and then initialize it
    for (let i = 0, iLen = aPackageList.length; i < iLen; i++) {
        // first cache the package pointer
        const pkgToInit = aPackageList[i];

        // finally we append the promise chain for initializing the process with the next service
        promisePointer = promisePointer.then(() => {
            debug(`Loading module with interface ${pkgToInit.interface}@${pkgToInit.version}`);

            // first we setup the actual node module, that we wanna use
            const pkgModule = new NodeModule(pkgToInit.resolvedPath);
            // then we generate a map to map all possible requires to real node module ids
            pkgRequirementsResolveMap[pkgToInit.resolvedPath] = mGetRequirementsLinkMap(pkgInterfaceResolveCache, pkgToInit.requires);
            // and write the package to the require cache
            require.cache[pkgToInit.resolvedPath] = pkgModule;

            // when we actually load the module
            pkgModule.load(pkgToInit.resolvedPath);

            // if there is already a list for this interface in the interface resolve cache
            if (Array.isArray(pkgInterfaceResolveCache[pkgToInit.interface])) {
                // just push the new pkg
                pkgInterfaceResolveCache[pkgToInit.interface].push(pkgToInit);
                pkgInterfaceResolveCache[pkgToInit.interface] = pkgInterfaceResolveCache[pkgToInit.interface]
                    .sort((a, b) => semver.rcompare(a.version, b.version));
            }
            // else create the list
            else {
                pkgInterfaceResolveCache[pkgToInit.interface] = [pkgToInit];
            }

            // if there is an disuware function in the package, we call it
            if (typeof pkgModule.exports.__disuwareInit === 'function') {
                debug(`Package with interface ${pkgToInit.interface}@${pkgToInit.version} has an __disuwareInit method, so call it`);

                // and then call __disuwareInit
                return pkgModule.exports.__disuwareInit(generalConfig);
            }

            return null;
        });
    }

    // finally we return the promise pointer, because it'll tell when the application is ready
    return promisePointer;
}

module.exports = {
    execute,
};
