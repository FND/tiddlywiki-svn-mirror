class DirectoriesController < ApplicationController     
  require 'pp'
  require 'cookerrecipe'
   
  before_filter :authorize
  
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list          
    userID = session["User.id"]      
    @directories = nil 
    @admin = false 
    
    #if not userID 
    #  userID = "DevonJones"
    #end 
    
    if userID    
       user = User.find(userID)     
       if user.admin == "Y" 
           @directories = Directory.find_all            
           @admin = true
       else
           @directories = user.directories    
       end            
    end           
  end

  def show
    @directory = Directory.find(params[:id])
  end
                
  def add_recipe          
             
     @directory = Directory.find_by_path(params[:path])     
     @recipe  = Recipe.find(params[:recipe_id])      
     if(@directory) 
       @directory.recipes << @recipe       
       @directory.save     
       @recipes = @directory.recipes   
       render(:layout => false)             
     end
     @recipe_list = Recipe.find_all    
  end
             
  def remove_recipe 
     @directory = Directory.find(params[:directory_id])     
     @recipe  = Recipe.find(params[:recipe_id])      
     if(@directory) 
       @directory.recipes.delete(@recipe)       
       @directory.save     
       @recipes = @directory.recipes   
       render(:layout => false)             
     end
     @recipe_list = Recipe.find_all
    
  end
          
  def rebuild_recipes          
      temp_dir =  Directory.find(params[:id])          
      @output =  rebuild_recipes_helper(temp_dir.recipes, temp_dir.path)     
      logger.info(@output)
  end
  
  def rebuild_recipes_helper(recipes, dir)
      sw = StringWriter.new
      temp = $stdout
      $stdout = sw
      recipes.each do |recipe|
          cook = CookerRecipe.new(RECIPE_PATH + recipe.name, WEBSPACE_LOCAL_PATH + "/" + dir + "/")
          cook.cook
      end
      $stdout = temp
      return sw.to_s
  end
  

  def new
    @directory = Directory.new            
    @recipes = @directory.recipes 
    @recipe_list = Recipe.find_all   
    #@directory.url =   WEBSPACE_BASE_URL
    #@directory.path =  WEBSPACE_LOCAL_PATH
  end
  
  def listUsers(htaccessFile = HTACCESSFILE)
      arr = Array.new
      File.open(htaccessFile) do |file|
          file.each_line do |line|
              arr.push(line.split(':')[0])
          end
      end
      return arr
  end 

  def create
    @directory = Directory.new(params[:directory])     
    Dir.mkdir(WEBSPACE_LOCAL_PATH + @directory.path)
    if @directory.save
      flash[:notice] = 'Directory was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end

  def edit
    @directory = Directory.find(params[:id])        
    @recipes = @directory.recipes        
    @recipe_list = Recipe.find_all
  end

  def update
    @directory = Directory.find(params[:id])
    if @directory.update_attributes(params[:directory])
      flash[:notice] = 'Directory was successfully updated.'
      redirect_to :action => 'show', :id => @directory
    else
      render :action => 'edit'
    end
  end

  def destroy
    Directory.find(params[:id]).destroy
    redirect_to :action => 'list'
  end
end

class StringWriter
  def initialize()
    @content = ""
  end

  def write(content)
    @content << content
  end

  def to_s()
    @content
  end
end
