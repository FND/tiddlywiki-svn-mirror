#!/usr/bin/python

import urllib
import cgi
from urlparse import urlparse

sourceurl = "http://studentnotebook.lewcid.org/HesperianWTND-generic.html"
sourcefile = urllib.urlopen(sourceurl)
input = sourcefile.read()

form = cgi.FieldStorage()

wikiurl = form['wikiurl'].value
wikiworkspace = (urlparse(wikiurl)[1].split("."))[0]

output = input.replace('%(wiki_url)s',form['wikiurl'].value).replace('%(wiki_title)s',form['wikititle'].value).replace('%(wiki_workspace)s',wikiworkspace)

print 'Content-Type: application/octet-stream'
print 'Content-Disposition: attachment; filename=fname\n\n'.replace('fname',form['wikititle'].value.replace(" ","-")+".html") 
print output

