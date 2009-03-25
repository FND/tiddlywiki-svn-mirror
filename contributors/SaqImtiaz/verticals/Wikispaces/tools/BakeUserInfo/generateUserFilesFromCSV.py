#!/usr/bin/env python

"""
generate user files from CSV

Usage:
 $ ./generateUserFilesFromCSV.py <CSV> <HTML> <targetDir> <targetFile>
 * CSV       : CSV filename
 * HTML      : template HTML file
 * targetDir : output dir
 * targetFile: output filename
"""


import sys
import os
import csv
import re

tiddlertemplate="""<div title="ServerCredentials" tags="excludeLists excludeSearch systemConfig excludeSync">
<pre>config.options.txtWikispacesUsername="%s";
config.options.txtWikispacesPassword="%s";
</pre>
</div>"""

def main(args=None):
	csvfile = args[1]
	template = args[2]
	dir = args[3]
	output_name = args[4]
	try:
		os.mkdir(dir)
	except OSError:
		pass
	csvReader = csv.reader(open(csvfile), delimiter=",")
	for row in csvReader:
		username = row[0]
		password = row[2]
		f = open(template)
		inputtext = f.read()
		marker = r"</div>\n<!--POST-STOREAREA-->"
		pattern = re.compile(marker)
		tiddler = getTiddler([username,password])
		#print foo
		outputtext = pattern.sub("%s\n%s" % (tiddler,marker),inputtext)
		f.close()
		output = open("%s/%s-%s.html" % (dir, output_name, username), "w")
		output.write(outputtext)
		output.close()
	return True


def getTiddler(arg):
	return tiddlertemplate % (arg[0],arg[1])

if __name__ == "__main__":
	status = not main(sys.argv)
	sys.exit(status)
