#!/bin/sh

touch users/TestUser*088*/index.xml

export ripplerapdir=..

../bin/ripplerap.sh 

#export PYTHONPATH=$ripplerapdir/lib
#python ../bin/explode-feeds.py -o notes "users/*088/index.xml"

ls -l notes/Testing_s__Number___010-TestUser088

