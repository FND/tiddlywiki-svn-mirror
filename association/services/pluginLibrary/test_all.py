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
	runner = unittest.TextTestRunner(sys.stdout)
	results = runner.run(suite)
	endCoverage()
	reportCoverage(modules)
	reportTests(modules)
	return results.wasSuccessful()

def initCoverage():
	coverage.erase()
	coverage.use_cache(0)
	coverage.start()

def endCoverage():
	coverage.stop()

def reportCoverage(testModules):
	modules = [__import__(m[5:]) for m in testModules]
	coverage.report(modules, ignore_errors = 0, show_missing = 1)

def reportTests(testModules): # TODO: simplify!?
	modules = [m for m in sys.modules.values()
		if hasattr(m, "__name__") and m.__name__ in testModules] # TODO: use [__import__(m) for m in testModules]?
	for module in modules:
		print "\n%s %s %s" % ("*" * 5, module.__name__, "*" * 5)
		testCases = [getattr(module, attr) for attr in dir(module) if attr.endswith("TestCase")]
		for testCase in testCases:
			methods = [getattr(testCase, attr) for attr in dir(testCase) if attr.startswith("test")]
			for method in methods:
				print "%s%s %s" % (testCase.__name__[:-8], ":", method.__doc__.strip()) # TODO: link with failures/errors

if __name__ == "__main__":
	status = main(sys.argv)
	sys.exit(not status)

