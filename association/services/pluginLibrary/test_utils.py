import unittest
import utils

class trimURITestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testRemovesTrailingSlash(self):
		uri = "http://localhost/"
		self.assertEquals("http://localhost", utils.trimURI(uri))
	def testRemovesFragment(self):
		uri = "http://localhost/foo#bar"
		self.assertEquals("http://localhost/foo", utils.trimURI(uri))
	def testConvertsToLowercase(self):
		uri = "http://LocalHost/Foo"
		self.assertEquals("http://localhost/foo", utils.trimURI(uri))

class addTrailingSlashTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testAddsTrailingSlash(self):
		uri = "http://localhost"
		self.assertEquals("http://localhost/", utils.addTrailingSlash(uri))
	def testDoesNotDuplicateTrailingSlash(self):
		uri = "http://localhost/"
		self.assertEquals("http://localhost/", utils.addTrailingSlash(uri))

if __name__ == '__main__':
	unittest.main()

