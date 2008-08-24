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
	reportCoverage(modules)
	return result.wasSuccessful()

def initCoverage():
	coverage.erase()
	coverage.use_cache(0)
	coverage.start()

def endCoverage():
	coverage.stop()

def reportCoverage(testModules):
	modules = [__import__(m[5:]) for m in testModules]
	coverage.report(modules, ignore_errors = 0, show_missing = 1)

if __name__ == "__main__":
	status = main(sys.argv)
	sys.exit(not status)

