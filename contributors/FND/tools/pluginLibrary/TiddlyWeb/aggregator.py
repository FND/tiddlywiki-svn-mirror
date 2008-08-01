#!/usr/bin/env python

"""
retrieve TiddlyWiki plugins from authors' repositories
"""

import sys
import os
import shutil

from urllib import urlopen
from tiddlyweb.store import Store
from tiddlywiki import TiddlyWiki

def main(args):
	repos = getRepositories("repos.lst")
	for repo in repos:
		print "processing " + repo["name"] + " (" + repo["URI"] + ")" # DEBUG: log
		getPlugins(repo)
	bags = [repo["name"] for repo in repos]
	generateRecipe(bags)

def getRepositories(filepath):
	"""
	retrieve list of repositories from file

	file structure:
	* one repository per line
	* three components per line (pipe-delimited):
	  URI | type | name

	@param filepath: full path to source file
	@return: repository objects
	@rtype : list
	"""
	repos = list()
	f = open(filepath, "r") # DEBUG: use with-statement?
	try:
		for line in f:
			if line.strip() and not line.startswith("#"): # skip blank and commented lines
				repo = dict()
				components = line.split("|", 2)
				repo["URI"] = components[0].strip()
				repo["type"] = components[1].strip()
				repo["name"] = components[2].strip()
				repos.append(repo)
	finally:
		f.close()
	return repos

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
		from tiddlyweb.importer import import_wiki
		try:
			html = urlopen(repo["URI"]).read() # DEBUG: caching, deferred processing?!
		except IOError: # DEBUG: doesn't include 404!?
			return False # DEBUG: log error
		createBag(repo["name"]) # DEBUG: escape invalid path chars
		tw = TiddlyWiki(html)
		tw.convertStoreFormat() # DEBUG: extract plugins first?
		import_wiki(tw.getPluginTiddlers(repo), repo["name"]) # DEBUG: creates a new revision per cycle (see above)
		return True
	elif repo["type"] == "SVN":
		from dirScraper import dirScraper
		svn = dirScraper(repo["URI"])
		plugins = svn.getPlugins("./", True)
		createBag(repo["name"])
		for plugin in plugins:
			plugin.bag = repo["name"]
			#tiddler.tags = _tag_string_to_list(tiddler["tags"]) # DEBUG'd; function not available in this context
			store = Store("text")
			store.put(plugin)
		return True #tiddler.tags = _tag_string_to_list(tiddler["tags"]) # DEBUG'd; function not available in this context
	else:
		pass # DEBUG: TBD

def createBag(name):
	"""
	create bag in store

	@param name: bag name
	@type  repo: str
	@return: None
	"""
	from tiddlyweb.bag import Bag
	# delete existing bag -- DEBUG: temporary(?) hack to circumvent excessive revision creation
	path = "store" + os.sep + "bags" + os.sep + name # DEBUG: hardcoded root - evil!?
	if(os.path.exists(path)):
		shutil.rmtree(path)
	# create bag
	bag = Bag(name)
	store = Store("text")
	store.put(bag)

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

