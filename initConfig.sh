#!/bin/bash

# Read the JSON file and get the value of the "USE_DATABASE" field
USE_DATABASE=$(cat appConfig.json | jq -r '.USE_DATABASE')

# Check the value of the "USE_DATABASE" field and run the appropriate command
if [[ "$USE_DATABASE" == "mongodb" ]]; then
  handpick --target=mongodbDependencies --manager=npm
elif [[ "$USE_DATABASE" == "postgresql" ]]; then
  handpick --target=postgresqlDependencies --manager=npm
elif [[ "$USE_DATABASE" == "sqlite" ]]; then
  handpick --target=sqliteDependencies --manager=npm
else
  echo "Error: Database '$USE_DATABASE' not yet supported" >&2
  rm -r node_modules
  exit 1
fi