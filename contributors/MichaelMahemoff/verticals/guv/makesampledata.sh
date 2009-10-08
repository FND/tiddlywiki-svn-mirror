#!/bin/bash

cd `dirname $0`
top=`pwd`

for dir in `find src/sampledata -type d -mindepth 1 -maxdepth 1`; do
  cp $dir/* dist/store/`basename $dir`
done
