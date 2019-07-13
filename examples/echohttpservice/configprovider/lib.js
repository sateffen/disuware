/**
 * The config object. Load this from external source in future
 * @type {Object}
 */
const config = {
    polkahttpprovider: {
        http: {
            host: 'localhost',
            port: 8888,
        },
        websocket: {
            path: '/echo',
        },
    },
};

/**
 * Returns whether the given key exists in the config
 * @param {string} aKey The key to check for existence
 * @return {boolean} The result of the check
 */
function hasKey(aKey) {
    return typeof aKey === 'string' && aKey in config;
}

/**
 * Returns the value of the config or undefined
 * @param {string} aKey The key to check for existence
 * @return {*} The value of given config key or undefined
 */
function getKey(aKey) {
    if (typeof aKey === 'string' && hasKey(aKey)) {
        return config[aKey];
    }

    return undefined;
}

module.exports = {
    hasKey,
    getKey,
};
