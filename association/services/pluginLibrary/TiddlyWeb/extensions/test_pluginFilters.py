import unittest
import testconfig

from textwrap import dedent
from tiddlyweb.tiddler import Tiddler
from pluginFilters import filterByDocumentation, filterByCode

class filterByDocumentationTestCase(unittest.TestCase):
	def setUp(self):
		self.tiddlers = [
			Tiddler(title = "foo"),
			Tiddler(title = "bar"),
			Tiddler(title = "baz")
		]
		for tiddler in self.tiddlers:
			tiddler.text = "lorem ipsum dolor sit amet"

	def tearDown(self):
		pass

	def testSearchesWithinDocumentationSection(self):
		"""filterByDocumentation searches within documentation section"""
		self.tiddlers[1].text = dedent("""
			/***
			foo bar baz
			***/
		""")
		query = "bar"
		expected = [self.tiddlers[1]]
		self.assertEqual(expected, filterByDocumentation(query, self.tiddlers))

	def testSearchesDocumentationSectionOnly(self):
		"""filterByDocumentation does not search outside documentation section"""
		self.tiddlers[1].text = dedent("""
			/***
			lorem ipsum dolor sit amet
			***/
			foo bar baz
		""")
		query = "bar"
		expected = []
		self.assertEqual(expected, filterByDocumentation(query, self.tiddlers))

# DEBUG'd -- XXX: fails -- TODO: should multiple documentation sections be supported?
#	def testSearchesMultipleDocumentationSections(self):
#		"""filterByDocumentation searches multiple documentation sections"""
#		self.tiddlers[1].text = dedent("""
#			/***
#			lorem ipsum dolor sit amet
#			***/
#			lorem ipsum dolor sit amet
#			/***
#			foo bar baz
#			***/
#			lorem ipsum dolor sit amet
#		""")
#		query = "bar"
#		expected = [self.tiddlers[1]]
#		self.assertEqual(expected, filterByDocumentation(query, self.tiddlers))

# DEBUG'd -- TODO
#class filterByCodeTestCase(unittest.TestCase):
#	def setUp(self):
#		pass
#
#	def tearDown(self):
#		pass
#
#	def testDummy(self): # TODO
#		"""TBD"""
#		pass

if __name__ == "__main__":
	unittest.main()
