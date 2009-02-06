#!/bin/sh

#
#  convert HTML to PDF
#

export uri="$1" 
export dir="tmp"
export template="customer-contact.xsl"
export PATH=$PATH:/sw/bin:/home/pauldowney/bin/:/usr/local/bin:/usr/bin:/bin:/usr/bin/X11:/usr/games.

#
#  clear down cache
#
# .. TBD ..

#
#  generate hash
#
export hash=$(echo "$uri"|md5sum|awk '{print $1}')

#
#  log uri etc.
#
env > $dir/$hash.txt
exec 2>> $dir/$hash.txt

#
#  grab document from URI
#
curl --silent "$uri" > $dir/$hash.html

#
#  tidy HTML into XML
#
tidy -n -asxml < $dir/$hash.html > $dir/$hash.xml 2> /dev/null

#
#  generate XSL-FO from template
#
xsltproc "$template" $dir/$hash.xml > $dir/$hash.fo

#
#  run the Apache FOP processr to produce PDF
#
export FOP_OPTS=-Djava.awt.headless=true
fop/fop $dir/$hash.fo $dir/$hash.pdf

#
#  return PDF
#
cat $dir/$hash.pdf

exit 0
