#!/usr/bin/env python

"""
retrieve TiddlyWiki plugins from authors' repositories
"""

from __future__ import with_statement

import sys
import os
import shutil
import re

from urllib import urlopen
from tiddlyweb.store import Store

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
	  URI|type|name

	@param filepath: full path to source file
	@return: repository objects
	@rtype : list
	"""
	repos = list()
	with open(filepath, "r") as f:
		for line in f:
			if line.strip() and not line.startswith("#"): # skip blank and commented lines
				repo = dict()
				components = line.split("|", 2)
				repo["URI"] = components[0].strip()
				repo["type"] = components[1].strip()
				repo["name"] = components[2].strip()
				repos.append(repo)
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
		from tiddlyweb.bag import Bag
		from tiddlyweb.importer import import_wiki
		try:
			doc = urlopen(repo["URI"]).read() # DEBUG: caching, deferred processing?!
		except IOError:  # DEBUG: doesn't include 404!?
			return False # DEBUG: log error
		bagName = repo["name"] # DEBUG: escape invalid path chars
		# delete existing bag -- DEBUG: temporary(?) hack to circumvent excessive revision creation
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
		import_wiki(tw.getPluginTiddlers(repo), repo["name"]) # DEBUG: creates a new revision per cycle
		return True
	elif repo["type"] == "SVN":
		pass # DEBUG: to be implemented
	else:
		pass # DEBUG: TBD

def normalizeURL(URL):
	"""
	strip non-essential trailing characters from URL

	@param URL: URL
	@type  URL: str
	@return: uniform URL
	@rtype : str
	"""
	URL = URL.split("#", 1)[0]
	if URL[-1] == "/":
		URL = URL[:-1] # DEBUG: use rstrip()?
	return URL

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

	def getPluginTiddlers(self, repo): # DEBUG: universal-ize; rename to getTiddlers() and use key-value pair(s?) for matching attribute(s?)
		"""
		retrieve plugin tiddlers

		@param repo: current repository
		@type  repo: dict
		@return: plugin tiddlers (pure-store format)
		@rtype : str
		"""
		self.store = self.dom.find("div", id="storeArea")
		tag = "systemConfig" # includes "systemConfigDisable" -- DEBUG: include systemTheme tiddlers?
		# remove non-plugin tiddlers
		[tiddler.extract() for tiddler in self.store.findAll("div", title=True) \
			if (not tiddler.has_key("tags")) or (tag not in tiddler["tags"])]
		# disable plugins -- DEBUG: move into separate function
		pattern = re.compile(r"\b(systemConfig|excludeLists|excludeSearch)\b\s?")
		for plugin in self.store.findAll("div", title=True, tags=True):
			plugin["tags"] = re.sub(pattern, "", plugin["tags"]).strip()
		# remove non-originating plugins
		self.removeDuplicates(repo["URI"])
		# return pure-store format
		return "<html><body><div id='storeArea'>" + self.store.renderContents() + "</div></body></html>"

	def removeDuplicates(self, repo): # DEBUG: rename!?
		"""
		remove plugins whose origin is not the repository specified

		@param repo: repository URL
		@type  repo: str
		@return: None
		"""
		repo = normalizeURL(repo)
		for plugin in self.store.findAll("div", title=True): # DEBUG: limit to direct child nodes!?
			slices = self.getSlices(plugin.pre.renderContents())
			if slices.has_key("Source"): # N.B.: plugin accepted if Source slice not present
				source = normalizeURL(slices["Source"])
				if source != repo:
					plugin.extract()

	def getSlices(self, text):
		"""
		retrieve plugin meta-slices

		@param text: tiddler text
		@type  text: str
		"""
		pattern = r"(?:^([\'\/]{0,2})~?([\.\w]+)\:\1\s*([^\n]+)\s*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|\s*([^\|\n]+)\s*\|$)"; # RegEx origin: TiddlyWiki core
		pattern = re.compile(pattern, re.M + re.I)
		matches = re.findall(pattern, text)
		slices = dict()
		for match in matches:
			if match[1]: # colon notation
				slices[match[1].capitalize()] = match[2]
			else: # table notation
				slices[match[4].capitalize()] = match[5];
		return slices

	def getVersion(self):
		"""
		retrieve TiddlyWiki version number

		@return: [TBD]
		@rtype : [TBD]
		"""
		version = self.dom.html.head.script.renderContents()
		pattern = re.compile("major: (\d), minor: (\d), revision: (\d)")
		matches = re.search(pattern, version);
		if matches:
			major = int(matches.groups()[0])
			minor = int(matches.groups()[1])
			revision = int(matches.groups()[2])
			if major + minor + revision > 0: # DEBUG: dirty hack?
				return [major, minor, revision]
			else:
				return None
		else:
			return None

	def convertStoreFormat(self):
		"""
		convert legacy to canonical store format

		@return: None
		"""
		version = self.getVersion()
		if version[0] + (version[1] / 10.0) < 2.2: # DEBUG: only works if minor < 10
			pass # DEBUG: to do

# startup

if __name__ == "__main__": # skip main() if imported as module
	sys.exit(main(sys.argv))

