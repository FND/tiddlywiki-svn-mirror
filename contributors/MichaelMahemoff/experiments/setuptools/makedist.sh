#!/bin/bash
# referencing http://docs.python.org/distutils/introduction.html

# make a simple tarball with setup in it
python setup.py sdist

# make a windows installer exe
python setup.py bdist_wininst

# make a RPM - needs rpm in the PATH
# python setup.py bdist_rpm

# see all formats available
python setup.py bdist --help-formats
