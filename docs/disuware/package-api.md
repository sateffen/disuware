# Disuware package API

Sometimes disuware has to be used as package, not as CLI tool. For that case here's the documenatation about how the
package can be used as node module.


### run(executionDir, configObject)

**Description**: This function executes the configuration provided as *configObject*, based on given *executionDir*.

**Param executionDir**: String - provides the directory, in which the process should be executed

**Param configObject**: Object - provides the configuration for the process to execute.

**Returns**: Promise - a promise that tells when the process start is finished

**Example**:

```js
const disuware = require('disuware');

disuware.run(process.cwd(), {"moduleDirs": ["./"]});
```
