import unittest
import dirScraper

class DirScraperTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testInitRequiresHost(self):
		self.assertRaises(TypeError, dirScraper.DirScraper)
	def testInitSetsHostURI(self):
		d = dirScraper.DirScraper("localhost/")
		self.assertEquals("localhost/", d.host)
	def testInitNormalizesHostURI(self):
		d = dirScraper.DirScraper("localhost")
		self.assertEquals("localhost/", d.host)

if __name__ == '__main__':
	unittest.main()

