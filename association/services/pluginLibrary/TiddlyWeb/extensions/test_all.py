import sys
import testconfig
import testsuite

def main(args):
	modules = [
		"test_pluginFilters"
	]
	if len(args) > 1:
		modules = args[1:]
	return testsuite.run(modules)

if __name__ == "__main__":
	status = main(sys.argv)
	sys.exit(not status)
