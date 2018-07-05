const polka = require('polka');

const bodyParser = require('body-parser');
const helmet = require('helmet');

const httpConfigSchema = require('./configschema.json');
const Ajv = require('ajv');
const ajv = new Ajv();

const disuwareEnv = require('disuware!');
const configProvder = require('disuware!configprovider');

const httpServerList = [];
const webSocketServerList = [];

const router = polka();

router.use(helmet());
router.use(bodyParser.json());
router.use(bodyParser.text());

/**
 * Registers given handler as websocket handler
 * @param {function} aHandler The handler to register
 * @throws Throws an error if there are no webservers to listen for websockets
 */
function registerForWebSockets(aHandler) {
    if (webSocketServerList.length === 0) {
        throw new Error('No websocket server registered');
    }

    for (let i = 0, iLen = webSocketServerList.length; i < iLen; i++) {
        webSocketServerList[i].on('connection', aHandler);
    }
}

/**
 * A helper function, that registers route and handler to given registerfunction
 * @param {function} aRegisterFunction The function to register the given handler to
 * @param {string} aRoute The route to use for register
 * @param {function} aHandler The handler to register
 */
function registerMethodHandler(aRegisterFunction, aRoute, aHandler) {
    aRegisterFunction(aRoute, aHandler);
}

/**
 * Initializes the httpserver
 * @return {Promise<void>} An empty promise to finish the chain
 * @private
 */
function __disuwareInit() {
    const config = configProvder.getKey('httpserver');
    const valid = ajv.validate(httpConfigSchema, config);

    if (!valid) {
        throw new Error(`httpserver configuration is invalid: ${ajv.errorsText()}`);
    }

    if (typeof config.http === 'object') {
        const httpModule = require('http');
        const httpServer = httpModule.createServer(router.handler.bind(router));

        disuwareEnv.once('applicationInitComplete', () => httpServer.listen(config.http.port, config.http.host));
        httpServerList.push(httpServer);
    }

    if (typeof config.https === 'object') {
        const httpsModule = require('https');
        const fsModule = require('fs');

        const httpsServer = httpsModule.createServer(
            {
                key: fsModule.readFileSync(config.https.key),
                cert: fsModule.readFileSync(config.https.cert),
            },
            router.handler.bind(router)
        );

        disuwareEnv.once('applicationInitComplete', () => httpsServer.listen(config.https.port, config.https.host));
        httpServerList.push(httpsServer);
    }

    if (typeof config.websocket === 'object') {
        const wsModule = require('ws');
        const httpServerListLength = httpServerList.length;

        if (httpServerListLength === 0) {
            throw new Error('There are no http servers, can\'t attach websocket listener');
        }

        for (let i = 0; i < httpServerListLength; i++) {
            const webSocketServer = new wsModule.Server({
                server: httpServerList[i],
                path: config.websocket.path,
            });

            webSocketServerList.push(webSocketServer);
        }
    }

    return Promise.resolve();
}

module.exports = {
    __disuwareInit,
    onWebSocket: registerForWebSockets,
    addMiddleware: router.use.bind(router),
    onOptions: registerMethodHandler.bind(null, router.options.bind(router)),
    onGet: registerMethodHandler.bind(null, router.get.bind(router)),
    onPost: registerMethodHandler.bind(null, router.post.bind(router)),
    onPut: registerMethodHandler.bind(null, router.put.bind(router)),
    onDelete: registerMethodHandler.bind(null, router.delete.bind(router)),
};
