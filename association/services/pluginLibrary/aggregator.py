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

def main(args):
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
		store.delete(bag) # XXX: 404 handling required!
		store.put(bag)
		tw = TiddlyWiki(html)
		tw.convertStoreFormat() # TODO: extract plugins first?
		import_wiki(tw.getPluginTiddlers(repo), repo["name"])
		return True
	elif repo["type"] == "SVN":
		bag = Bag(repo["name"])
		store.delete(bag) # XXX: 404 handling required!
		store.put(bag)
		svn = dirScraper(repo["URI"])
		for plugin in svn.getPlugins("./", True):
			plugin.bag = bag.name
			store.put(plugin)
		return True
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

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

