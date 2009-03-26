import main

import unittest


class getTiddlersTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testExpectsTiddlyWiki(self):
		"""get_tiddlers throws exception if not passed a TiddlyWiki"""
		doc = "<html></html>"
		actual = [main.get_tiddlers, doc]
		expected = AttributeError
		self.assertRaises(expected, *actual)

	def testReturnsList(self):
		"""get_tiddlers returns empty list if no tiddlers in store"""
		doc = _getTiddlyWiki()
		actual = main.get_tiddlers(doc)
		expected = []
		self.assertEqual(actual, expected)

	def testReturnsTiddlers(self):
		"""get_tiddlers returns Tiddler objects"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main.get_tiddlers(doc)
		actual = tiddlers[0]["title"]
		expected = "Foo"
		self.assertEqual(actual, expected)


class getTiddlerElementsTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testExpectsTiddlyWiki(self):
		"""_get_tiddler_elements throws exception if not passed a TiddlyWiki"""
		doc = "<html></html>"
		actual = [main._get_tiddler_elements, doc]
		expected = AttributeError
		self.assertRaises(expected, *actual)

	def testReturnsList(self):
		"""_get_tiddler_elements returns empty list if no tiddlers in store"""
		doc = _getTiddlyWiki()
		actual = main._get_tiddler_elements(doc)
		expected = []
		self.assertEqual(actual, expected)

	def testReturnsTiddlerItems(self):
		"""_get_tiddler_elements returns one item per tiddler element"""
		doc = _getTiddlyWiki("modern")
		items = main._get_tiddler_elements(doc)
		actual = len(items)
		expected = 2
		self.assertEqual(actual, expected)

	def testReturnsTiddlerNodes(self):
		"""_get_tiddler_elements returns element nodes"""
		doc = _getTiddlyWiki("modern")
		nodes = main._get_tiddler_elements(doc)
		actual = nodes[0].name
		expected = "div"
		self.assertEqual(actual, expected)


class generateTiddlerTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testReturnsTiddler(self):
		"""_generate_tiddler returns Tiddler object"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._generate_tiddler(tiddlers[1])
		expected = {
			"title": "Bar",
			"text": "consectetur adipisicing elit"
		}
		self.assertEqual(actual, expected)


class getTitleTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testExpectsElementNode(self):
		"""_get_title throws exception if not passed an element node"""
		actual = [main._get_text, {}]
		expected = AttributeError
		self.assertRaises(expected, *actual)

	def testReturnsTiddlerContents(self):
		"""_get_title returns tiddler name"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_title(tiddlers[1])
		expected = "Bar"
		self.assertEqual(expected, actual)

	def testSupportsModernStore(self):
		"""_get_title supports modern (v2.2+) store format"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_title(tiddlers[0])
		expected = "Foo"
		self.assertEqual(expected, actual)

	def testSupportsLegacyStore(self):
		"""_get_title supports legacy (pre-v2.2) store format"""
		doc = _getTiddlyWiki("legacy")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_title(tiddlers[0])
		expected = "Foo"
		self.assertEqual(expected, actual)


class getTextTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testExpectsElementNode(self):
		"""_get_text throws exception if not passed an element node"""
		actual = [main._get_text, {}]
		expected = AttributeError
		self.assertRaises(expected, *actual)

	def testReturnsTiddlerContents(self):
		"""_get_text returns tiddler elements' contents"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_text(tiddlers[1])
		expected = "consectetur adipisicing elit"
		self.assertEqual(expected, actual)

	def testSupportsModernStore(self):
		"""_get_text supports modern (v2.2+) store format"""
		doc = _getTiddlyWiki("modern")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_text(tiddlers[0])
		expected = "lorem ipsum\n\ndolor sit\namet"
		self.assertEqual(expected, actual)

	def testSupportsLegacyStore(self):
		"""_get_text supports legacy (pre-v2.2) store format"""
		doc = _getTiddlyWiki("legacy")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_text(tiddlers[1])
		expected = "consectetur adipisicing elit"
		self.assertEqual(expected, actual)

	def testDecodesLegacyTiddlers(self):
		"""_get_text decodes legacy-store tiddlers' contents"""
		doc = _getTiddlyWiki("legacy")
		tiddlers = main._get_tiddler_elements(doc)
		actual = main._get_text(tiddlers[0])
		expected = "lorem ipsum\n\ndolor sit\namet"
		self.assertEqual(expected, actual)


class decodeLegacyTextTestCase(unittest.TestCase):

	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testConvertsLineBreaks(self):
		"""_decode_legacy_text converts line break markers"""
		actual = main._decodeLegacyText(r"foo\nbar")
		expected = "foo\nbar"
		self.assertEqual(expected, actual)

	def testConvertsSpaces(self):
		"""_decode_legacy_text converts space markers"""
		actual = main._decodeLegacyText(r"foo\bbar")
		expected = "foo bar"
		self.assertEqual(expected, actual)

	def testConvertsSlashMarkers(self):
		"""_decode_legacy_text converts slash markers"""
		actual = main._decodeLegacyText(r"foo\sbar")
		expected = "foo\\bar"
		self.assertEqual(expected, actual)

	def testStripsCarriageReturns(self):
		"""_decode_legacy_text removes carriage returns"""
		actual = main._decodeLegacyText("foo\r")
		expected = "foo"
		self.assertEqual(expected, actual)


def _getTiddlyWiki(type="empty"):
	"""
	generate TiddlyWiki document

	@param type (str): empty, modern or legacy
	"""
	if type == "empty":
		uri = "fixtures/tiddlywiki_empty.html"
	elif type == "modern": # modern store format (v2.2+)
		uri = "fixtures/tiddlywiki_modern.html"
	else: # legacy store format (pre-v2.2)
		uri = "fixtures/tiddlywiki_legacy.html"
	f = open(uri)
	doc = f.read() # XXX: use file object?
	f.close()
	return doc


if __name__ == "__main__":
	unittest.main()
