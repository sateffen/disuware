/**
 * The disuware module class
 */
class DisuwareModule {
    /**
     * @constructor
     */
    constructor() {
        /**
         * The path of this package
         * @type {string|null}
         */
        this.path = null;

        /**
         * The resolved path of this package, for loading it
         * @type {string|null}
         */
        this.resolvedPath = null;

        /**
         * The implemented interface of this package, based on the disuwarepackage.json
         * @type {string|null}
         */
        this.interface = null;

        /**
         * The version of this package, based on the disuwarepackage.json
         * @type {string|null}
         */
        this.version = null;

        /**
         * The required interfaces of this package, based on the disuwarepackage.json
         * @type {Object|null}
         */
        this.requires = null;
    }
}

module.exports = DisuwareModule;
