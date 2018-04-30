# echohttpservice example

This is a little more complicated example, that shows a little echo-http-service. It provides you with a little example
of an httpserver with normal REST-, Graphql- and websocket-capabilities.

Remember: It's just an example, so it might have rough edges and might not be complete. Especially the configprovider is
just a mock-up.

## Try it

To try it simply call `disuware run config.json`. This will start an httpserver on *localhost:8888*. The server has the
following endpoints:

#### GET /echo

**Response-Body**: The constant text "Here we echo!"

#### POST /echo

**Request-Body**: Any body, you want to echo

**Response-Body**: The same content as the request-body.

#### POST /graphql

**Request-Header**: You have to provide the `content-type` header as `application/json`.

**Request-Body**: A valid graphql query, that querys the echo-method. Example: `{"query":"query echo {echo(toEcho: \"test\"){value}}"}`
(yes, with backslashes)

**Response-Body**: An echo response from the graphql graph. Looks like `{"data":{"echo":{"value":"test"}}}` with above
example.

#### WebSocket /echo

You can connect with a websocket to the */echo* endpoint. It'll echo back all data you send to it.
