class AdminController < ApplicationController       
  require 'user'
  before_filter :authorizeAdmin
 
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list
    @user_pages, @users = paginate :users, :per_page => 30
  end

  def show
    @user = User.find(params[:id])
  end
        
  def remove_directory
      @user = User.find(params[:user_id])     
      @directory  = Directory.find(params[:directory_id])            
      if(@user) 
        @user.directories.delete(@directory)       
        @directory.save     
         @directories = @user.directories   
        render(:layout => false)             
      end
     @directory_list = Directory.find_all 

   end
    
   def listUsers(htaccessFile = HTACCESSFILE)
       arr = Array.new
       File.open(htaccessFile) do |file|
           file.each_line do |line|        
               temp_user = User.new
               temp_user.login = line.split(':')[0]       
               temp_user.password = line.split(':')[1]   
               arr.push(temp_user)
           end
       end
       return arr
   end 
                        
               
  def syncSystemUsers(htaccessFile = HTACCESSFILE)
       File.open(htaccessFile) do |file|
           file.each_line do |line|       
               #temp_user = User.find_by_login(line.split(':')[0])      
               temp_user = User.find_by_login(line.split(':')[0])     
               
               if (temp_user)                                  
                 temp_user.login = line.split(':')[0]       
                 temp_user.password = line.split(':')[1]
               else              
                 temp_user = User.new  
                 temp_user.login = line.split(':')[0]       
                 temp_user.password = line.split(':')[1]         
                 temp_user.admin = 'N'
               end
               
               temp_user.save        
                                  
          end         
       end         
  end
  
  
  def add_directory     
     @user = User.find_by_login(params[:login])     
     @directory  = Directory.find(params[:directory_id])      
     
     if(@user) 
       @user.directories << @directory       
       @user.save     
       @directories = @user.directories  
       render(:layout => false)             
     end
     @directory_list = Directory.find_all  
  end

  def new            
    @system_users = listUsers
    @user = User.new
  end          
  
  def syncUsers       
    syncSystemUsers
    @user_pages, @users = paginate :users, :per_page => 10   
    redirect_to :action => 'list'  
    
  end 

  def create
    @user = User.new(params[:user])
    if @user.save
      flash[:notice] = 'User was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end

  def edit                     
    @directory_list = Directory.find_all  
    @user = User.find(params[:id])    
    @directories = @user.directories  
  end

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      flash[:notice] = 'User was successfully updated.'
      redirect_to :action => 'show', :id => @user
    else
      render :action => 'edit'
    end
  end

  def destroy
    User.find(params[:id]).destroy
    redirect_to :action => 'list'
  end
end
