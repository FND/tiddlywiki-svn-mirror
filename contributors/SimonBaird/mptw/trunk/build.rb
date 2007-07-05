
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'

def get_rev
  `svnversion .`.split(':').last
end

make_tw {
  source_file           'empties/empty.html'
  remove_tiddler        'LegacyStrikeThroughPlugin'
  add_tiddlers_from_dir 'core'
  package_as_from_dir   'misc/MptwLayoutPlugin.js', 'layout'
  store_to_file         'upload/upgrade.html'
  add_tiddlers_from_dir 'noupgrade'
  to_file               'upload/empty.html'

  # make a no layout version
  remove_tiddler        'PageTemplate'
  remove_tiddler        'StyleSheet'
  remove_tiddler        'MptwLayoutPlugin'
  remove_tiddler        'MptwUpgradeURL'
  remove_tiddler        'MptwUpgradeTsURL'
  add_tiddler_from_file('misc/MptwUpgrade.pub')
  add_tiddler_from_file('misc/MptwUpgradeTs.pub')
  remove_tiddler        'ViewTemplate'
  add_tiddler_from_file('layout/MptwViewTemplate.html').rename("ViewTemplate")
  remove_tiddler        'EditTemplate'
  add_tiddler_from_file('layout/MptwEditTemplate.html').rename("EditTemplate")
  to_file               'upload/empty_nolayout.html'
}


# update the main site (new)
#
make_tw {
  # fetches the current site
  source_file           'http://mptw.tiddlyspot.com/'
  copy_all_tiddlers_from('upload/upgrade.html')
  to_file 'upload/index.html'
}

