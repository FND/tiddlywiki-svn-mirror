#!/usr/bin/env python

"""RippleRap Feed Aggregator 

Combines individu:al note feeds provided by users into a single RSS feed
Maybe periodically run from cron

http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/server/

Requires Python 2.3, recommends 2.5.
"""

__authors__ = [ "Paul Downey <psd@osmosoft.com>" ]
__license__ = "Python"

import sys
import os
import re
import getopt
import feedparser

outputdir = "notes"
	
def rss20ise_entry(e):
	return " <item>\n" + \
	"  <title>" + e.title + "</title>\n" + \
	"  <description>" + e.summary + "</description>\n" + \
	"  <category>note</category>\n" + \
	"  <category>shared</category>\n" + \
	" </item>\n";
	
def explode_entry(e):
	title = e.title
	title = re.sub(r'-', '_', title)
	title = re.sub(r'(.*) from (\w+)$', r'\1-\2', title) 
	title = re.sub(r'[^\w\-]', '_', title)
	path = os.path.join(outputdir, title) 
	fp = open(path, 'w')
	fp.write(rss20ise_entry(e))
	fp.close

def explode(feed):
	f = feedparser.parse(feed)
	for e in f.entries:
		explode_entry(e)

def main():		 
    try:
        opts, args = getopt.getopt(sys.argv[1:], "ho:", ["help", "output="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)
 
    for o, a in opts:
        if o in ("-h", "--help"):
			print "Usage: ripplerap [options] [files ..]"
			print
			print "Options:"
			print " -o, --output        output directory"
			print " -h, --help          Display this help message and exit"
			sys.exit()
        if o in ("-o", "--output"):
            outputdir = a

    for feed in args:
		explode(feed)
    
if __name__ == "__main__":
	main()
	sys.exit()
