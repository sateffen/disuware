const httpServer = require('disuware!httpserver');
const graphqlServer = require('disuware!graphqlserver');

/**
 * Sets up the echo service
 * @return {Promise<void>} An empty promise, to finish the chain
 * @private
 */
function __disuwareInit() {
    httpServer.onGet('/echo', (aRequest, aResponse) => {
        aResponse.writeHead(200);
        aResponse.write('Here we echo!');
        aResponse.end();
    });

    httpServer.onPost('/echo', (aRequest, aResponse) => {
        aResponse.writeHead(200, {
            'content-type': 'text/plain',
        });
        aResponse.write(aRequest.body);
        aResponse.end();
    });

    httpServer.onWebSocket((aSocket) => {
        aSocket.on('message', (aMessage) => {
            aSocket.send(aMessage);
        });
    });

    graphqlServer.addRawGraphQLSchema(`
        type EchoString {
            value: String,
        }
        
        type Query {
            echo(toEcho: String): EchoString,
        }
    `, {
        Query: {
            echo(aRootContext, aArguments, aContext) {
                return {
                    value: aArguments.toEcho,
                };
            },
        },
    });

    return Promise.resolve();
}

module.exports = {
    __disuwareInit,
};
