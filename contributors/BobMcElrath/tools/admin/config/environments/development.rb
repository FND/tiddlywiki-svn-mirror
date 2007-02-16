# Settings specified here will take precedence over those in config/environment.rb

# In the development environment your application's code is reloaded on
# every request.  This slows down response time but is perfect for development
# since you don't have to restart the webserver when you make code changes.
config.cache_classes     = false

# Log error messages when you accidentally call methods on nil.
config.whiny_nils        = true

# Enable the breakpoint server that script/breakpointer connects to
config.breakpoint_server = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_controller.perform_caching             = false

# Don't care if the mailer can't send
config.action_mailer.raise_delivery_errors = false
   
#setup our env variables here
WEBSPACE_LOCAL_PATH = '/Users/leegonzales/development/tiddlerbackend/webspaces/'     
WEBSPACE_BASE_URL = 'http://svn.tiddlywiki.org/'           
RECIPE_PATH = '/Users/leegonzales/development/tiddlerbackend/Trunk/'     
HTACCESSFILE =  '/Users/leegonzales/development/tiddlerbackend/htaccessSample'  

