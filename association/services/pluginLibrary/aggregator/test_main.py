import os
import shutil
import unittest
import testconfig
import main

from tiddlyweb.store import Store
from tiddlyweb.model.bag import Bag

class getRepositoriesTestCase(unittest.TestCase):
	def setUp(self):
		try:
			shutil.rmtree("/tmp/test/")
		except OSError:
			pass
		os.mkdir("/tmp/test")
		self.source = "/tmp/test/foo"
		f = open(self.source, "w")
		f.write("""
			lorem | ipsum | dolor
			sit | amet | consectetur
		""")
		f.close()
		pass

	def tearDown(self):
		pass

	def testReadsReposList(self):
		"""getRepositories reads repositories list from file"""
		expected = [
			{ "URI": "lorem", "type": "ipsum", "name": "dolor" },
			{ "URI": "sit", "type": "amet", "name": "consectetur" }
		]
		self.assertEqual(expected, main.getRepositories("/tmp/test/foo"))

if __name__ == "__main__":
	unittest.main()
