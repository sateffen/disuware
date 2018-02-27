# disuware

[![Codeship Status for sateffen/disuware](https://app.codeship.com/projects/aa841420-e1da-0135-85bf-62c27b79889e/status?branch=master)](https://app.codeship.com/projects/266782)

Application initialization like a boss!

## Install it

disuware is a cli tool, so it's best installed globally: `npm install -g disuware` (**not yet**,
it's still in prerelease, so git only).

## Use it

disuware is a cli tool which uses a subcommand style for using it. The following
subcommands are available:

### run <configFile>

**Description**: Loads given config file and executes it as process.

**Example**: disuware run myconfig.json

## What does it do (short story)

In short, disuware is a CLI tool for starting nodejs applications, which are built
by composing modules by interface, not by name. Disuware will provide a dependency
injection system on top of the nodejs native module loading to enable you composing
your modules, as well as load the modules itself in an order, that they work well.

So basically you can switch out modules (node-modules) with other modules, that
implement the same interface, and disuware will handle linking them correctly.

For a longer description see *docs/what-does-it-do-long-story.md*.

## Why?

Well, I've got 2 problems: Reuse and replacing.

First problem is reuse. I love to write components for my software, that solve a specific
problem for me and reuse it in different projects, but each project is slightly different.
So I want to reuse my stuff, but have to replace some components without breaking all the
other stuff (and without refactoring all require-calls each time again).

In Java most of this stuff is solved by standartising things. You've got JDBC for databases
or servelets for webstuff, but in JS - no. There are some APIs like Express or React,
that are reimplemented in different other libs, have the same API, but the modules
explicitly name the other dependencies. For frontend we define webpack aliases, for node...
Well, for node you've got disuware :)
