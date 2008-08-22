import unittest
import tiddlywiki

class unescapeLineBreaksTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testConvertsNewLineMaker(self):
		text = "foo\\nbar"
		self.assertEquals("foo\nbar", tiddlywiki.unescapeLineBreaks(text))
	def testConvertsSpaceMarker(self):
		text = "foo\\bbar"
		self.assertEquals("foo bar", tiddlywiki.unescapeLineBreaks(text))
	def testConvertsSlashMarker(self):
		text = "foo\\sbar"
		self.assertEquals("foo\\bar", tiddlywiki.unescapeLineBreaks(text))
	def testRemovesCarriageReturn(self):
		text = "foo\r"
		self.assertEquals("foo", tiddlywiki.unescapeLineBreaks(text))

class getSlicesTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testSupportsColonNotation(self):
		text = ("Foo: lorem\n" +
			"Bar: ipsum")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEquals(expected, tiddlywiki.getSlices(text))
	def testSupportsTableNotation(self):
		text = ("|Foo|lorem|\n" +
			"|Bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEquals(expected, tiddlywiki.getSlices(text))
	def testSupportsMixedNotation(self):
		text = ("Foo: lorem\n" +
			"|Bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEquals(expected, tiddlywiki.getSlices(text))
	def testCapitalizesKeys(self): # XXX: deprecated
		text = ("foo: lorem\n" +
			"|bar|ipsum|")
		expected = {
			"Foo": "lorem",
			"Bar": "ipsum"
		}
		self.assertEquals(expected, tiddlywiki.getSlices(text))

class TiddlyWikiTestCase(unittest.TestCase):
	def setUp(self):
		self.tw = tiddlywiki.TiddlyWiki(dummyTiddlyWiki())
	def tearDown(self):
		pass
	def testInitRequiresInput(self):
		self.assertRaises(TypeError, tiddlywiki.TiddlyWiki)
	def testInitCreatesDOM(self):
		self.assertEquals("BeautifulSoup", self.tw.dom.__class__.__name__)
	def testInitCreatesStore(self):
		self.assertEquals("Tag", self.tw.store.__class__.__name__)
	def testGetVersionReturnsVersionFragments(self):
		self.assertEquals([2, 2, 0], self.tw.getVersion())
		legacyTW = tiddlywiki.TiddlyWiki(dummyTiddlyWiki(True))
		self.assertEquals([2, 1, 3], legacyTW.getVersion())

def dummyTiddlyWiki(legacy = False):
	"""
	create dummy TiddlyWiki document

	@param legacy: use legacy store format 
	@type  legacy: bool
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
	if legacy:
		version = """
			var version = {title: "TiddlyWiki", major: 2, minor: 1, revision: 3, date: new Date("Nov 3, 2006"), extensions: {}};"
		"""
		store = """
			<div title="SamplePlugin" tags="systemConfig">/***\\nlorem ipsum dolor sit amet\\n***/\\n//{{{\\nvar foo = "bar";\\n//}}}</div>
		"""
	else:
		version = """
			var version = {title: "TiddlyWiki", major: 2, minor: 2, revision: 0, date: new Date("Jun 5, 2007"), extensions: {}};"
		"""
		store = """
			<div title="SamplePlugin" tags="systemConfig">
				<pre>
					/***
					lorem ipsum dolor sit amet
					***/
					//{{{
					var foo = "bar";
					//}}}
				</pre>
			</div>
		"""
	return template % (version, store)

if __name__ == '__main__':
	unittest.main()

