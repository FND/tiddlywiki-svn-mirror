require 'digest/sha1'

# this model expects a certain database layout and its based on the name/login pattern. 
class User < ActiveRecord::Base
                       
  has_and_belongs_to_many :directories
  

  def change_password(pass)
    update_attribute "password", self.class.sha1(pass)
  end
    
  protected

  def self.sha1(pass)
    Digest::SHA1.hexdigest(pass)
  end

  
  def crypt_password
    #write_attribute("password", self.class.sha1(password))
  end

  def self.authenticate(username) 
    find_by_login(username)
  end
  
     
end
