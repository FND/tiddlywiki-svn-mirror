# recipe.rb

# Copyright (c) UnaMesa Association 2004-2008
# License: Creative Commons Attribution ShareAlike 3.0 License http://creativecommons.org/licenses/by-sa/3.0/

require 'ingredient'
require "ftools"
require 'net/http'
require 'uri'

class Recipe
	def initialize(filename, outdir=nil, isTemplate=false)
		@filename = filename
		@outdir = outdir ||= ""
		@ingredients = Array.new
		@addons = Hash.new
		@tiddlers = Hash.new
		@dirname = File.dirname(filename)
		@scan = true # two pass cook - first pass is a scan
		open(filename) do |file|
			file.each_line { |line| genIngredient(@dirname, line, isTemplate) }
		end
		cook(@scan)
	end

	def cook(scan=false)
		@scan = scan
		puts "Creating file: " + outfilename if !@scan
		if(@ingredients.length > 0)
			File.open(outfilename, File::CREAT|File::TRUNC|File::RDWR, 0644) do |out|
				@ingredients.each do |ingredient|
					if(ingredient.type == "list")
						if(!@scan && ingredient.filename=="title")
							# write the title from the shadow tiddlers if available
							title = ""
							if(@tiddlers["SiteTitle"])
								title << @tiddlers["SiteTitle"].contents
								if(@tiddlers["SiteSubtitle"])
									title << " - "
								end
							end
							if(@tiddlers["SiteSubtitle"])
								title << @tiddlers["SiteSubtitle"].contents
							end
							out << title + "\n" if title
						end
						if(Ingredient.compress=~/[PR]+/ && ingredient.filename == "js")
							block = ""
							if(@addons.has_key?(ingredient.filename))
								@addons.fetch(ingredient.filename).each do |ingredient| 
									block += writeToDish(block, ingredient)
								end
							end
							if(Ingredient.compress=~/[PR]+/)
								block = Ingredient.rhino(block)
								if(Ingredient.compress=~/.?P.?/)
									block = Ingredient.packr(block)
								end
							end
							out << block
						else
							if(@addons.has_key?(ingredient.filename))
								@addons.fetch(ingredient.filename).each{ |ingredient| writeToDish(out, ingredient) }
							end
						end
					else
						writeToDish(out, ingredient)
					end
				end
			end
		end
		@addons.fetch("copy", Array.new).each { |ingredient| copyFile(ingredient) } if !@scan
	end

	def Recipe.quiet
		@@quiet
	end

	def Recipe.quiet=(quiet)
		@@quiet = quiet
	end

protected
	def outdir
		@outdir.empty? ? "" : File.join(@outdir, "")
	end

	def outfilename
		outdir + File.basename(@filename.sub(".recipe", ""))
	end

	def ingredients
		@ingredients
	end

	def addons
		@addons
	end

	def genIngredient(dirname, line, isTemplate=false)
		if(isTemplate)
			if(line =~ /<!--@@.*@@-->/)
				@ingredients << Ingredient.new(line.strip.slice(6..-6), "list")
			elsif(line =~ /&lt;!--@@.*@@--&gt;/)
				@ingredients << Ingredient.new(line.strip.slice(9..-9), "list")
			elsif(line =~ /<!--<<.*>>-->/)
				item = line.strip.slice(6..-6)
				c = item.index(' ')
				if(c != nil)
					item = item[(c + 1)...item.length].strip
				end
				@ingredients << Ingredient.new(item, "list")
			else
				@ingredients << Ingredient.new(line.sub("\r", ""), "tline")
			end
		else
			if(line.strip == "" || line[0, 1]=='#')
				return
			end
			if(line =~ /@.*@/)
				@ingredients << Ingredient.new(line.strip.slice(1..-2), "list")
			elsif(line =~ /template\:/)
				value = line.sub(/template\:/, "").strip
				path = value =~ /^https?/ ? "" : dirname
				loadSubrecipe(File.join(path, value),true)
			elsif(line =~ /recipe\:/)
				value = line.sub(/recipe\:/, "").strip
				unless value =~ /^https?/
					loadSubrecipe(File.join(dirname, value),false)
				else
					loadSubrecipe(value,false)
				end
				
			elsif(line =~ /\:/)
				c = line.index(':')
				key = line[0, c].strip
				value = line[(c + 1)...line.length].strip
				c = value.index(' ')
				if(c != nil)
					attributes = value[(c + 1)...value.length].strip
					value = value[0, c].strip
				end
				file = value =~ /^https?/ ? value : File.join(dirname,value)
				addAddOns(key, file, attributes)
				loadSubrecipe(file + ".deps",false) if File.exists?(file + ".deps")
			else
				file = File.join(dirname, line.chomp)
				@ingredients << Ingredient.new(file, "line")
				loadSubrecipe(file + ".deps",false) if(File.exists?(file + ".deps"))
			end
		end
	end

	def loadSubrecipe(subrecipename, isTemplate)
		recipe = Recipe.new(subrecipename, @outdir, isTemplate)
		@ingredients = @ingredients + recipe.ingredients
		recipe.addons.each { |key, value| addAddOns(key, value) }
	end

	def addAddOns(key, value, attributes=nil)
		addonarray = @addons.fetch(key, Array.new)
		if(value.class == Array)
			addonarray = addonarray + value
		elsif(value.class == Ingredient)
			addonarray.push(value)
		else
			ingredient = Ingredient.new(value, key, attributes)
			addonarray.push(ingredient)
		end
		@addons.store(key, addonarray)
	end

	def writeToDish(outfile, ingredient)
		if (!ingredient.is_a? String)
			if(ingredient.type != "tline")
				if(@scan)
					if(ingredient.type=="shadow" || ingredient.type=="tiddler")
						# save copies of all the shadow tiddlers in scan pass
						name = File.basename(ingredient.filename,".tiddler")
						if(Tiddler.looksLikeShadow?(ingredient.filename))
							tiddler = Tiddler.new
							tiddler.loadDiv(ingredient.filename)
							if(Tiddler.isShadow?(tiddler.title))
								@tiddlers[tiddler.title] = tiddler
							end
						end
					end
					return
				else
					if(ingredient.type == "title")
						return if(@tiddlers["SiteTitle"]||@tiddlers["SiteSubtitle"]) # don't write the title if it is available from the tiddlers
					end
					puts "Writing: " + ingredient.filename if !@@quiet
				end
			end
		end
		return if @scan
		if (outfile.is_a? String)
			outfile = ingredient.to_s
		else
			outfile << ingredient
		end
	end

	def copyFile(ingredient)
		puts "Copying: " + ingredient.filename if(!@@quiet)
		if ingredient.filename =~ /^https?/
			downloadFile(ingredient.filename)
		else
			File.copy(ingredient.filename, File.join(outdir, File.basename(ingredient.filename)))
		end
	end
	
private
	def downloadFile(url)
		uri = URI.parse(url)
		Net::HTTP.start(uri.host) { |http|
			resp = http.get(uri.path)
			open(File.join(outdir, File.basename(url)), "wb") { |file|
				file.write(resp.body)
			}
		}
	end
end
