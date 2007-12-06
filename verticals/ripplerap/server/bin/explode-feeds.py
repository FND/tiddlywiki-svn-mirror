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
import time
import getopt
import feedparser
import codecs

outputdir = "notes"
	
def rss20ise_entry(e):
	if hasattr(e, 'guid'):
		guid = e.guid
	else:
		guid = e.link
	return " <item>\n" + \
	"  <title>" + e.title + "</title>\n" + \
	"  <description>" + e.summary + "</description>\n" + \
	"  <pubDate>" + e.updated + "</pubDate>\n" + \
	"  <category>note</category>\n" + \
	"  <category>shared</category>\n" + \
	"  <author>" + e.author + "</author>\n" + \
	"  <link>" + e.link + "</link>\n" + \
	"  <guid>" + guid + "</guid>\n" + \
	" </item>\n";
	
def squash(title):
	title = re.sub(r'-', '_', title)
	title = re.sub(r'(.*) from (\w+)$', r'\1-\2', title) 
	title = re.sub(r'[^\w\-]', '_', title)
	return title


if __name__ == "__main__":
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
	f = feedparser.parse(feed)
	for e in f.entries:
		title = squash(e.title)
		path = os.path.join(outputdir, title) 
		fp = codecs.open(path, 'w', 'utf-8')
		fp.write(rss20ise_entry(e))
		fp.close

		mtime = time.mktime(e.updated_parsed)
		os.utime(path, (mtime, mtime))

# it seems that the utime after the close depends on a flush from the os?!
#os.system("ls -l notes/Testing_s__Number___010-TestUser088")
