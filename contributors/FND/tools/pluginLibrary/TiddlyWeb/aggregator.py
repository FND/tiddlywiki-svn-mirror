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
			"URI": "http://www.tiddlytools.com",
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
			doc = urlopen(repo["URI"]).read()
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
		import_wiki(getPluginTiddlers(doc), repo["name"]) # DEBUG: doesn't handle legacy store format, creates a new revision per cycle
		return True
	elif repo["type"] == "SVN":
		pass # DEBUG: to be implemented
	else:
		pass # DEBUG: TBD

def getPluginTiddlers(doc):
	"""
	retrieve plugin tiddlers from TiddlyWiki document

	@param doc: TiddlyWiki document
	@type  doc: str
	@return: plugin tiddlers (pure-store format)
	@rtype : str
	"""
	from BeautifulSoup import BeautifulSoup # DEBUG: move to top of module?
	tw = BeautifulSoup(doc)
	store = tw.find("div", id="storeArea")
	tag = "systemConfig" # includes "systemConfigDisable" -- DEBUG: include systemTheme tiddlers?
	# remove non-plugin tiddlers
	[tiddler.extract() for tiddler in store.findAll("div", tiddler=True, tags=True) \
		if tag not in tiddler["tags"]]
	# disable plugins
	match = re.compile(r"\bsystemConfig\b\s?")
	for plugin in store.findAll("div", tiddler=True, tags=True):
		plugin["tags"] = re.sub(match, " ", plugin["tags"])
	# return pure-store format
	return "<html><body>" + store.renderContents() + "</body></html>"

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

