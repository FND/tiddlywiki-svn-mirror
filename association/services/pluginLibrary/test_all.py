import sys
import unittest

import test_dirScraper
import test_tiddlywiki
import test_utils

def main(args = []):
	modules = [
		test_tiddlywiki, 
		test_dirScraper, 
		test_utils
	]
	suites = [unittest.TestLoader().loadTestsFromModule(module) for module in modules]
	suite = unittest.TestSuite(suites)
	result = unittest.TextTestRunner().run(suite)
	return result.wasSuccessful()

if __name__ == "__main__":
	sys.exit(not main(sys.argv))

