import sys
import unittest
import coverage

def main(args = []):
	modules = [
		"test_dirScraper",
		"test_tiddlywiki",
		"test_utils"
	]
	if len(args) > 1:
		modules = args[1:]
	initCoverage()
	suite = unittest.TestLoader().loadTestsFromNames(modules)
	result = unittest.TextTestRunner().run(suite)
	endCoverage()
	return result.wasSuccessful()

def initCoverage():
	coverage.erase()
	coverage.use_cache(0)
	coverage.start()

def endCoverage():
	coverage.stop()
	import tiddlywiki, dirScraper, utils # TODO: avoid manual listing
	modules = [tiddlywiki, dirScraper, utils] # TODO: avoid manual listing
	coverage.report(modules)

if __name__ == "__main__":
	status = main(sys.argv)
	sys.exit(not status)

