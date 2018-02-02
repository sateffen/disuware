const debug = require('debug')('disuware:modules:configuration');
const path = require('path');
const fs = require('fs');
const disuwareConfigSchema = require('../schemas/disuwareconfig.json');
const Ajv = require('ajv');
const ajv = new Ajv();

/**
 * A pointer to the config object
 * @type {Object|null}
 */
let configPointer = null;

/**
 * Executes loading the config
 * @param {string} aConfigFile The path to the config file
 * @return {Promise.<undefined>} A promise telling about the success loading the config
 */
function execute(aConfigFile) {
    debug('Start loading configuration from file %s', aConfigFile);
    const configFilePath = path.resolve(process.cwd(), aConfigFile);

    if (!fs.existsSync(configFilePath)) {
        throw new ReferenceError('Given path to config-file does not exist: ' + configFilePath);
    }
    // else config file exists, so load it
    configPointer = require(configFilePath);

    debug('Finished loading configuration');
    debug('Start validating the configuration');

    const valid = ajv.validate(disuwareConfigSchema, configPointer);

    if (!valid) {
        throw new Error(`Disuware configuration is invalid: ${ajv.errorsText()}`);
    }

    debug('Finished validating the configuration, looks alright');
    debug('Start normalizing the configuration');

    // first we read the config file dirname, cause we have to normalize the packageDir
    const configFileDir = path.dirname(configFilePath);

    // then prepare the configuration
    configPointer.packageDir = path.resolve(configFileDir, configPointer.packageDir || './');
    configPointer.services = configPointer.services || {};

    debug('Finished normalizing the configuration');

    // and resolve the process
    return Promise.resolve();
}

/**
 * Returns the value for given key from the config
 * @param {string} aKey The key to retrieve
 * @return {*} The value for given key
 */
function getKey(aKey) {
    debug('Loading configuration for key %s', aKey);

    // if there is no config object throw an error
    if (configPointer === null) {
        throw new ReferenceError('Config has not yet initialized! Call execute(configFile) to initialize it');
    }

    return configPointer[aKey];
}

/**
 * Returns the config for given service from the config
 * @param {string} aService The service config to retrieve
 * @return {*} The value for given service
 */
function getService(aService) {
    debug('Loading configuration for service %s', aService);

    // if there is no config object throw an error
    if (configPointer === null) {
        throw new ReferenceError('Config has not yet initialized! Call execute(configFile) to initialize it');
    }

    return configPointer.services[aService];
}

/**
 * Returns the config pointer
 * @return {Object|null}
 */
function getConfigPointer() {
    // if there is no config object throw an error
    if (configPointer === null) {
        throw new ReferenceError('Config has not yet initialized! Call execute(configFile) to initialize it');
    }

    return configPointer;
}

module.exports = {
    execute,
    getKey,
    getService,
    getConfigPointer,
};
