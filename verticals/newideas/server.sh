#!/bin/bash
port=9333
echo "******************************************************************************"
echo "WELCOME TO TIDDLYIDEAS"
echo "******************************************************************************"
echo "Point browser to http://localhost:$port/ideas"
echo "All these users have password 'pass' (showing first 5 users):"
ls store/users | head -5

twanager server localhost $port
