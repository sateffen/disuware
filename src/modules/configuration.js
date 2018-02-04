const debug = require('debug')('disuware:modules:configuration');
const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');

/**
 * The local ajv validator object
 * @type {ajv | ajv.Ajv}
 */
const ajv = new Ajv();

/**
 * A string telling the config file directory. Used for later resolves
 * @type {string|null}
 */
let configFileDir = null;

/**
 * A pointer to the config object
 * @type {Object|null}
 */
let configPointer = null;

/**
 * Executes loading the config
 * @param {string} aConfigPath The path to the config file
 * @param {Object} aConfigSchema The config file schema description
 * @return {Promise.<undefined>} A promise telling about the success loading the config
 */
function execute(aConfigPath, aConfigSchema) {
    debug(`Start loading configuration from file ${aConfigPath}`);
    const configFilePath = path.resolve(process.cwd(), aConfigPath);
    configFileDir = path.dirname(configFilePath);

    if (!fs.existsSync(configFilePath)) {
        throw new ReferenceError(`Given path to config-file does not exist: ${configFilePath}`);
    }
    // else config file exists, so load it
    configPointer = require(configFilePath);

    debug('Finished loading configuration');
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
function resolveByConfigFilePath(aPath) {
    return path.resolve(configFileDir, aPath);
}

module.exports = {
    execute,
    getKey,
    resolveByConfigFilePath,
};
