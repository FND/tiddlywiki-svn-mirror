import unittest

from dirScraper import DirScraper

class DirScraperTestCase(unittest.TestCase):
	def setUp(self):
		self.svn = DirScraper("localhost")
	def tearDown(self):
		pass
	def testInitRequiresHost(self):
		"__init__ requires host"
		expected = TypeError
		self.assertRaises(expected, DirScraper)
	def testInitSetsHostURI(self):
		"__init__ sets host URI"
		svn = DirScraper("localhost/")
		expected = "localhost/"
		self.assertEquals(expected, svn.host)
	def testInitNormalizesHostURI(self):
		"__init__ normalizes host URI"
		expected = "localhost/"
		self.assertEquals(expected, self.svn.host)
	def testGetRetrievesRemoteContent(self):
		"_get retrieves remote content"
		uri = "http://svn.tiddlywiki.org/Trunk/association/services/pluginLibrary/test/foo/lorem.js"
		expected = "/***\nlorem\n***/\n"
		self.assertEquals(expected, self.svn._get(uri))

if __name__ == '__main__':
	unittest.main()

