#!/usr/bin/env python
import sys, os, random

# get number of tiddlers to make
number_of_tiddlers = int(sys.argv[1])

# get tiddler structure template
template = open("tiddler_template.html", "r")
tiddler  = "".join(template.readlines())

# define array of possible contents
texts = []
texts.append('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.')
texts.append('Piddly little tiddler')
texts.append('Some other text in a tiddler. Just for testing purposes you understand.')

tags = []
tags.append("<li><a class='tiddlerLink' href='#tiddler:about'>about</a></li>")
tags.append("<li><a class='tiddlerLink' href='#tiddler:help'>help</a></li>")
tags.append("<li><a class='tiddlerLink' href='#tiddler:foo'>foo</a></li>")
tags.append("<li><a class='tiddlerLink' href='#tiddler:bar'>bar</a></li>")

modifier = []
modifier.append('PhilHawksworth')
modifier.append('JimboJones')
modifier.append('AnnOther')
modifier.append('BillyBob')


# for each tiddler to make
for i in range(1, number_of_tiddlers):
	
	# replace placeholders with a rando entry form the data sets	
	tiddler_name = "DummyTiddler_" + str(i)
	t = tiddler.replace('TIDDLER_NAME', tiddler_name)
	t = t.replace('TIDDLER_TEXT', texts[random.randint(0, 2)])
	t = t.replace('TIDDLER_TAGS', tags[random.randint(0, 3)])
	t = t.replace('TIDDLER_MODIFIER', modifier[random.randint(0, 3)])
	
	# save the new tiddler file
	tiddler_out = open(tiddler_name + ".html", "w")
	tiddler_out.write(t);
	
else:
	print 'We made ' + sys.argv[1] + ' tiddlers.'

	
	

