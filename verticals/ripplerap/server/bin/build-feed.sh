#!/bin/sh

session="$1"

#
#  limit the number
#
nitems="$2"

notesdir=./notes

cat $(ls -rt $notesdir/$session%20from%20* | tail -$nitems)
