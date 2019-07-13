const httpProvider = require('disuware!httpprovider');

/**
 * Sets up the echo service
 * @return {Promise<void>} An empty promise, to finish the chain
 * @private
 */
function __disuwareInit() {
    httpProvider.onGet('/echo', (aRequest, aResponse) => {
        aResponse.writeHead(200);
        aResponse.write('Here we echo!');
        aResponse.end();
    });

    httpProvider.onPost('/echo', (aRequest, aResponse) => {
        aResponse.writeHead(200, {
            'content-type': 'text/plain',
        });
        aRequest.on('data', (data) => aResponse.write(data));
        aRequest.on('end', () => aResponse.end());
    });

    httpProvider.onWebSocket((aSocket) => {
        aSocket.on('message', (aMessage) => {
            aSocket.send(aMessage);
        });
    });

    return Promise.resolve();
}

module.exports = {
    __disuwareInit,
};
