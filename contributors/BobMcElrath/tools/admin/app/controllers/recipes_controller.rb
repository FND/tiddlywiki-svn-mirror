class RecipesController < ApplicationController
  require 'find' 
  require 'directory' 
  
  before_filter :authorizeAdmin   
  
  auto_complete_for :directory, :url
  
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list
    @recipe_pages, @recipes = paginate :recipes, :per_page => 10
  end

  def show
    @recipe = Recipe.find(params[:id])
  end

  def new
    @recipe = Recipe.new
  end
                    
  def list_recipes_on_disk
      getrecipes(RECIPE_PATH)
  end
          
  def getrecipes(basedir, subdir="", recipearray=Array.new)     
   Dir.foreach(basedir + "/" + subdir) do |entry|
     if(FileTest.directory?( basedir + "/" + subdir + "/" + entry ) && entry.index(".") != 0)
       getrecipes(basedir, subdir + "/" + entry, recipearray)
     end
     puts entry
     if(entry.index(".recipe") != nil)      
       recipearray.push(subdir + "/" + entry)
     end
   end
   return recipearray
  end
   
   
  def syncRecipes()         
            arr = list_recipes_on_disk
            arr.each do |recipe_name|    
                temp_recipe = Recipe.find_by_name(recipe_name)     

                if not(temp_recipe)                                  
                   temp_recipe = Recipe.new  
                   temp_recipe.name =  recipe_name
                   temp_recipe.save  
                end
                
           end             
        redirect_to :action => 'list'  
   end

  def create
    @recipe = Recipe.new(params[:recipe])
    if @recipe.save
      flash[:notice] = 'Recipe was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end

  def edit
    @recipe = Recipe.find(params[:id])
  end

  def update
    @recipe = Recipe.find(params[:id])
    if @recipe.update_attributes(params[:recipe])
      flash[:notice] = 'Recipe was successfully updated.'
      redirect_to :action => 'show', :id => @recipe
    else
      render :action => 'edit'
    end
  end

  def destroy
    Recipe.find(params[:id]).destroy
    redirect_to :action => 'list'
  end
end
