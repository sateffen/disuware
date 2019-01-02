# Disuware CLI API

Disuware is used as CLI tool. You can call disuware by simply caling `disuware <subcommand> [arguments]  <configfile>`.
The following subcommands are available:

### run <configFile>

**Description**: Loads given config file and executes it as process.

**Example**: disuware run myconfig.json

### list <configFile>

**Description**: Loads given config file and lists all corresponding modules. The list can
be costumized by options.

**Example**: disuware list myconfig.json

**Option: -l, --linked**: Attempts to link the modules. This might fail, if not all necessary
modules exist.

**Option: -d, --dependencies**: Prints the dependencies of the modules as well.