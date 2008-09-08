import unittest
from tiddlyweb.tiddler import Tiddler

from dirScraper import DirScraper

class DirScraperTestCase(unittest.TestCase):
	def setUp(self):
		self.svn = DirScraper("localhost")

	def tearDown(self):
		pass

	def testInitRequiresHost(self):
		"""__init__ requires host"""
		expected = TypeError
		self.assertRaises(expected, DirScraper)

	def testInitSetsHostURI(self):
		"""__init__ sets host URI"""
		svn = DirScraper("localhost/")
		expected = "localhost/"
		self.assertEqual(expected, svn.host)

	def testInitNormalizesHostURI(self):
		"""__init__ normalizes host URI"""
		expected = "localhost/"
		self.assertEqual(expected, self.svn.host)

	def testGetRetrievesRemoteContent(self):
		"""_get retrieves remote content"""
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js"
		expected = "/***\nlorem\n***/\n"
		self.assertEqual(expected, self.svn._get(uri))

	def testGetPluginsRetrievesJSFiles(self):
		"""getPlugins retrieves .js files from directory"""
		self.svn = DirScraper("http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/")
		uri = "test/foo"
		tiddlers = [t.title for t in self.svn.getPlugins(uri)]
		expected = ["lorem", "sit"]
		self.assertEqual(expected, tiddlers)

	def testGetPluginsSupportsRecursiveRetrieval(self):
		"""getPlugins support recursively retrieving .js files from sub-directories"""
		self.svn = DirScraper("http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/")
		uri = "test"
		tiddlers = [t.title for t in self.svn.getPlugins(uri, True)]
		expected = ["consectetur", "adipisicing", "lorem", "sit"] # N.B.: includes checking for white- and blacklisting
		self.assertEqual(expected, tiddlers)

	def testRetrieveMetadataSetsTitle(self):
		"""retrieveMetadata sets title if present""" # TODO: test missing condition
		tiddler = Tiddler()
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js.meta"
		self.svn.retrieveMetadata(tiddler, uri)
		expected = "lorem"
		self.assertEqual(expected, tiddler.title)

	def testRetrieveMetadataSetsCreated(self):
		"""retrieveMetadata sets created date if present""" # TODO: test missing condition
		tiddler = Tiddler()
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js.meta"
		self.svn.retrieveMetadata(tiddler, uri)
		expected = "200808211445"
		self.assertEqual(expected, tiddler.created)

	def testRetrieveMetadataSetsModified(self):
		"""retrieveMetadata sets modified date if present""" # TODO: test missing condition
		tiddler = Tiddler()
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js.meta"
		self.svn.retrieveMetadata(tiddler, uri)
		expected = "200808211445"
		self.assertEqual(expected, tiddler.modified)

	def testRetrieveMetadataSetsModifier(self):
		"""retrieveMetadata sets modifier if present""" # TODO: test missing condition
		tiddler = Tiddler()
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js.meta"
		self.svn.retrieveMetadata(tiddler, uri)
		expected = "FND"
		self.assertEqual(expected, tiddler.modifier)

	def testRetrieveMetadataSetsTags(self):
		"""retrieveMetadata sets tags if present""" # TODO: test missing condition
		tiddler = Tiddler()
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js.meta"
		self.svn.retrieveMetadata(tiddler, uri)
		expected = ["systemConfig", "tmp"]
		self.assertEqual(expected, tiddler.tags)

if __name__ == "__main__":
	unittest.main()

