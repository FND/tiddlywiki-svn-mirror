

$LOAD_PATH << "../r4tw"
require 'r4tw'

def get_rev
  `svnversion .`.split(':').last
end

make_tw {
  source_file            '../mptw/upload/empty.html'
  add_tiddlers_from_dir  'core'
  add_tiddlers_from_dir  'noupdate'
  add_tiddlers_from_file 'setup.divs'
  to_file                'upload/mgtd1empty.html'
}

