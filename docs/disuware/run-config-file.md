# run-config.json

The disuware config-file is a JSON file for the basic configuration for the process disuware should start. It is used for
the `disuware run` command.

You'll find a JSON-schema in *src/schemas/disuwarerunconfig.json*, so you can validate your config-file as well.

You can configure the following values:

## moduleDirs

**Description**: Defines a list of directories, where modules, implementing interfaces for the disuware, are located. The
directories can be absolute or relative to this config file.

**Type**: Array\<String\>

**Severity**: Mandatory

## cluster

**Description**: Defines the cluster mode to use for this run config. If not configured disuware will not setup a cluster
at all, and run the config just like usual. If configured to, disuware will fork processes like configured with the node
cluster module.

**Type**: Object

**Severity**: Optional

### cluster.mode

**Description**: Defines the number of processes to spawn. The range is from 0..64, with 0 representing the number of
CPU-cores available on the system.

**Type**: Number

**Severity**: Mandatory
