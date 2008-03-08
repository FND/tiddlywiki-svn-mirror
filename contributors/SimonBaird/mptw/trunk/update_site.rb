
require 'r4tw'

make_tw {
  source_file            'http://mopi.tiddlyspot.com/'
  copy_all_tiddlers_from 'upload/upgrade.html'
  tiddlers.each { |t| t.fields['modifier'] = 'Mopi' }
  to_file                'upload/index.html'
}

