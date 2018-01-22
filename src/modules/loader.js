const debug = require('debug')('anyware:loader');
const pify = require('pify');
const fs = pify(require('fs'));
const path = require('path');
const anywarePackageSchema = require('../schemas/anywarepackage.json');
const Ajv = require('ajv');
const ajv = new Ajv();

const config = require('../configuration');
const Package = require('../models/package');

/**
 * Maps given files in the path to array representing the path and file stats
 * @param {string[]} aDirContent A list of content
 * @return {Promise.<Array[]>} Array of elements looking like [path, stats] for each file in packageDir
 */
function mMapDirContentToStatList(aDirContent) {
    debug('Start stating all files in the package dir');
    const packageDir = config.getKey('packageDir');

    const promiseList = aDirContent
        .map((aPath) => path.join(packageDir, aPath))
        .map((aPath) => fs.stat(aPath).then((aStat) => [aPath, aStat]));

    return Promise.all(promiseList)
        .then((aStatList) => {
            debug(`Finished stating all files in the package dir, found ${promiseList.length}`);

            return aStatList;
        });
}

/**
 * Maps given stat descriptors to the anyware package description files
 * @param {Array[]} aStatDescriptors Array of elements looking like [path, stats] for each file in packageDir
 * @return {Promise.<Array[]>} Array of elements looking like [path, anywarePackageJsonContent] for each file in packageDir
 */
function mMapStatListToActualAnywarePackageJsonFile(aStatDescriptors) {
    debug('Start mapping the stat-list to actual anywarepackage.json files');

    // first filter all non directories, and generate a list of promises checking the access on the anywarepackage.json
    // inside the directories
    const promiseList = aStatDescriptors
        // first filter all non directories
        .filter((aDescriptor) => aDescriptor[1].isDirectory())
        // then check if each of the packages has an anywarepackage.json file. If it has, we generate a descriptor
        // array consisting of the path and the anywarepackage.json contents. Else we log a warning
        .map((aDescriptor) => {
            const packageFile = path.join(aDescriptor[0], './anywarepackage.json');

            return fs.access(packageFile, fs.constants.R_OK)
                .then(() => [packageFile, aDescriptor[0]])
                .catch(() => null);
        });

    // then wait for the directory anywarepackage.json checks
    return Promise.all(promiseList)
        // then filter out all entries, where we can't find an anywarepackage.json file and map the entries to arrays
        // in the required form of [path, anywarePackageJsonContent]
        .then((aAnywarePackageAccessAllowedList) => Promise.all(
            aAnywarePackageAccessAllowedList
                .filter(Array.isArray)
                .map((aDescriptor) => fs.readFile(aDescriptor[0])
                    .then((aPackageContent) => [aDescriptor[1], JSON.parse(aPackageContent.toString())]))))
        .then((aAnywarePackageJsonFileDescriptors) => {
            debug('Finished mapping the stat-list to actual anywarepackage.json files');

            return aAnywarePackageJsonFileDescriptors;
        });
}

/**
 * Maps the anyware package description files to actual package models
 * @param {Array[]} aAnywarePackageJsonFileDescriptors
 * @return {Package[]} Array of elements looking like [path, anywarePackageJsonContent] for each package in packageDir
 */
function mMapActualAnywarePackagesJsonFileToActualPackageDescription(aAnywarePackageJsonFileDescriptors) {
    debug('Start mapping anywarepackage.json files to actual anyware packages');

    const resultingPackages = aAnywarePackageJsonFileDescriptors
        .filter(Array.isArray)
        .map((aDescriptor) => {
            // first extract the values we need from the descriptor
            const descriptorPath = aDescriptor[0];
            const descriptorJson = aDescriptor[1];

            if (descriptorJson.disabled) {
                return null;
            }

            // then validate the descriptors
            const valid = ajv.validate(anywarePackageSchema, descriptorJson);

            if (!valid) {
                throw new Error(`Anyware package description for ${descriptorPath} is invalid: ${ajv.errorsText()}`);
            }

            // and if we reach here, the assertions hold true, so we build a package description of this
            const pkg = new Package();

            pkg.path = descriptorPath;
            pkg.resolvedPath = require.resolve(descriptorPath);
            pkg.interface = descriptorJson.interface;
            pkg.version = descriptorJson.version;
            pkg.requires = descriptorJson.requires || {};

            // and finally return the package, so we can work with it
            return pkg;
        })
        .filter((aPackage) => aPackage !== null);

    debug('Finished mapping anywarepackage.json files to actual anyware packages');

    return resultingPackages;
}

/**
 * Executes the loader and loads all packages in the packageDir
 * @return {Promise.<Package[]>} A list of loaded packages
 */
function execute() {
    debug('Start executing the loader');
    const packageDir = config.getKey('packageDir');

    // first we read the directories files
    return fs.readdir(packageDir)
        // then we go for the content, grabbing the stat description for each, and generating an array with path and stats
        .then(mMapDirContentToStatList)
        // now we filter the descriptors and convert them in loaded <path>/anywarepackage.json contents.
        .then(mMapStatListToActualAnywarePackageJsonFile)
        // then filter down the array of descriptors. All descriptors are arrays, so filter for arrays
        .then(mMapActualAnywarePackagesJsonFileToActualPackageDescription)
        .then((aPackageList) => {
            debug('Finished executing the loaded');

            return aPackageList;
        });
}

module.exports = {
    execute,
};
