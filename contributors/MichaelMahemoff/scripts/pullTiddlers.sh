#!/bin/bash
cd `dirname $0`/..
for f in `find . -name redirect` ; do
  echo "Updating $f"
  dirname $f
  pushd `dirname $f`
  length=`wc -l < redirect`
  lengthToKeep=`expr $length - 1`
  head -n $lengthToKeep redirect > 1
  cat `tail -1 redirect` >> 1
  popd
done
