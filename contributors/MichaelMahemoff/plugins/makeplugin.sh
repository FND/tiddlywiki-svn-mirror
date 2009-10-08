#!/bin/bash
if [ "$1" == '' ] ; then
  exit 1
fi
if [ -d $1 ] ; then
  mv -f $1 /tmp/$1.$$
fi
mkdir $1
cp -R PluginTemplate/* $1
cd $1
for f in `ls TiddlerTableMacro*` ; do
  mv $f `echo $f | sed -e "s/TiddlerTableMacro/$1/g"` 
done
for f in `find . -type f` ; do
  sed -i '' -e "s/TiddlerTableMacro/$1/g" $f
  sed -i '' -e "s/tiddlerTableMacro/$1/g" $f
  sed -i '' -e "s/Tiddler Table Macro/$1/g" $f
done
