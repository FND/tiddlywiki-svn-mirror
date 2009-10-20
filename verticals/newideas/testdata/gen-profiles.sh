#!/bin/sh
# uses Project Guttenberg RDF/XML dump:
# http://www.gutenberg.org/feeds/catalog.rdf.zip


#grep 'dc:creator rdf:parse' catalog.rdf | head -50 ; exit

grep 'dc:creator rdf:parse' catalog.rdf |
    head -50 | 
    sed -e 's/^.*">//' -e 's/<.*$//' | 
    awk -F, '{ print $2 " " $1 }' |
    sed -e 's/(.*)//g' -e 's/[0-9-]*//g' -e 's/^ *//' |
    sed '/Various/d' |
    sort -u 
