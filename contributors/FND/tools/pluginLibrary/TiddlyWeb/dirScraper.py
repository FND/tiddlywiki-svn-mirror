import httplib2
import posixpath

from BeautifulSoup import BeautifulSoup
from tiddlyweb.tiddler import Tiddler
from tiddlywiki import TiddlyWiki

class dirScraper:
	def __init__(self, host):
		"""
		@param host: base URI
		@type  host: str
		"""
		self.host = addTrailingSlash(host)

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
				plugin.text = self._get(self.host + dir + href)
				if self.checkOrigin(plugin): # source = self.host + dir + href
					results.append(plugin)
			elif href.endswith("/") and recursive: # directory
				results.extend(self.getPlugins(dir + href))
		return results
	
	def checkOrigin(self, text): # DEBUG: rename!?
		"""
		remove plugins whose origin is not the repository specified

		@param text: tiddler contents
		@type  text: str
		@return: origin is source
		@rtype : bool
		"""
		from utils import normalizeURI
		#slices = TiddlyWiki.getSlices(text) # XXX: does not work - needs Tiddler.getSlices()
		if False: #slices.has_key("Source"): # DEBUG'd
			source = normalizeURI(slices["Source"])
			if normalizeURI(self.host) in source:
				return True
			else:
				return False
		else: # N.B.: plugin accepted if Source slice not present -- XXX: harmful? (e.g. includes simple config tweaks)
			return True

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

def addTrailingSlash(path): # XXX: rename?
	"""
	add trailing slash to directory path if not present

	@param path: directory path
	@type  path: str
	@return: directory path
	@rtype : str
	"""
	if path[-1] != "/":
		path = path + "/"
	return path

