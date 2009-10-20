#!/bin/bash
port=8080
echo "******************************************************************************"
echo "WELCOME TO TIDDLYIDEAS"
echo "******************************************************************************"
echo "Point browser to http://localhost:$port/ideas"
echo "All these users have password 'pass':"
ls store/users

twanager server localhost $port
