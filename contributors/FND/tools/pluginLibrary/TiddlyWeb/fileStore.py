#!/usr/bin/env python

"""
simple creation of TiddlyWeb-compatible flat-file store

DEBUG: use TiddlyWeb's built-in importing facilities instead (cf. manager script)
"""

from __future__ import with_statement
import sys
import os

def main(args):
	store = fileStore(os.getcwd() + os.sep)
	# DEBUG
	#store = fileStore("/tmp/TiddlyWeb/")
	#store.createBag("foo")
	#store.createTiddler("foo", "bar", { "key1": "value1", "key2": "value2" }, "lorem ipsum dolor sit amet")

class fileStore:
	"""
	flat-file storage system

	structure:
	/bags/<bag>/tiddlers/<tiddler>/<revision>
	"""
	def __init__(self, root):
		"""
		generate store instance

		@param root: root directory
		@type  root: str
		@return: None
		"""
		if root[-1] != os.sep:
			root += os.sep;
		self.recipesDir = root + "recipes" + os.sep
		if not os.path.exists(self.recipesDir):
			os.mkdir(self.recipesDir)
		self.bagsDir = root + "bags" + os.sep
		if not os.path.exists(self.bagsDir):
			os.mkdir(self.bagsDir)
		self.tiddlersFolder = "tiddlers" + os.sep

	def createBag(self, name):
		"""
		create bag

		@param name: bag name
		@type  name: str
		@return: success (False if bag already exists)
		@rtype : bool
		"""
		path = self.bagsDir + name # DEBUG: escape folder name!?
		if not os.path.exists(path):
			os.mkdir(path)
		else:
			return False

	def createTiddler(self, bag, title, fields, content):
		"""
		create tiddler

		@param bag: bag name
		@type  bag: str
		@param title: tiddler name
		@type  title: str
		@param fields: tiddler attributes
		@type  fields: dict
		@param content: tiddler contents
		@type  content: str
		@return: success (False if tiddler already exists)
		@rtype : bool
		"""
		path = self.bagsDir + bag + os.sep \
			+ self.tiddlersFolder + title + os.sep # DEBUG: escape folder names!?
		if not os.path.exists(path):
			os.makedirs(path)
		else:
			return False
		return self.addTiddlerRevision(path, fields, content)

	def addTiddlerRevision(self, tiddlerDir, fields, content):
		"""
		create tiddler revision

		@param path: tiddler directory
		@type  path: str
		@param fields: tiddler attributes
		@type  fields: dict
		@param content: tiddler contents
		@type  content: str
		@return: None
		"""
		if not os.path.exists(path):
			os.makedirs(path)
		text = ""
		for k, v in fields.iteritems():
			text += k + ": " + v + "\n"
		text += "\n" + content
		revisions = [int(rev) for rev in os.listdir(path) if rev.isdigit()] # DEBUG: unsafe?
		revision = max(revisions or [0], key = int) + 1
		with open(path + revision.__str__(), "w") as f:
			f.write(text)

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

