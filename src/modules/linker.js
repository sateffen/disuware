const debug = require('debug')('disuware:linker');
const semver = require('semver');

/**
 * This helper function helps sorting the packages by interface name
 * @param {Package} a
 * @param {Package} b
 * @return {number}
 */
function sortByInterface(a, b) {
    // first make the interfaces uppercase, so it's case independent
    const interfaceA = a.interface.toUpperCase();
    const interfaceB = b.interface.toUpperCase();

    // then return -1, 0, 1 depending on the sorting needs
    return interfaceA < interfaceB ? -1 : interfaceA > interfaceB ? 1 : 0;
}

/**
 * The linker reads the list of packages, that was loaded by the loader, and sorts them for the executor.
 * It'll sort the list of package descriptors in a way, that each following package requirements can be
 * fullfilled by the previously initialized packages
 * @param {Package[]} aDisuwarePackageDescriptorList A list of loaded packages, that should get linked
 * @return {Promise.<Package[]>} Resolves with a list of ordered packages
 */
function execute(aDisuwarePackageDescriptorList) {
    debug('Starting linker to determine the initialization list');

    // first setup the linked elements list and cache
    // the linkedElementsCache looks like {interfaceName1: ['version1', 'version2'], interfaceName2: ['version1']}
    const linkedElementsCache = {};
    const listOfLinkedElements = [];
    // then prepare the iterator lists. The disuware package descriptor list has to be sorted by the interface name,
    // so the interfaces itself will get initialized as group (if possible) as well. That way we can link the newest
    // package of each requirement later while initializing
    let listOfItemsToLink = aDisuwarePackageDescriptorList.sort(sortByInterface);
    let nextListOfItemsToLink = [];

    // and the flag for stuck linking. This flag is set to false for each iteration. If it's not set to true for an iteration
    // we know, that the lists didn't change in that iteration, so it's a deadlock.
    let linkedSomethingInTurn = false;

    while (listOfItemsToLink.length > 0) {
        for (let i = 0, iLen = listOfItemsToLink.length; i < iLen; i++) {
            // first we setup all data for the item
            const itemToLink = listOfItemsToLink[i];
            const requirements = Object.keys(itemToLink.requires);
            // and we assume the package is linkable. That way packages without requirements are linkable by default
            let linkable = true;

            if (Array.isArray(linkedElementsCache[itemToLink.interface]) && linkedElementsCache[itemToLink.interface].indexOf(itemToLink.version) > -1) {
                throw new Error(`Found package with same interface and same version already: ${itemToLink.interface}@${itemToLink.version}`);
            }

            // then we go for each requirement, as long as the package is still linkable
            for (let j = 0, jLen = requirements.length; j < jLen && linkable; j++) {
                // extract the data we need from the requirement
                const nameOfRequirement = requirements[j];
                const versionOfRequirement = itemToLink.requires[nameOfRequirement];

                // and if there is already something of the requirement linked, and some correct version is linked as well, this
                // requirement is fullfilled
                linkable = Array.isArray(linkedElementsCache[nameOfRequirement]) &&
                    linkedElementsCache[nameOfRequirement].some((aVersion) => semver.satisfies(aVersion, versionOfRequirement));
            }

            // if the previous iteration came to an end, we check whether the package is still linkable. It is still linkable
            // if all requirements are fulfilled. If it's linkable, we write it to the list of linked packages and the cache
            if (linkable === true) {
                debug(`Found linkable package ${itemToLink.interface}@${itemToLink.version}`);

                // we need to check whether the cache is already started. If it is we just append the version
                if (Array.isArray(linkedElementsCache[itemToLink.interface])) {
                    linkedElementsCache[itemToLink.interface].push(itemToLink.version);
                }
                // else we setup the cache list
                else {
                    linkedElementsCache[itemToLink.interface] = [itemToLink.version];
                }

                listOfLinkedElements.push(itemToLink);

                // don't forget to set deadlock flag to true to signal, that it's not a deadlock yet
                linkedSomethingInTurn = true;
            }
            // else we write the item to the list of items to process in the next turn
            else {
                nextListOfItemsToLink.push(itemToLink);
            }
        }

        // if the linker didn't link anything in this turn, we're in a deadlock, where nothing will change anymore. So we
        // have to break out by throwing an error
        if (linkedSomethingInTurn === false) {
            throw new Error('Found items that cant be linked: ' + listOfItemsToLink.map((aItem) => `${aItem.interface}@${aItem.version}`).join(', '));
        }
        // else something was linked, so we reset the list of items to link with the next list to link
        listOfItemsToLink = nextListOfItemsToLink;

        // and reset all iteration helpers for the next turn
        nextListOfItemsToLink = [];
        linkedSomethingInTurn = false;
    }

    // if we reached here, everything is linked and fine, so we can just return a resolved promise with the result
    return Promise.resolve(listOfLinkedElements);
}

module.exports = {
    execute,
};
