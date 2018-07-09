# Module API

Each module can have some life-cycle methods, that help you to interact with the disuware environment. Currently there is
only one, but there's a chance for more.

## Life cycle methods

Each life-cycle method is optional. You can implement it or not. Disuware will call them in the corresponding moments

### __disuwareInit(aInitCompletePromise)

**Description**: This life-cycle method is called as init method for the module. The module is loaded, and directly after that the
`__disuwareInit` method is called. The module gets a promise as parameter, that is resolved right after the complete init
process of all modules is completed. You can use the promise to start the second part of your service right after the
init process is completed.

Remember: The order of promise resolving might not be deterministic (actually it's the order of modules initialized).

**Param aInitCompletePromise**: Promise<void> - A promise that resolves when all modules are initialized.

**Example:**

```js
module.exports = {
    __disuwareInit: (aInitCompletePromise) => {
        // create and configure an http server
        const httpServer = http.createServer(myHandler);
        ...
        // start listening to the outerworld when the init is complete, and everything is registered
        aInitCompletePromise.then(() => httpServer.listen(8888));
    }
};
```