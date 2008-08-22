import sys
import unittest

def main(args = []):
	modules = [
		"test_dirScraper",
		"test_tiddlywiki",
		"test_utils"
	]
	if len(args) > 1:
		modules = args[1:]
	suites = unittest.TestLoader().loadTestsFromNames(modules)
	result = unittest.TextTestRunner().run(suites)
	return result.wasSuccessful()

if __name__ == "__main__":
	sys.exit(not main(sys.argv))

