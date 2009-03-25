#!/usr/bin/env python

"""
generate user files from CSV

Usage:
 $ ./generateUserFilesFromCSV.py <CSV> <HTML> <targetDir> <targetFile>
 * CSV       : CSV filename
 * HTML      : template HTML file
 * targetDir : output dir, must exist
 * targetFile: output filename
"""


import sys
import os
import csv


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
		outputtext = inputtext.replace("%(wikispaces_username)s", username).
			replace("%(wikispaces_password)s", password)
		f.close()
		output = open("%s/%s-%s.html" % (dir, output_name, username), "w")
		output.write(outputtext)
		output.close()
	return True


if __name__ == "__main__":
	status = not main(sys.argv)
	sys.exit(status)
