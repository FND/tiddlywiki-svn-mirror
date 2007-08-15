
require 'r4tw'

make_tw {
  source_file           'empties/empty.html'
  add_tiddlers_from_dir 'core'
  package_as_from_dir   'misc/MptwLayoutPlugin.js', 'layout'
  add_tiddlers_from_dir 'noupgrade'
  add_tiddlers_from_dir 'framework'


  add_tiddler_from_scratch('tiddler' => 'Mow Lawn', 'tags' => ['Project','Yard','Personal','Active'])
  add_tiddler_from_scratch('tiddler' => 'Remove Stump', 'tags' => ['Project','Yard','Personal','Active'])
  add_tiddler_from_scratch('tiddler' => 'Buy Skis', 'tags' => ['Project','Sports','Personal','Someday/Maybe'])
  add_tiddler_from_scratch('tiddler' => 'Look in phone book for ski shops', 'tags' => ['Action','Next','Personal','Buy Skis'])
  add_tiddler_from_scratch('tiddler' => 'Call tree stumper', 'tags' => ['Action','Next','Personal','Remove Stump'])
  add_tiddler_from_scratch('tiddler' => 'Buy Petrol', 'tags' => ['Action','Next','Personal','Mow Lawn'])
  add_tiddler_from_scratch('tiddler' => 'Clear palm branches', 'tags' => ['Action','Next','Personal','Mow Lawn'])
  add_tiddler_from_scratch('tiddler' => 'Orphan', 'tags' => ['Action','Next','Personal'])


  to_file               'upload/emptydev.html'
}
