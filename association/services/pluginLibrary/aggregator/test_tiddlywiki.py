import unittest
import copy
import tiddlywiki

class decodeTiddlerTextTestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testConvertsNewLineMakers(self):
		"""converts new-line markers"""
		text = "foo\\nbar"
		expected = "foo\nbar"
		self.assertEqual(expected, tiddlywiki.decodeTiddlerText(text))

	def testConvertsSpaceMarkers(self):
		"""converts space markers"""
		text = "foo\\bbar"
		expected = "foo bar"
		self.assertEqual(expected, tiddlywiki.decodeTiddlerText(text))

	def testConvertsSlashMarkers(self):
		"""converts slash markers"""
		text = "foo\\sbar"
		expected = "foo\\bar"
		self.assertEqual(expected, tiddlywiki.decodeTiddlerText(text))

	def testRemovesCarriageReturns(self):
		"""removes carriage returns"""
		text = "foo\r"
		expected = "foo"
		self.assertEqual(expected, tiddlywiki.decodeTiddlerText(text))

class getSlicesTestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testSupportsColonNotation(self):
		"""supports colon notation"""
		text = "Foo: lorem\nBar: ipsum"
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEqual(expected, tiddlywiki.getSlices(text))

	def testSupportsTableNotation(self):
		"""supports table notation"""
		text = ("|Foo|lorem|\n|Bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEqual(expected, tiddlywiki.getSlices(text))

	def testSupportsMixedNotation(self):
		"""supports mixed notation"""
		text = ("Foo: lorem\n|Bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEqual(expected, tiddlywiki.getSlices(text))

	def testCapitalizesSliceNames(self): # XXX: deprecated
		"""capitalizes slice names"""
		text = ("foo: lorem\n" +
			"|bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEqual(expected, tiddlywiki.getSlices(text))

class TiddlyWikiTestCase(unittest.TestCase):
	def setUp(self):
		self.tw = tiddlywiki.TiddlyWiki(dummyTiddlyWiki())
		self.repo = {
			"name": "SampleRepo",
			"URI": "localhost"
		}

	def tearDown(self):
		pass

	def testInitRequiresInput(self):
		"""__init__ requires input"""
		expected = TypeError
		self.assertRaises(expected, tiddlywiki.TiddlyWiki)

	def testInitCreatesDOM(self):
		"""__init__ creates DOM"""
		expected = "BeautifulSoup"
		self.assertEqual(expected, self.tw.dom.__class__.__name__)

	def testInitCreatesStore(self):
		"""__init__ creates store"""
		expected = "Tag"
		self.assertEqual(expected, self.tw.store.__class__.__name__)

	def testGetPluginTiddlersExpectsRepository(self):
		"""getPluginTiddlers expects repository"""
		expected = TypeError
		self.assertRaises(expected, self.tw.getPluginTiddlers)

	def testGetPluginTiddlersReturnsPureStore(self):
		"""getPluginTiddlers returns tiddlers in pure-store format"""
		tiddler = """\n<div title="SampleHack" tags="systemConfig">\n<pre>
//{{{
var foo = "bar";
//}}}
				</pre>\n</div>"""
		expected = "<html><body><div id='storeArea'>\n%s\n</div></body></html>" % tiddler
		self.assertEqual(expected, self.tw.getPluginTiddlers(self.repo))

	def testRemoveDuplicatesExpectsRepository(self):
		"""removeDuplicates expects repository"""
		expected = TypeError
		self.assertRaises(expected, self.tw.removeDuplicates)

	def testRemoveDuplicatesIgnoresPluginsMissingSourceSlice(self):
		"""removeDuplicates skips plugins missing Source slice"""
		expected = copy.deepcopy(self.tw.store)
		expected.findChild("div", title = "SamplePlugin").extract() # ignore plugin with dummy Source slice
		self.tw.removeDuplicates(self.repo["URI"])
		self.assertEqual(expected, self.tw.store)

	def testRemoveDuplicatesIgnoresPluginsWithMatchingSourceSlice(self):
		"""removeDuplicates ignores plugins where Source slice does contain repository"""
		expected = copy.deepcopy(self.tw.store)
		self.tw.removeDuplicates("http://example.com")
		self.assertEqual(expected, self.tw.store)

	def testRemoveDuplicatesRemovesPluginsWithNonMatchingSourceSlice(self):
		"""removeDuplicates removes plugins where Source slice does not contain repository"""
		expected = copy.deepcopy(self.tw.store)
		expected.findChild("div", title = "SamplePlugin").extract()
		self.tw.removeDuplicates(self.repo["URI"])
		self.assertEqual(expected, self.tw.store)

	def testGetVersionReturnsVersionFragments(self):
		"""getVersion returns version fragments"""
		expected = (2, 3, 0)
		self.assertEqual(expected, self.tw.getVersion())
		legacyTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki("legacy"))
		expected = (2, 1, 3)
		self.assertEqual(expected, legacyTW.getVersion())

	def testGetVersionRaisesValueErrorForMissingVersion(self):
		"""getVersion raises ValueError if version information is missing"""
		blankTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki("blank"))
		expected = ValueError
		self.assertRaises(expected, blankTW.getVersion)

	def testConvertStoreFormatConvertsTiddlerAttribute(self):
		"""convertStoreFormat converts tiddler to title attribute"""
		legacyTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki("legacy"))
		legacyTW.convertStoreFormat()
		plugins = legacyTW.store.findChildren("div")
		result = True
		for plugin in plugins:
			result = result and plugin.has_key("title") and not plugin.has_key("tiddler")
		self.assertTrue(result)

	def testConvertStoreFormatAddsWrapper(self):
		"""convertStoreFormat adds PRE wrapper to tiddler contents"""
		legacyTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki("legacy"))
		legacyTW.convertStoreFormat()
		plugins = legacyTW.store.findChildren("div")
		result = True
		for plugin in plugins:
			result = result and plugin.findChild("pre")
		self.assertTrue(result)

	def testConvertStoreFormatUnescapesTiddlerContents(self):
		"""convertStoreFormat unescapes tiddler contents"""
		legacyTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki("legacy"))
		legacyTW.convertStoreFormat()
		plugin = legacyTW.store.findChild("div", title = "SamplePlugin").findChild("pre").renderContents().strip() # XXX: stripping whitespace is cheating
		expected = self.tw.store.findChild("div", title = "SamplePlugin").findChild("pre").renderContents().strip()
		self.assertEquals(expected, plugin)

def dummyTiddlyWiki(type = "canonical"):
	"""
	create dummy TiddlyWiki document

	@param type: document type (blank, legacy, canonical)
	@type  type: str
	@return: TiddlyWiki document
	@rtype : str
	"""
	template = """
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<meta name="copyright" content="TiddlyWiki created by Jeremy Ruston, (jeremy [at] osmosoft [dot] com)" />
			<title>TiddlyWiki Dummy</title>
			<script type="text/javascript">
				//<![CDATA[
				%s
				//]]>
			</script>
		</head>

		<body>
			<div id="copyright">
				Welcome to TiddlyWiki created by Jeremy Ruston, Copyright &copy; 2007 UnaMesa Association
			</div>
				<div id="storeArea">
					%s
				</div>
			</div>
		</body>

		</html>
	"""
	if type == "blank":
		version = ""
		store = ""
	if type == "legacy":
		version = """
			var version = {title: "TiddlyWiki", major: 2, minor: 1, revision: 3, date: new Date("Nov 3, 2006"), extensions: {}};"
		"""
		store = """
			<div tiddler="SamplePlugin" tags="systemConfig">/***\\n|''Source''|http://example.com#SamplePlugin|\\nlorem ipsum dolor sit amet\\n***/\\n//{{{\\nvar foo = "bar";\\n//}}}</div>
			<div tiddler="SampleHack" tags="systemConfig">//{{{\\nvar foo = "bar";\\n//}}}</div>
		"""
	elif type == "canonical":
		version = """
			var version = {title: "TiddlyWiki", major: 2, minor: 3, revision: 0, date: new Date("Jun 5, 2007"), extensions: {}};"
		"""
		store = """
			<div title="SamplePlugin" tags="systemConfig">
				<pre>
/***
|''Source''|http://example.com#SamplePlugin|
lorem ipsum dolor sit amet
***/
//{{{
var foo = "bar";
//}}}
				</pre>
			</div>
			<div title="SampleHack" tags="systemConfig">
				<pre>
//{{{
var foo = "bar";
//}}}
				</pre>
			</div>
		"""
	return template % (version, store)

if __name__ == "__main__":
	unittest.main()
