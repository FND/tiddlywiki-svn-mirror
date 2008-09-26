"""
HTTP directory scraper
"""

import posixpath

from urllib import urlopen
from BeautifulSoup import BeautifulSoup
from tiddlyweb.tiddler import Tiddler
from utils import addTrailingSlash

class DirScraper:
	def __init__(self, host):
		"""
		@param host (str): base URI
		"""
		self.host = addTrailingSlash(host)
		self.blacklist = "excludeLibrary.txt"
		self.whitelist = "includeLibrary.txt"

	def _get(self, url):
		"""
		retrieve page contents

		@param url (str): page URL
		@return (str): page contents
		@raise IOError: HTTP error
		"""
		content = urlopen(url).read()
		return unicode(content, "utf-8", "replace")

	def getPlugins(self, dir, recursive = False):
		"""
		retrieve .js files from directory

		if there is a whitelist file, only those items will be retrieved
		if there is a blacklist file, those items will be excluded
		whitelist and blacklist files contain one file or directory name per line
		whitelist takes precedence over blacklist

		@param dir (str): directory (relative path)
		@param recursive (bool): process subdirectories
		@return (list): plugin tiddlers
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
			meta = [uri.strip() for uri in uris if uri.endswith(".meta")]
			uris = [uri.strip() for uri in whitelisted]
			uris.extend(meta)
		elif self.blacklist in uris:
			blacklisted = self._get(self.host + dir + self.blacklist).split("\n")
			blacklisted.append(self.blacklist)
			uris = [uri.strip() for uri in uris if uri not in blacklisted]
		for uri in uris:
			if uri == "../":
				continue
			if uri.endswith(".js"): # plugin -- XXX: also excludes whitelisted items missing .js extension
				plugin = Tiddler()
				plugin.title = posixpath.basename(uri[:-3])
				plugin.tags = ["systemConfig"]
				plugin.text = self._get(self.host + dir + uri)
				if uri + ".meta" in uris: # retrieve metadata
					self.retrieveMetadata(plugin, self.host + dir + uri + ".meta")
				plugins.append(plugin)
			elif uri.endswith("/") and recursive: # directory -- XXX: potential for infinite loop?
				plugins.extend(self.getPlugins(dir + uri, recursive))
		return plugins

	def retrieveMetadata(self, plugin, uri): # TODO: rename!?
		"""
		retrieve plugin's metadata from accompanying meta file

		meta file is named after plugin file, using .js.meta extension
		meta file contains one field per line
		field format is "key: value"

		@param plugin (Tiddler): TiddlyWeb tiddler
		@param uri (str): path to meta file
		@return: None
		"""
		fields = self._get(uri).split("\n")
		for field in fields:
			if ":" in field:
				k, v = [c.strip() for c in field.split(":", 1)]
				if k in ["title", "created", "modified", "modifier"]:
					setattr(plugin, k, v)
				elif k == "tags":
					for tag in v.split(" "): # TODO: resolve bracketed list
						if tag not in plugin.tags:
							plugin.tags.append(tag)
				else: # extended field
					plugin.fields[k] = v
