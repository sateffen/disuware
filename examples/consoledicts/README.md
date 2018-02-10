# Console Dicts example

This simple example shows two modules (module1 and module2), that require both another module with the *dict* interface
implemented (the *dict* interface in this example exports a string to log). We got two implementations of the *dict*
interface: newdict and olddict. Each module has a different version (v1.0.0 and v2.0.0), which gets linked to the
modules module1 and module2, corresponding to their description in the *disuware.json*.

So basically disuware will generate a tree like:

```
- module1 (implements interface module1@1.0.0)
|- olddict (implements interface dict@1.0.0)
- module2 (implements interface module2@1.0.0)
|- newdict (implements interface dict@2.0.0)
```

## Try it

To try it simply call `disuware run config.json`