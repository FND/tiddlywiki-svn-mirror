def remoteFileExists?(url)
	url = URI.parse(url)
	Net::HTTP.start(url.host, url.port) do |http|
		return http.head(url.request_uri).code == "200"
	end
end

def fileExists?(file)
	if file =~ /^https?/
		r = remoteFileExists?(file)	
	else
		r = File.exist?(file)	
	end
	r
end

def cook(recipe,output=nil,opts={})

  options = {
      'root'  => 'http://svn.tiddlywiki.org/Trunk',
      'quiet' => true,
      'format' => '',
      'section' => '',
      'ignorecopy' => false,
      'compress' => '',
      'splash' => false,
      'keepallcomments' => false,
      'stripcomments' => false,
      'destination' => nil,
      'outputstring' => false
    }
    
	if(!fileExists?(recipe))
		STDERR.puts("ERROR - File '#{recipe}' does not exist.")
		exit
	end

  opts.each do |key,value|
      options[key] = value
  end

  require 'recipe'
  Tiddler.format = options['format']
  Recipe.quiet = options['quiet']
  Recipe.section = options['section']
  Recipe.root = options['root']
  Recipe.splash = options['splash']
  Recipe.ignorecopy = options['ignorecopy']
  Recipe.outputstring = options['outputstring']
  Ingredient.compress = options['compress'].strip
  Ingredient.keepallcomments = options['keepallcomments']
  Ingredient.stripcomments = options['stripcomments']
  Tiddler.ginsu = false
  
  myrecipe = Recipe.new(recipe,options['destination'])
  myrecipe.scanrecipe
  tiddlywikistring = myrecipe.cook
  #tiddlywikistring.length
end

puts cook('../../verticals/ripplerap.com/index.html.recipe','',{'ignorecopy'=>true, 'outputstring'=>false})

#better error handling when file does not exist
# better error handling where I used +=