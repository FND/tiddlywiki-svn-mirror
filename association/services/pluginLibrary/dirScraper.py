"""
HTTP directory scraper
"""

import httplib2
import posixpath

from BeautifulSoup import BeautifulSoup
from tiddlyweb.tiddler import Tiddler
from tiddlywiki import TiddlyWiki
from tiddlywiki import getSlices
from utils import addTrailingSlash

class dirScraper:
	def __init__(self, host):
		"""
		@param host: base URI
		@type  host: str
		"""
		self.host = addTrailingSlash(host)
		self.blacklist = "excludeLibrary.txt"
		self.whitelist = "includeLibrary.txt"

	def _get(self, url):
		"""
		retrieve page contents

		@param url: page URL
		@type  url: str
		@return: page contents
		@rtype : str
		"""
		http = httplib2.Http()
		reponse, content = http.request(url, method="GET")
		return content

	def getPlugins(self, dir, recursive = False):
		"""
		retrieve .js files from directory

		if there is a whitelist file, only those items will be retrieved
		if there is a blacklist file, those items will be excluded
		whitelist and blacklist files contain one file or directory name per line
		whitelist takes precedence over blacklist

		@param dir: directory (relative path)
		@type  dir: str
		@param recursive: process subdirectories
		@type  recursive: bool
		@return: plugin tiddlers
		@rtype : list
		"""
		plugins = []
		dir = addTrailingSlash(dir)
		content = self._get(self.host + dir)
		soup = BeautifulSoup(content)
		list = soup.find("ul")
		items = list.findChildren("li")
		uris = [item.findChild("a")["href"] for item in items]
		if self.whitelist in uris:
			whitelisted = self._get(self.host + dir + self.whitelist).split("\n")
			uris = [uri.strip() for uri in whitelisted] # XXX: do not strip whitespace!?
		elif self.blacklist in uris:
			blacklisted = self._get(self.host + dir + self.blacklist).split("\n")
			uris = [uri.strip() for uri in uris if uri not in blacklisted] # XXX: do not strip whitespace!?
		for uri in uris:
			if uri == "../":
				continue
			if uri.endswith(".js"): # plugin
				plugin = Tiddler()
				plugin.title = posixpath.basename(uri[:-3])
				plugin.tags = "systemConfig" # XXX: should be list; cf. aggregator.getPlugins()
				plugin.text = self._get(self.host + dir + uri)
				plugins.append(plugin)
			elif uri.endswith("/") and recursive: # directory -- XXX: potential for infinite loop?
				plugins.extend(self.getPlugins(dir + uri))
		return plugins

