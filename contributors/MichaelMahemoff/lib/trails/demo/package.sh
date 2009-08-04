#!/bin/bash
cd `dirname $0`
tmpdir=/tmp/trails-$$
tarball=`pwd`/trails.tgz
mkdir -p $tmpdir/trails
cp -Rp *.py templates/*.html `find static -name | grep -v \/\.svn` $tmpdir/trails
cd $tmpdir
pwd
tar zcvf $tarball $tmpdir/trails
echo "Made $tarball from $tmpdir"
