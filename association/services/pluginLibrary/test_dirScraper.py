import unittest

from dirScraper import DirScraper

class DirScraperTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testInitRequiresHost(self):
		self.assertRaises(TypeError, DirScraper)
	def testInitSetsHostURI(self):
		d = DirScraper("localhost/")
		self.assertEquals("localhost/", d.host)
	def testInitNormalizesHostURI(self):
		d = DirScraper("localhost")
		self.assertEquals("localhost/", d.host)

if __name__ == '__main__':
	unittest.main()

