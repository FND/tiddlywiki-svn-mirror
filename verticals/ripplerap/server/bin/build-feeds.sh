#!/bin/sh

#
#  limit the number
#
nitems="$2"
[ -n "$nitems" ]&&nitems=1000

notesdir=./notes

sessions=$(cd notes ; ls | sed 's/-.*$//' | uniq)

echo $session

#cat $(ls -rt $notesdir/$session%20from%20* | tail -$nitems)
