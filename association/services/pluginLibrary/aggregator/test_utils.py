import unittest

import utils

class decodePrettyLinkTestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testReturnsLabelAndURI(self):
		"""returns dictionary with label and URI"""
		str = "[[foo|bar]]"
		expected = { "label": "foo", "uri": "bar" }
		self.assertEqual(expected, utils.decodePrettyLink(str))

	def testRaisesValueError(self):
		"""raises ValueError for invalid PrettyLinks"""
		str = "foo"
		expected = ValueError
		self.assertRaises(expected, utils.decodePrettyLink, str)
		str = "foo|bar"
		self.assertRaises(expected, utils.decodePrettyLink, str)
		str = "[[foo]]"
		self.assertRaises(expected, utils.decodePrettyLink, str)

class trimURITestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testRemovesTrailingSlash(self):
		"""removes trailing slash"""
		uri = "http://localhost/"
		expected = "http://localhost"
		self.assertEqual(expected, utils.trimURI(uri))

	def testRemovesURLFragments(self):
		"""removes URL fragments"""
		uri = "http://localhost/foo#bar"
		expected = "http://localhost/foo"
		self.assertEqual(expected, utils.trimURI(uri))

	def testConvertsURIToLowercase(self):
		"""converts URI to lowercase"""
		uri = "http://LocalHost/Foo"
		expected = "http://localhost/foo"
		self.assertEqual(expected, utils.trimURI(uri))

class matchPatternsTestCase(unittest.TestCase):
	def setUp(self):
		pass

	def tearDown(self):
		pass

	def testReturnsFalseForNoMatch(self):
		"""returns False if URI matches none of the given patterns"""
		term = "lorem.js"
		patterns = ["foo", "bar", "baz"]
		self.assertFalse(utils.matchPatterns(term, patterns))

	def testReturnsTrueForAnyMatch(self):
		"""returns True if URI matches any of the given patterns"""
		term = "lorem.js"
		patterns = ["foo", "bar", "*.js"]
		self.assertTrue(utils.matchPatterns(term, patterns))

if __name__ == "__main__":
	unittest.main()
