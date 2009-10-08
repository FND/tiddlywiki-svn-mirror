"""
Present or validate a form for getting a username
and password.
"""

import cgi
import Cookie

from tiddlyweb.web.challengers import ChallengerInterface
from tiddlyweb.web.util import server_host_url
from tiddlyweb.model.user import User
from tiddlyweb.store import NoUserError
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.store import NoUserError, NoRecipeError, NoBagError
from sha import sha

class Challenger(ChallengerInterface):

    def challenge_get(self, environ, start_response):
        """
        Respond to a GET request by sending a form.
        """
        redirect = environ['tiddlyweb.query'].get('tiddlyweb_redirect', ['/'])[0]
        # print "REDIRECT"
        # print redirect
        return self._send_cookie_form(environ, start_response, redirect)

    def challenge_post(self, environ, start_response):
        """
        Respond to a POST by processing data sent from a form.
        The form should include a username and password. If it
        does not, send the form aagain. If it does, validate
        the data.
        """
        # request_info = cgi.parse_qs(environ['wsgi.input'].read(int(environ['CONTENT_LENGTH'])))
        # redirect = request_info.get('tiddlyweb_redirect', ['/'])[0]
        query = environ['tiddlyweb.query']
        redirect = query.get('tiddlyweb_redirect', ['/'])[0]

        try:
            user = query['user'][0]
            password = query['password'][0]
            valid=self._validate_and_redirect(environ, start_response, user, password, redirect)
            if valid:
              self._ensure_bags(environ, user)
              self._ensure_recipe(environ, user)
            return valid
        except KeyError:
            return self._send_cookie_form(environ, start_response, redirect, '401 Unauthorized')

    def _ensure_bags(self, environ, username):

      # for privacy in ["public", "protected", "private"]:
      for privacy in ["private", "protected"]:

        only_user = ["admin", username]
        if privacy=="public":
          readPerms = []
          writePerms = []
        elif privacy=="protected":
          readPerms = []
          writePerms = only_user
        elif privacy=="private":
          readPerms = only_user
          writePerms = only_user

        bag = Bag(privacy+"-"+username)
        store = environ['tiddlyweb.store']
        try:
            store.get(bag)
            return
        except NoBagError:
            bag.desc = 'tiddlyguv private user bag'
            bag.policy.owner = username
            bag.policy.manage = ["admin", username]
            bag.policy.read = readPerms
            bag.policy.write = writePerms
            bag.policy.create = ["admin", username]
            bag.policy.delete = ["admin", username]
            store.put(bag)

    def _ensure_recipe(self, environ, username):
      store = environ['tiddlyweb.store']
      private_recipe = Recipe("portal-"+username);
      try:
          store.delete(private_recipe)
      except NoRecipeError:
          # dont care
          x=1
          # print "dont care"
      portal_recipe = Recipe("portal")
      store.get(portal_recipe)
      # print "PORTAL RECIPE"
      # print portal_recipe
      private_recipe_list = portal_recipe.get_recipe()
      # print "THE LIST"
      # print private_recipe_list
      private_recipe_list.append(['private-'+username, ""])
      private_recipe_list.append(['protected-'+username, ""])
      # private_recipe_list.append(['public-'+username, ""])
      # print "THE LIST"
      # print private_recipe_list
      private_recipe.set_recipe(private_recipe_list)
      store.put(private_recipe)

    def _send_cookie_form(self, environ, start_response, redirect, status='200 OK', message=''):
        """
        Send a simple form to the client asking for a username
        and password.
        """
        start_response(status, [
            ('Content-Type', 'text/html')
            ])
        environ['tiddlyweb.title'] = 'TiddlyGuv Login'
        return [
"""
<style>
body { padding: 0; }
body, pre { font-family: sans-serif; }
#header { color: white; background: red; padding: 1em 0.5em; border-bottom: purple; margin: 0; }
h1 { margin: 0; }
</style>
<pre>
%s
<form action="" method="POST">
<table>
<tr><td>Username</td><td><input name="user" size="40" /></td></tr>
<tr><td>Password</td><td><input type="password" name="password" size="40" /></td></tr>
<input type="hidden" name="tiddlyweb_redirect" value="%s" />
<tr><td>&nbsp;</td><td><input type="submit" value="login" /></td></tr>
</form>
</pre>
""" % (message, redirect)]

    def _validate_and_redirect(self, environ, start_response, username, password, redirect):
        """
        Check a username and password. If valid, send a cookie
        to the client. If it is not, send the form again.
        """
        status = '401 Unauthorized'
        try:
            store = environ['tiddlyweb.store']
            secret = environ['tiddlyweb.config']['secret']
            user = User(username)
            store.get(user)
            if user.check_password(password):
                uri = '%s%s' % (server_host_url(environ), redirect)
                import re
                uri = re.sub("/recipes/portal(-.*)?/", "/recipes/portal-"+username+"/", uri)
                # uri = uri.replace("/recipes/portal/",
                # print "USERNAME" + username
                # print "URI" + uri
                cookie = Cookie.SimpleCookie()
                secret_string = sha('%s%s' % (user.usersign, secret)).hexdigest()
                cookie['tiddlyweb_user'] = '%s:%s' % (user.usersign, secret_string)
                cookie['tiddlyweb_user']['path'] = '/'
                start_response('303 See Other', [
                    ('Set-Cookie', cookie.output(header='')),
                    ('Location', uri)
                    ])
                return [uri]
        except KeyError:
            pass
        except NoUserError:
            pass
        return self._send_cookie_form(environ, start_response, redirect, status, 'User or Password no good')
