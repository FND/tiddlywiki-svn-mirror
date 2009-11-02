#!/bin/bash
../
port=$1
echo "******************************************************************************"
echo "Welcome to TiddlyDocs"
echo "******************************************************************************"
echo "Point browser to http://localhost:$port"

twanager server localhost $port
