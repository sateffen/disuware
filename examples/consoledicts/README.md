# Console Dicts example

This simple example shows two modules (module1 and module2), that require both another module with the *dict* interface
implemented (the *dict* interface in this example exports a string to log). We got two implementations of the *dict*
interface: newdict and olddict. Each module has a different version (v1.0.0 and v2.0.0), which gets linked to the
modules module1 and module2, corresponding to their description in the *disuware.json*.
