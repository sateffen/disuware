# disuware.json

The *disuware.json* file is used to define a module implementing an interface.
It's similar to the *package.json* for node-modules. Each module you want to load
with disuware needs to contain a *disuware.json* file at its root directory.

This file does not define the modules name or dependencies for NPM, it defines the
modules **interface** and **interface version**, as well as the depended interfaces
and their versions. Disuware will use this file to generate the dependency injection
system.

Each combination of interface and version has to be unique in the process, but one
interface in multiple versions is allowed. So you can have something like *database@1.0.0*
and *database@2.0.0* (database = a process implementing your database connection) in
your process, and disuware will handle injecting the correct versions for your dependend
modules. Even *database@1.0.0* and *database@1.0.1* in the same process is allowed
(even though patch-versions in interfaces are not useful). That allows for migrating
your application piece by piece to a new interface.

The following values are allowed. You can use the JSON-schema in *src/schemas/disuwarejson.json*
to validate your config.

## interface

**Description**: The name of the implemented interface.

**Type**: String

**Severity**: Mandatory

## version

**Description**: A string representing the version of the interface implemented. It's a
complete semver version (so 3 digits, *1.0.0* for example), and can't be any other
format. Usually interfaces don't have a patch version, but for convenience, its there.

**Type**: String

**Severity**: Mandatory

## requires

**Description**: This is an object representing the required interfaces in the process.
The format is the same as *dependencies* in the *package.json*. You can use the same
modifiers as in a *package.json*.

**Type**: Object

**Severity**: Optional

**Example**: 

```
{
    "interface1": "1.0.0", // expicit version
    "interface2": "~1.0.0", // newest patch version
    "interface3": "^1.0.0" // newest minor or patch version
}
```