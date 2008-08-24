import unittest
import utils

class trimURITestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testRemovesTrailingSlash(self):
		"removes trailing slash"
		uri = "http://localhost/"
		expected = "http://localhost"
		self.assertEquals(expected, utils.trimURI(uri))
	def testRemovesURLFragments(self):
		"removes URL fragments"
		uri = "http://localhost/foo#bar"
		expected = "http://localhost/foo"
		self.assertEquals(expected, utils.trimURI(uri))
	def testConvertsURIToLowercase(self):
		"converts URI to lowercase"
		uri = "http://LocalHost/Foo"
		expected = "http://localhost/foo"
		self.assertEquals(expected, utils.trimURI(uri))

class addTrailingSlashTestCase(unittest.TestCase):
	def setUp(self):
		pass
	def tearDown(self):
		pass
	def testAddsTrailingSlash(self):
		"adds trailing slash"
		uri = "http://localhost"
		expected = "http://localhost/"
		self.assertEquals(expected, utils.addTrailingSlash(uri))
	def testDoesNotDuplicateTrailingSlash(self):
		"does not duplicate trailing slash"
		uri = "http://localhost/"
		expected = "http://localhost/"
		self.assertEquals(expected, utils.addTrailingSlash(uri))

if __name__ == '__main__':
	unittest.main()

