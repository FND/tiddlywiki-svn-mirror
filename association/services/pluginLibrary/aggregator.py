"""
retrieve TiddlyWiki plugins from authors' repositories
"""

import sys
import os
import shutil

from urllib import urlopen

from tiddlyweb.store import Store
from tiddlyweb.bag import Bag
from tiddlyweb.recipe import Recipe
from tiddlyweb.importer import import_wiki

from tiddlywiki import TiddlyWiki
from dirScraper import dirScraper

def main(args = []):
	store = Store("text")
	repos = getRepositories("repos.lst")
	for repo in repos:
		print "processing " + repo["name"] + " (" + repo["URI"] + ")" # XXX: log
		getPlugins(repo, store)
	bags = [repo["name"] for repo in repos] # XXX: repo["name"] not necessarily equals Bag(repo["name"]).name
	generateRecipe(bags, store)

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
	for line in open(filepath, "r"):
		if line.strip() and not line.startswith("#"): # skip blank and commented lines
			repo = dict()
			components = line.split("|", 2)
			repo["URI"] = components[0].strip()
			repo["type"] = components[1].strip()
			repo["name"] = components[2].strip()
			repos.append(repo)
	return repos

def getPlugins(repo, store):
	"""
	retrieve and store plugins from repository

	@param repo: repository dictionaries
	@type  repo: list
	@param store: TiddlyWeb store
	@type  store: Store
	@return: success
	@rtype : bool
	"""
	if repo["type"] == "TiddlyWiki":
		try:
			html = urlopen(repo["URI"]).read() # TODO: deferred processing?!
		except IOError:
			return False # TODO: log error
		bag = Bag(repo["name"])
		tw = TiddlyWiki(html)
		tw.convertStoreFormat()
		plugins = tw.getPluginTiddlers(repo);
		empty = "<html><body><div id='storeArea'>\n</div></body></html>" # XXX: ugly hack; cf. tiddlywiki.TiddlyWiki.getPluginTiddlers()
		if plugins != empty:
			savePlugins(store, bag)
			import_wiki(plugins, bag.name)
			return True
		else:
			return False # TODO: log error
	elif repo["type"] == "SVN":
		bag = Bag(repo["name"])
		svn = dirScraper(repo["URI"])
		plugins = svn.getPlugins("./", True)
		if plugins:
			savePlugins(store, bag)
			for plugin in plugins:
				plugin.bag = bag.name
				store.put(plugin)
			return True
		else:
			return False # TODO: log error
	else:
		pass # XXX: TBD

def generateRecipe(bags, store):
	"""
	generate recipe from a list of bags

	@param bags: bag names
	@type  bags: list
	@param store: TiddlyWeb store
	@type  store: Store
	@return: None
	"""
	recipe = Recipe("plugins")
	items = [([bag, ""]) for bag in bags] # TODO: use None instead of empty string?
	recipe.set_recipe(items)
	store.put(recipe)

def savePlugins(store, bag):
	"""
	save repository's plugins to store

	@param bags: TiddlyWeb bag
	@type  bags: Bag
	@param store: TiddlyWeb store
	@type  store: Store
	@return: None
	"""
	try: # XXX: don't use exception here!?
		store.delete(bag) # XXX: ugly hack?
	except IOError:
		pass
	store.put(bag)

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

