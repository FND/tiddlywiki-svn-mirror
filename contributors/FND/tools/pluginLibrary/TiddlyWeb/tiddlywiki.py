import re

def normalizeURL(URL):
	"""
	strip non-essential trailing characters from URL

	@param URL: URL
	@type  URL: str
	@return: uniform URL
	@rtype : str
	"""
	URL = URL.split("#", 1)[0]
	URL = URL.rstrip("/")
	return URL

def unescapeLineBreaks(text):
	"""
	unescape line breaks

	@param text: original text
	@type  text: str
	@return: converted text
	@rtype : str
	"""
	return text.replace("\\n", "\n").replace("\\b", " ").replace("\\s", "\\").replace("\r", "")

class TiddlyWiki:
	"""
	utility functions for processing TiddlyWiki documents
	"""
	def __init__(self, html):
		"""
		@param html: TiddlyWiki document
		@type  html: str
		@return: None
		"""
		from BeautifulSoup import BeautifulSoup # DEBUG: move to top of module? use demandload (cf. bzr or snakeoil; http://www.pkgcore.org/trac/pkgcore/browser/snakeoil/snakeoil/demandload.py)?
		self.html = html
		self.dom = BeautifulSoup(html)
		self.store = self.dom.find("div", id="storeArea")

	def getPluginTiddlers(self, repo): # DEBUG: universal-ize; rename to getTiddlers() and use key-value pair(s?) for matching attribute(s?)
		"""
		retrieve plugin tiddlers

		@param repo: current repository
		@type  repo: dict
		@return: plugin tiddlers (pure-store format)
		@rtype : str
		"""
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
		for plugin in self.store.findChildren("div", title=True):
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

		@return: version number (major, minor, revision)
		@rtype : list or None
		"""
		version = self.dom.html.head.script.renderContents()
		pattern = re.compile("major: (\d+), minor: (\d+), revision: (\d+)")
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
		if version and (version[0] + (version[1] / 10.0) < 2.2): # N.B.: works because all pre-v2.2 releases are known
			for tiddler in self.store.findChildren("div", tiddler=True):
				# convert tiddler attribute to title attribute
				tiddler["title"] = tiddler["tiddler"]
				del(tiddler["tiddler"])
				# unescape line breaks
				tiddler.contents[0].replaceWith(unescapeLineBreaks(tiddler.contents[0]))

