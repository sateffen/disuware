# disuware (work in progress)

[ ![Codeship Status for sateffen/disuware](https://app.codeship.com/projects/aa841420-e1da-0135-85bf-62c27b79889e/status?branch=master)](https://app.codeship.com/projects/266782)

Application initialization like a boss!

## What does it do (short story)

In short, disuware is a CLI tool for starting nodejs applications, which are built
by composing modules. Disuware will provide a dependency injection system on top of
the nodejs native module loading to enable you composing your modules, as well as
load the modules itself in an order, that they work well.

## What does it do exactly (long story)

Disuware is configured by a config file. The config file contains a *packageDir*,
which describes a directory with subdirectories. Each subdirectory represents
a package, providing a module and implements a specific interface in a specific
version.

So each subdirectory contains a file called *disuwarepackage.json* which describes
the package in that directory. In the description you have to tell at least two
informations: The implemented interface and the version of the implemented interface.

Additionally you can define the required other interfaces in their required versions.
So an example *disuwarepackage.json* file looks like:

```json
{
    "interface": "authentication",
    "version": "1.2.3",
    "requires": {
        "database": "^1.0.0"
    }
}
```

Disuware will load all descriptions of modules available, and creates an ordered list
of this packages, telling in which order the packages have to be initialized to work
with each other. So in this example the list would look like `['database', 'authentication']`.

Now the executor will load each of these modules as node modules in the determined
order, and calls `__disuwareInit` on these modules, if this function is exported.

That way your modules will get initialized in the correct order.

**But wait, there's more:**

Up till now this is not that awesome, but there is a big special bonus:

Your modules implement interfaces, which are different than the package names. That way
you can define an interface called "*authentication*" for your projects, looking like:

```js
{
    authenticate(username, password)
}
```

which authenticates the user against your database. In your private npm the package is
called "authenticate-local", all fine. The next project you have to use a different
authentication method, ldap for example, but you have some other modules interacting
with your authentication module, so they all use `require('authenticate-local')`. To use
the package *authenticate-ldap* you have to find a solution, that is hard to maintain.
But one point is great: The API (the interface) is the same.

Here comes disuware, allowing you to call `require('disuware!authentication')`, which
resolves to a package implementing the *authentication* interface and providing it as
a module. That way you can download a different node-package (*authenticate-ldap*
instead of *authenticate-local*), but all other packages using this module don't have
to be changed to work with it.

That way you can define an interface, which your applications use, but have different
implementations for different usecases - without losing compatibility with all your
other modules.

**Pretty neat, but there is more:**

It's great to differenciate between interface and package-name, so it's far simpler
to generate reuse. But sometimes you define a new interface for your modules (like
*database* in version *2.0.0*), which has breaking changes. Now you have to change
all other packages at once to get it working... or do you? Well, disuware makes a
difference between *database@1.0.0* and *database@2.0.0*. In fact even*database@1.0.1*
is different than the others, sooo disuware will load and initialize all this different
modules. Now some modules require a module implementing *database@^1.0.0*, but
newer modules require a module implementing *database@^2.0.0*. Disuware loaded and
initialized both, and will link the right one to your module. So your module still
calls `require('disuware!database')`, but because disuware knows about which modules
needs which version of which interface, it'll pass back the correct fitting module.
(So for some modules `require('disuware!database')` will resolve to the module
implementing *database@2.0.0* while others will resolve to the module implementing
*database@1.0.0*)

