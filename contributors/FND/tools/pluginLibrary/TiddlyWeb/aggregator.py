#!/usr/bin/env python

"""
retrieve TiddlyWiki plugins from authors' repositories
"""

import sys
import os
import shutil
import re

from urllib import urlopen
from tiddlyweb.store import Store

def main(args):
	global repos
	repos = [
		{
			"name": "Core Plugins",
			"URI": "http://www.tiddlywiki.com/coreplugins.html",
			"type": "TiddlyWiki"
		}, {
			"name": "TiddlyTools",
			"URI": "", #"http://www.tiddlytools.com", # DEBUG'd
			"type": "TiddlyWiki"
		}
	] # DEBUG: read list from file
	for repo in repos:
		print "processing " + repo["name"] + " (" + repo["URI"] + ")" # DEBUG: log
		getPlugins(repo)
	bags = [repo["name"] for repo in repos]
	generateRecipe(bags)

def generateRecipe(bags):
	"""
	generate recipe from a list of bags

	@param bags: list of bags
	@type  bags: list
	@return: None
	"""
	from tiddlyweb.recipe import Recipe
	recipe = Recipe("plugins")
	items = [([bag, ""]) for bag in bags]
	recipe.set_recipe(items)
	store = Store("text")
	store.put(recipe)
	# DEBUG: include custom tiddlers for UI

def getPlugins(repo):
	"""
	retrieve and store plugins from repository

	@param repo: list of repository dictionaries
	@type  repo: list
	@return: success
	@rtype : bool
	"""
	if repo["type"] == "TiddlyWiki":
		from tiddlyweb.bag import Bag
		from tiddlyweb.importer import import_wiki
		try:
			doc = urlopen(repo["URI"]).read() # DEBUG: caching?!
		except IOError:  # DEBUG: doesn't include 404!?
			return False # DEBUG: log error
		bagName = repo["name"] # DEBUG: escape invalid path chars
		# delete existing bag -- DEBUG: temporary hack?
		bagPath = "store" + os.sep + "bags" + os.sep + bagName # DEBUG: hardcoded root - evil!?
		if(os.path.exists(bagPath)):
			shutil.rmtree(bagPath)
		# create bag
		bag = Bag(bagName)
		store = Store("text")
		store.put(bag)
		# import plugins
		tw = TiddlyWiki(doc)
		tw.convertStoreFormat()
		import_wiki(tw.getPluginTiddlers(), repo["name"]) # DEBUG: creates a new revision per cycle
		return True
	elif repo["type"] == "SVN":
		pass # DEBUG: to be implemented
	else:
		pass # DEBUG: TBD

class TiddlyWiki():
	"""
	utility functions for processing TiddlyWiki documents
	"""
	def __init__(self, doc):
		"""
		@param doc: TiddlyWiki document
		@type  doc: str
		@return: None
		"""
		from BeautifulSoup import BeautifulSoup # DEBUG: move to top of module? use demandload (cf. bzr or snakeoil; http://www.pkgcore.org/trac/pkgcore/browser/snakeoil/snakeoil/demandload.py)?
		self.doc = doc
		self.dom = BeautifulSoup(doc) # DEBUG: rename!?

	def getPluginTiddlers(self): # DEBUG: universal-ize; rename to getTiddlers() and use key-value pair(s?) for matching attribute(s?)
		"""
		retrieve plugin tiddlers

		@return: plugin tiddlers (pure-store format)
		@rtype : str
		"""
		store = self.dom.find("div", id="storeArea")
		tag = "systemConfig" # includes "systemConfigDisable" -- DEBUG: include systemTheme tiddlers?
		# remove non-plugin tiddlers
		[tiddler.extract() for tiddler in store.findAll("div", title=True) \
			if (not tiddler.has_key("tags")) or (tag not in tiddler["tags"])]
		# disable plugins -- DEBUG: move into separate function
		pattern = re.compile(r"\bsystemConfig\b\s?")
		for plugin in store.findAll("div", title=True, tags=True):
			plugin["tags"] = re.sub(pattern, "", plugin["tags"]).strip()
		# return pure-store format
		return "<html><body><div id='storeArea'>" + store.renderContents() + "</div></body></html>"

	def convertStoreFormat(self):
		"""
		convert legacy to canonical store format

		@return: None
		"""
		pass # DEBUG: to do

	def getVersion(self):
		"""
		retrieve TiddlyWiki version number
		"""
		version = self.dom.html.head.script.renderContents()
		pattern = re.compile("major: (\d), minor: (\d), revision: (\d)")
		matches = re.search(pattern, version);
		major = matches.groups()[0]
		minor = matches.groups()[1]
		revision = matches.groups()[2]
		if(major + minor + revision > 0): # DEBUG: dirty hack?
			return [major, minor, revision]
		else:
			return None

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

