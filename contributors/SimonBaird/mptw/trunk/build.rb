
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'

def get_rev
  `svnversion .`.split(':').last
end

make_tw {
  source_file           'empty.html'
  add_tiddlers_from_dir 'core'
  package_as_from_dir   'misc/MptwLayoutPlugin.js', 'layout'
  store_to_file         'upload/upgrade.html'
  add_tiddlers_from_dir 'noupgrade'

  #add_tiddlers_from_file 'misc/Test.divs'

  to_file               'upload/empty.html'
  store_to_divs         'upload/MonkeyPirateTiddlyWiki.tiddler' # for tiddlyspot

  # make a no layout version
  remove_tiddler        'PageTemplate'
  remove_tiddler        'StyleSheet'
  remove_tiddler        'MptwLayoutPlugin'

  remove_tiddler        'ViewTemplate'
  add_tiddler_from_file('layout/MptwViewTemplate.html').rename("ViewTemplate")

  remove_tiddler        'EditTemplate'
  add_tiddler_from_file('layout/MptwEditTemplate.html').rename("EditTemplate")



  to_file               'upload/empty_nolayout.html'
}



