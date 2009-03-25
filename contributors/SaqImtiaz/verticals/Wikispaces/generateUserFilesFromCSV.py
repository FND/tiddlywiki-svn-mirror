#!/usr/bin/env python
# argv
## 1 : csv file
## 2 : template html file
## 3 : output dir, must exist
## 4 : outputfilename

import sys
import csv
import os

def main(argv=None):
	csvfile = argv[1]
	template = argv[2]
	dir = argv[3]
	output_name = argv[4]
	try:
		os.mkdir(dir)
	except OSError: 
		pass
	csvReader = csv.reader(open(csvfile),delimiter=',')
	for row in csvReader:
		username = row[0]
		password = row[2]
		f = open(template);
		inputtext = f.read()
		outputtext = inputtext.replace('%(wikispaces_username)s',username).replace('%(wikispaces_password)s',password)
		f.close()
		output = open(dir + "/" + output_name + "-" + username +".html","w")
		output.write(outputtext)
		output.close()
	return True
	
if __name__ == "__main__":
	status = not main(sys.argv)
	sys.exit(status)
