const {mergeSchemas, makeExecutableSchema} = require('graphql-tools');
const {runHttpQuery, runQuery} = require('apollo-server-core');

const httpServer = require('disuware!httpserver');

/**
 * A pointer to the currently active schema, used for request
 * @type {Object}
 * @private
 */
let graphqlSchema = null;

/**
 * This function executes a query on the graph
 * @param {string} aGraphQuery
 * @param {Object} aVariables
 * @return {Promise.<Object>}
 */
function executeGraphQLQuery(aGraphQuery, aVariables) {
    // the placeholders for the context should get removed after it's clear what to pass by
    return runQuery({
        schema: graphqlSchema,
        query: aGraphQuery,
        variables: aVariables,
    });
}

/**
 * Merges given string into the known schemas. Once a schema is merged, it can't be unmerged
 * @param {Object} aSchema
 */
function addGraphQLSchema(aSchema) {
    graphqlSchema = graphqlSchema === null ? aSchema : mergeSchemas({
        schemas: [
            graphqlSchema,
            aSchema,
        ],
    });
}

/**
 * This is a helper function for adding new graphql schemas to the api
 * @param {string} aTypeDefs
 * @param {Object} aResolvers
 */
function addRawGraphQLSchema(aTypeDefs, aResolvers) {
    const executableSchema = makeExecutableSchema({
        typeDefs: aTypeDefs,
        resolvers: aResolvers,
    });

    addGraphQLSchema(executableSchema);
}

/**
 * Handles an http request to the graphql API
 * @param {http.IncomingMessage} aRequest
 * @param {http.ServerResponse} aResponse
 */
function handleHttpRequest(aRequest, aResponse) {
    runHttpQuery([], {
        method: aRequest.method,
        options: {
            schema: graphqlSchema,
            context: aRequest,
        },
        query: aRequest.body,
    })
        .then((aGraphResponse) => {
            // the graph response is a json string, so we write the headers for json
            aResponse.writeHead(200, {
                'Content-Type': 'application/json',
            });
            // and write the data to the response stream
            aResponse.write(aGraphResponse);
            aResponse.end();
        })
        .catch((aGraphError) => {
            // if it's a graphql error, we use the data from the graphql error
            if (aGraphError.name === 'HttpQueryError') {
                aResponse.writeHead(aGraphError.statusCode, aGraphError.headers);
                aResponse.write(aGraphError.message);
            }
            // else the provided data didn't even work for graphql, so it's a general error
            else {
                aResponse.writeHead(400);
                aResponse.write(aGraphError.message);
            }

            aResponse.end();
        });
}

/**
 * Initializes the graphql controller
 * @return {Promise<void>}
 * @private
 */
function __disuwareInit() {
    httpServer.onPost('/graphql', handleHttpRequest);

    return Promise.resolve();
}

module.exports = {
    __disuwareInit,
    executeGraphQLQuery,
    addGraphQLSchema,
    addRawGraphQLSchema,
};
