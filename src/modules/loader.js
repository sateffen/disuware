const debug = require('debug')('disuware:modules:loader');
const util = require('util');
const fs = require('fs');
const path = require('path');
const disuwareJsonSchema = require('../schemas/disuwarejson.json');
const Ajv = require('ajv');
const ajv = new Ajv();

const config = require('./configuration');
const DisuwareModule = require('../models/disuwaremodule');

/**
 * Generates a modules stats list, based on moduleDirs
 * @return {Promise.<Array[]>} Array of elements looking like [path, stats] for each file in moduleDirs
 */
function mGenerateModulesStatList() {
    debug('Started generating module dirs stats lists');
    const moduleDirs = config
        .getKey('moduleDirs')
        .map(config.resolveByExecutionDir);

    return Promise
        .all(moduleDirs.map((aDir) => util.promisify(fs.readdir)(aDir)))
        .then((aDirContents) => aDirContents
            .map((aDirContent, aIndex) => aDirContent
                .map((aPath) => path.join(moduleDirs[aIndex], aPath))
                .map((aPath) => util.promisify(fs.stat)(aPath).then((aStat) => [aPath, aStat])))
        )
        // flatten the arrays and wait till all are resolved
        .then((aStatPromises) => Promise.all(Array.prototype.concat.apply([], aStatPromises)))
        .then((aStatListsArray) => {
            debug(`Finished stating all files in module dirs, found ${aStatListsArray.length} files/dirs`);

            return aStatListsArray;
        });
}

/**
 * Maps given stat descriptors to the disuware module description files
 * @param {Array[]} aStatDescriptors Array of elements looking like [path, stats] for each file in moduleDirs
 * @return {Promise.<Array[]>} Array of elements looking like [path, disuwareJsonContent] for each file in moduleDirs
 */
function mMapStatListToActualDisuwareJsonFiles(aStatDescriptors) {
    debug('Start mapping the stat-list to actual disuware.json files');

    // first filter all non directories, and generate a list of promises checking the access on the disuware.json
    // inside the directories
    const promiseList = aStatDescriptors
    // first filter all non directories
        .filter((aDescriptor) => aDescriptor[1].isDirectory())
        // then check if each of the module has an disuware.json file. If it has, we generate a descriptor
        // array consisting of the path and the disuware.json contents. Else we log a warning
        .map((aDescriptor) => {
            const moduleFile = path.join(aDescriptor[0], './disuware.json');

            return util.promisify(fs.access)(moduleFile, fs.constants.R_OK)
                .then(() => [moduleFile, aDescriptor[0]])
                .catch(() => null);
        });

    // then wait for the directory disuware.json checks
    return Promise.all(promiseList)
    // then filter out all entries, where we can't find an disuware.json file and map the entries to arrays
    // in the required form of [path, disuwareJsonContent]
        .then((aDisuwareJsonAccessAllowedList) => Promise.all(
            aDisuwareJsonAccessAllowedList
                .filter(Array.isArray)
                .map((aDescriptor) => util.promisify(fs.readFile)(aDescriptor[0])
                    .then((aModuleContent) => [aDescriptor[1], JSON.parse(aModuleContent.toString())]))))
        .then((aDisuwareJsonFileDescriptors) => {
            debug('Finished mapping the stat-list to actual disuware.json files');

            return aDisuwareJsonFileDescriptors;
        });
}

/**
 * Maps the disuware module description files to actual DisuwareModule models
 * @param {Array[]} aDisuwareJsonFileDescriptors
 * @return {DisuwareModule[]} Array of elements looking like [path, disuwareJsonContent] for each module in all moduleDirs
 */
function mMapActualDisuwareJsonFilesToActualModuleDescription(aDisuwareJsonFileDescriptors) {
    debug('Start mapping disuware.json files to actual disuware modules');

    const resultingModules = aDisuwareJsonFileDescriptors
        .filter(Array.isArray)
        .map((aDescriptor) => {
            // first extract the values we need from the descriptor
            const descriptorPath = aDescriptor[0];
            const descriptorJson = aDescriptor[1];

            if (descriptorJson.disabled) {
                return null;
            }

            // then validate the descriptors
            const valid = ajv.validate(disuwareJsonSchema, descriptorJson);

            if (!valid) {
                throw new Error(`Disuware module description for ${descriptorPath} is invalid: ${ajv.errorsText()}`);
            }

            // and if we reach here, the assertions hold true, so we build a module description of this
            const mod = new DisuwareModule();

            mod.path = descriptorPath;
            mod.resolvedPath = require.resolve(descriptorPath);
            mod.interface = descriptorJson.interface;
            mod.version = descriptorJson.version;
            mod.requires = descriptorJson.requires || {};

            // and finally return the module, so we can work with it
            return mod;
        })
        .filter((aModule) => aModule !== null);

    debug('Finished mapping disuware.json files to actual disuware modules');

    return resultingModules;
}

/**
 * Executes the loader and loads all modules in the moduleDirs
 * @return {Promise.<DisuwareModule[]>} A list of loaded modules
 */
function execute() {
    debug('Start executing the loader');

    // first we read the directories files
    return mGenerateModulesStatList()
    // now we filter the descriptors and convert them in loaded <path>/disuware.json contents.
        .then(mMapStatListToActualDisuwareJsonFiles)
        // then filter down the array of descriptors. All descriptors are arrays, so filter for arrays
        .then(mMapActualDisuwareJsonFilesToActualModuleDescription)
        .then((aDisuwareList) => {
            debug('Finished executing the loaded');

            return aDisuwareList;
        });
}

module.exports = {
    execute,
};
