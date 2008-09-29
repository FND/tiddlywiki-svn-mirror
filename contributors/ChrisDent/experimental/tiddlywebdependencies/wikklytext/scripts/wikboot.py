"""
Bootstrap wiki loader for mod_python or standalone use.

To use: 
	Add bootstrapper to your wiki folder (i.e. "/MY/WIKI/PATH"):
		cd /MY/WIKI/PATH
		wik makeboot
		
	Point Apache to the wiki (i.e. inside a VirtualHost container):
	
		DocumentRoot "/MY/WIKI/PATH"
		LogLevel warn
		<Location />
			PythonPath "sys.path + [r'/MY/WIKI/PATH']"
			SetHandler python-program
			PythonHandler cherrypy._cpmodpy::handler
			PythonOption cherrypy.setup wikboot::start_modpython
			PythonDebug On
			# I recommend using this next line to give your wiki instance
			# a unique name. This avoids weird problems caused by mod_python caching.
			PythonInterpreter MY_WIKI_NAME
		</Location>

	** NOTE: If Location is NOT <Location />, edit WEBPATH below.
	
	You can also run as a standalone server for testing:
		cd /MY/WIKI/PATH
		python wikboot.py
-----------------------------------------------------------------------------------
Copyright (C) 2007,2008 Frank McIngvale

Contact: fmcingvale@boodebr.org

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
"""

# for mod_python: path where wiki is visible (typically this
# will match your <Location /MY/PATH> path).
WEBPATH = "/"

import wikklytext.scripts.wikserve as ws
import os

# this file must be placed in the wiki folder
wikipath = os.path.split(os.path.abspath(__file__))[0]

# entry point for mod_python to call
def start_modpython():	
	ws.run_modpython(wikipath, WEBPATH)

# start as standalone CherryPy server (good for testing)
if __name__ == '__main__':
	ws.run_standalone(wikipath)

