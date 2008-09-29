"""
wikklytext.store.__init__py: API for wiki storage layer.

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
from wikStore import WikklyItem, makeFSname, WikklyDateTime, \
						tags_split, tags_join
from wikStore_files import wikStore_files
from wikStore_sqlite import wikStore_sqlite
from wikStore_tw import wikStore_tw
from wikQuery import WikklyQueryWords, WikklyQueryRegex

