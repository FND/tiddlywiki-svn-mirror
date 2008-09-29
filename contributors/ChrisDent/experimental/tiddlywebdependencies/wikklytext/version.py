"""
Various defines giving program name, version #, etc.
"""

NAME = "WikklyText"
AUTHOR = 'Frank McIngvale'

AUTHOR_EMAIL = "fmcingvale@boodebr.org"

MAJOR = 1
MINOR = 2
SUBVER = 2
EXTRA = ""

if len(EXTRA):
	VSTR = "%d.%d.%d%s" % (MAJOR,MINOR,SUBVER,EXTRA)
else:
	VSTR = "%d.%d.%d" % (MAJOR,MINOR,SUBVER)
	

