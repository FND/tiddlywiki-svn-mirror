
require 'r4tw'

make_tw {
  source_file            'http://mptw.tiddlyspot.com/'
  copy_all_tiddlers_from 'upload/upgrade.html'
  tiddlers.each { |t| t.fields['modifier'] = 'MPTW' }
  to_file                'upload/index.html'
}

