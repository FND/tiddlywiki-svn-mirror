#!/usr/bin/ruby
lib = File.open('../../lib/guid0/guid0.js', 'rb').read
output = File.open('GuidPlugin.js.source', 'rb').read
# plugin = plugin_source.gsub('@@@guid0js@@@', lib)
paths = /@@@(.*?)@@@/.match(output).to_a
paths.shift
paths.to_a.each { |path|
  content = File.open(path, 'rb').read
  output = output.gsub!("@@@#{path}@@@", content)
}
File.open("GuidPlugin.js", 'w') {|f| f.write(output) }

# File.open("GuidPlugin.js", 'w') {|f| f.write(plugin) }
