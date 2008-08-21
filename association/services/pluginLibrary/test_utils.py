import unittest
import utils

class TrimURITestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testRemovesTrailingSlash(self):
		uri = "http://localhost/"
		self.assertEquals(utils.trimURI(uri), "http://localhost")
	def testRemovesFragment(self):
		uri = "http://localhost/foo#bar"
		self.assertEquals(utils.trimURI(uri), "http://localhost/foo")
	def testConvertsToLowercase(self):
		uri = "http://LocalHost/Foo"
		self.assertEquals(utils.trimURI(uri), "http://localhost/foo")

if __name__ == '__main__':
	unittest.main()

