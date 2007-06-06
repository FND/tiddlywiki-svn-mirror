
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'

def get_rev
  `svnversion .`.split(':').last
end

# using 2.2 empty
#
make_tw {
  source_file           'empty22.html'
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

# using 2.1 empty
#

exit

make_tw {
  source_file           'empty.html'
  add_tiddlers_from_dir 'core'
  package_as_from_dir   'misc/MptwLayoutPlugin.js', 'layout'
  add_tiddlers_from_dir 'noupgrade'
  to_file               'upload/empty21.html'

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
  to_file               'upload/empty21_nolayout.html'
}


