import re

from BeautifulSoup import BeautifulSoup, Tag

from utils import trimURI

def unescapeLineBreaks(text): # TODO: rename
	"""
	unescape line breaks

	@param text (str): original text
	@return (str): converted text
	"""
	return text.replace("\\n", "\n").replace("\\b", " ").replace("\\s", "\\").replace("\r", "")

def getSlices(text): # TODO: should be in Tiddler class
	"""
	retrieve plugin meta-slices

	@param text (str): tiddler text
	"""
	pattern = r"(?:^([\'\/]{0,2})~?([\.\w]+)\:\1\s*([^\n]+)\s*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|\s*([^\|\n]+)\s*\|$)" # RegEx origin: TiddlyWiki core
	pattern = re.compile(pattern, re.M + re.I) # XXX: enhance efficiency by moving to class attribute to prevent re-compiling
	matches = pattern.findall(text)
	slices = {}
	for match in matches:
		if match[1]: # colon notation
			slices[match[1].capitalize()] = match[2] # XXX: shouldn't capitalize here
		else: # table notation
			slices[match[4].capitalize()] = match[5] # XXX: shouldn't capitalize here
	return slices

class TiddlyWiki:
	"""
	utility functions for processing TiddlyWiki documents
	"""
	def __init__(self, html):
		"""
		@param html (str): TiddlyWiki document
		@return: None
		"""
		self.dom = BeautifulSoup(html)
		self.store = self.dom.find("div", id = "storeArea")

	def getPluginTiddlers(self, repo): # XXX: universal-ize; rename to getTiddlers() and use key-value pair(s?) for matching attribute(s?)
		"""
		retrieve plugin tiddlers

		@param repo (str): current repository
		@return (str): plugin tiddlers (pure-store format)
		"""
		tag = "systemConfig" # includes "systemConfigDisable" -- XXX: include systemTheme tiddlers?
		# remove non-plugin tiddlers
		[tiddler.extract() for tiddler in self.store.findChildren("div", title = True)
			if (not tiddler.has_key("tags")) or (tag not in tiddler["tags"])]
		# remove non-originating plugins
		self.removeDuplicates(repo["URI"])
		# return pure-store format
		return "<html><body><div id='storeArea'>" + self.store.renderContents() + "</div></body></html>" # TODO: return list of tiddler objects

	def removeDuplicates(self, repo): # XXX: rename!?
		"""
		remove plugins whose origin is not the repository specified

		@param repo (str): repository URL
		@return: None
		"""
		repo = trimURI(repo)
		for plugin in self.store.findChildren("div", title = True):
			slices = getSlices(plugin.pre.renderContents())
			if slices.has_key("Source"): # N.B.: plugin accepted if Source slice not present -- XXX: harmful? (e.g. includes simple config tweaks)
				source = trimURI(slices["Source"])
				if source != repo:
					plugin.extract()

	def getVersion(self):
		"""
		retrieve TiddlyWiki version number

		@return (list): version number (major, minor, revision)
		@raise ValueError: invalid TiddlyWiki version
		"""
		version = self.dom.html.head.script.renderContents()
		pattern = re.compile(r"major: (\d+), minor: (\d+), revision: (\d+)") # XXX: enhance efficiency by moving to class attribute to prevent re-compiling
		matches = pattern.search(version)
		if matches:
			major = int(matches.groups()[0])
			minor = int(matches.groups()[1])
			revision = int(matches.groups()[2])
			return [major, minor, revision]
		else:
			raise ValueError("invalid TiddlyWiki version") # TODO

	def convertStoreFormat(self):
		"""
		convert legacy to canonical store format

		@return: None
		"""
		version = self.getVersion()
		if version and (version[0] + (version[1] / 10.0) < 2.2): # N.B.: works because all pre-v2.2 releases are known
			for tiddler in self.store.findChildren("div", tiddler = True):
				# convert tiddler attribute to title attribute
				tiddler["title"] = tiddler["tiddler"]
				del(tiddler["tiddler"])
				# unescape line breaks
				tiddler.contents[0].replaceWith(unescapeLineBreaks(tiddler.contents[0])) # XXX: use of contents[0] hacky?
				# add PRE wrapper
				pre = Tag(self.dom, "pre")
				pre.contents = tiddler.contents
				tiddler.contents = [pre]
