# Filters added to this controller will be run for all controllers in the application.
# Likewise, all the methods added will be available for all controllers.
require_dependency "login_system"

class ApplicationController < ActionController::Base      
model :user
 
  def authorize(realm='Web Password', errormessage="Could't authenticate you") 
    username = request.env['REMOTE_USER']
    # check if authorized 
    # try to get user 
    if user = User.authenticate(username) 
      session["User.id"] = user.id           
    else 
      render :text => errormessage, :status => 401 and return     
    end 
  end 
      
  def authorizeAdmin(realm='Web Password', errormessage="Could't authenticate you") 
      username = request.env['REMOTE_USER']
      # check if authorized 
      # try to get user 
      if user = User.authenticate(username) 
        if not user.admin == "Y"
          render :text => errormessage, :status => 401 and return        
        end    
      else
          render :text => errormessage, :status => 401 and return   
      end 
  end
end
