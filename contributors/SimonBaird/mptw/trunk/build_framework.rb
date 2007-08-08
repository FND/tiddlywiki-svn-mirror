
require 'r4tw'

make_tw {
  source_file           'empties/empty.html'
  add_tiddlers_from_dir 'core'
  package_as_from_dir   'misc/MptwLayoutPlugin.js', 'layout'
  add_tiddlers_from_dir 'noupgrade'
  add_tiddlers_from_dir 'framework'
  to_file               'upload/emptydev.html'
}
