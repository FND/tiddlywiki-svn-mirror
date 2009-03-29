#!/usr/bin/env python

"""
Python test suite

requires unittest and coverage

Usage:
 $ python testsuite.py [modules]

TODO:
* make coverage optional
* strip .py extension from module names
* read modules from directory listing
"""


import sys
import unittest
import coverage


def main(args):
	modules = []
	if len(args) > 1:
		modules = args[1:]
	return run(modules)


def run(modules):
	"""
	run test suite on given modules

	test modules must be named after their respective parent modules,
	using the prefix "test_" (e.g. "foo" :: "test_foo")

	@param modules (list): module names
	@return (bool): success
	"""
	testModules = ["test_" + module for module in modules]
	initCoverage()
	suite = unittest.TestLoader().loadTestsFromNames(testModules)
	runner = unittest.TextTestRunner(sys.stdout, verbosity=2)
	results = runner.run(suite)
	endCoverage()
	print "\n%s\n" % ("=" * 70)
	reportCoverage(modules)
	print
	return results.wasSuccessful()


def initCoverage():
	coverage.erase()
	coverage.use_cache(0)
	coverage.start()


def endCoverage():
	coverage.stop()


def reportCoverage(modules):
	"""
	report test coverage for given modules

	@param modules (list): module names
	"""
	modules = [__import__(module) for module in modules]
	coverage.report(modules, ignore_errors=0, show_missing=1)


class TestCase(unittest.TestCase):
	"""
	alternative test case which aborts after the first failure
	"""

	def run(self, result=None):
		if result.failures or result.errors:
			print "aborted"
		else:
			super(TestCase, self).run(result)


if __name__ == "__main__":
	status = main(sys.argv)
	sys.exit(not status)
