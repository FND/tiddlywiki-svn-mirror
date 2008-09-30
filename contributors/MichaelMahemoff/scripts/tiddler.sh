#!/bin/bash
if [ -e $1 ] ; then echo 'exists' ; exit ; fi
mkdir $1
cp `dirname $0`'/tiddler.template' $1/1
vi +6 $1/1
