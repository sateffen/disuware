const debug = require('debug')('disuware:modules:configuration');
const path = require('path');
const Ajv = require('ajv');

/**
 * The local ajv validator object
 * @type {ajv | ajv.Ajv}
 */
const ajv = new Ajv();

/**
 * A string telling the execution directory. Used for later resolves
 * @type {string|null}
 */
let executionDir = null;

/**
 * A pointer to the config object
 * @type {Object|null}
 */
let configPointer = null;

/**
 * Executes loading the config
 * @param {string} aExecutionDirectory
 * @param {Object} aConfigObject The config object to use for this run
 * @param {Object} aConfigSchema The config file schema description
 * @return {Promise.<undefined>} A promise telling about the success loading the config
 */
function execute(aExecutionDirectory, aConfigObject, aConfigSchema) {
    debug('Start executing config validator');

    if (typeof aExecutionDirectory !== 'string') {
        throw new TypeError('Disuware configuration got called with a invalid execution directory');
    }

    executionDir = aExecutionDirectory;
    configPointer = aConfigObject;

    debug('Start validating the configuration');

    const valid = ajv.validate(aConfigSchema, configPointer);

    if (!valid) {
        throw new Error(`Disuware configuration is invalid: ${ajv.errorsText()}`);
    }

    debug('Finished validating the configuration, looks alright');

    // and resolve the process
    return Promise.resolve();
}

/**
 * Returns the value for given key from the config
 * @param {string} aKey The key to retrieve
 * @return {*} The value for given key
 */
function getKey(aKey) {
    debug(`Loading configuration for key ${aKey}`);

    // if there is no config object throw an error
    if (configPointer === null) {
        throw new ReferenceError('Config has not yet initialized! Call execute(configFile) to initialize it');
    }

    return configPointer[aKey];
}

/**
 * Returns a path, resolved by the config file path
 * @param {string} aPath The path to resolve by config file path
 * @return {string} The resolved path
 */
function resolveByExecutionDir(aPath) {
    return path.resolve(executionDir, aPath);
}

module.exports = {
    execute,
    getKey,
    resolveByExecutionDir,
};
