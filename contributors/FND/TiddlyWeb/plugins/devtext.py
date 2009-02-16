"""
A StorageInterface intended to ease client-side plugin development

* no revisions
* uses .tid files for non-JavaScript content
* supports JavaScript (.js) files
"""

import os
import os.path
import urllib
import codecs

from tiddlyweb.serializer import Serializer

from tiddlyweb.stores.text import Store as Text, _encode_filename
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.user import User


class Store(Text):

    def __init__(self, environ={}):
        self.environ = environ
        self.serializer = Serializer('text')
        if not os.path.exists(self._store_root()):
            os.mkdir(self._store_root())

    def list_bags(self):
        bags = self._dirs_in_dir(self._store_root())

        return [Bag(urllib.unquote(bag).decode('utf-8')) for bag in bags]

    def list_recipes(self):
        recipes = [file.replace('.recipe', '') for file in self._files_in_dir(self._store_root()) if file.endswith('.recipe')]

        return [Recipe(urllib.unquote(recipe).decode('utf-8')) for recipe in recipes]

    def list_users(self):
        users = [file.replace('.user', '') for file in self._files_in_dir(self._store_root()) if file.endswith('.user')]

        return [User(urllib.unquote(user).decode('utf-8')) for user in users]

    def _dirs_in_dir(self, path):
        return [dir for dir in self._files_in_dir(path) if os.path.isdir(os.path.join(path, dir))]

    def _recipe_path(self, recipe):
        return os.path.join(self._store_root(), _encode_filename(recipe.name) + '.recipe')

    def _bag_path(self, bag_name):
        try:
            return os.path.join(self._store_root(), _encode_filename(bag_name))
        except (AttributeError, StoreEncodingError), exc:
            raise NoBagError('No bag name: %s' % exc)

    def _user_path(self, user):
        return os.path.join(self._store_root(), user.usersign + '.user')

    def _tiddlers_dir(self, bag_name):
        return self._bag_path(bag_name)

    def _tiddler_base_filename(self, tiddler):
        """
        <TBD>
        """
        # should we get a Bag or a name here?
        bag_name = tiddler.bag

        store_dir = self._tiddlers_dir(bag_name)

        if not os.path.exists(store_dir):
            raise NoBagError('%s does not exist' % store_dir)

        try:
            return store_dir
        except StoreEncodingError, exc:
            raise NoTiddlerError(exc)

    def _tiddler_full_filename(self, tiddler, revision):
        """
        Return the full path to the respective tiddler file.
        """

        return os.path.join(self._tiddlers_dir(tiddler.bag),
            "%s.tid" % _encode_filename(tiddler.title))

    def _tiddler_revision_filename(self, tiddler, index=0):
        """
        <TBD>
        """
        return 1

    def list_tiddler_revisions(self, tiddler):
        """
        <TBD>
        """
        return [self._tiddler_revision_filename(tiddler)]

    def _files_in_dir(self, path):
        return [x for x in os.listdir(path) if not x.startswith('.') and not x == 'policy' and not x == 'description']

    def bag_get(self, bag):
        """
        Read a bag from the store and get a list
        of its tiddlers.
        """
        bag_path = self._bag_path(bag.name)
        tiddlers_dir = self._tiddlers_dir(bag.name)

        try:
            tiddlers = self._files_in_dir(tiddlers_dir)
        except OSError, exc:
            raise NoBagError('unable to list tiddlers in bag: %s' % exc)
        for filename in tiddlers:
            title = None
            if filename.endswith(".tid"):
                title = urllib.unquote(filename[:-4]).decode('utf-8')
            elif filename.endswith(".js"):
                title = urllib.unquote(filename[:-3]).decode('utf-8')
            if title:
                bag.add_tiddler(Tiddler(title))

        bag.desc = self._read_bag_description(bag_path)
        bag.policy = self._read_policy(bag_path)

        return bag

    def tiddler_put(self, tiddler):
        """
        Write a tiddler into the store. We only write if
        the bag already exists. Bag creation is a
        separate action from writing to a bag.
        """

        tiddler_base_filename = self._tiddler_base_filename(tiddler)
        if not os.path.exists(tiddler_base_filename):
            os.mkdir(tiddler_base_filename)
        locked = 0
        lock_attempts = 0
        while (not locked):
            try:
                lock_attempts = lock_attempts + 1
                self.write_lock(tiddler_base_filename)
                locked = 1
            except StoreLockError, exc:
                if lock_attempts > 4:
                    raise StoreLockError(exc)
                time.sleep(.1)

        revision = 1
        tiddler_filename = self._tiddler_full_filename(tiddler, revision)
        tiddler_file = codecs.open(tiddler_filename, 'w', encoding='utf-8')

        if tiddler.type and tiddler.type != 'None':
            tiddler.text = b64encode(tiddler.text)
        self.serializer.object = tiddler
        tiddler_file.write(self.serializer.to_string())
        self.write_unlock(tiddler_base_filename)
        tiddler.revision = revision
        tiddler_file.close()
        self.tiddler_written(tiddler)
