import unittest
import dirScraper

class DirScraperTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testInitRequiresHost(self):
		self.assertRaises(TypeError, dirScraper.DirScraper)
	def testInitSetsHost(self):
		d = dirScraper.DirScraper("localhost/")
		self.assertEquals(d.host, "localhost/")
	def testInitAddsHostSlash(self):
		d = dirScraper.DirScraper("localhost")
		self.assertEquals(d.host, "localhost/")

if __name__ == '__main__':
	unittest.main()

