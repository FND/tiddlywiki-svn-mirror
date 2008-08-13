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

		@param dir: directory (relative path)
		@type  dir: str
		@param recursive: process subdirectories
		@type  recursive: bool
		@return: plugin tiddler and source URI
		@rtype : tuple
		"""
		results = []
		dir = addTrailingSlash(dir)
		content = self._get(self.host + dir)
		soup = BeautifulSoup(content)
		list = soup.find("ul")
		items = list.findChildren("li")
		for item in items:
			anchor = item.findChild("a")
			href = anchor["href"]
			if href == "../":
				continue
			if href.endswith(".js"): # plugin
				plugin = Tiddler()
				plugin.title = posixpath.basename(href[:-3])
				plugin.tags = ["systemConfig"]
				plugin.text = self._get(self.host + dir + href)
				results.append(plugin)
			elif href.endswith("/") and recursive: # directory
				results.extend(self.getPlugins(dir + href))
		return results

