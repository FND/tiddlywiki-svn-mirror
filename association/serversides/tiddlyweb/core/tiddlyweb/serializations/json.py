"""
JSON based serializer.
"""

import simplejson

from base64 import b64encode, b64decode

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.policy import Policy


class Serialization(SerializationInterface):
    """
    Turn various entities to and from JSON.
    """

    def list_recipes(self, recipes):
        """
        Create a JSON list of recipe names from
        the provided recipes.
        """
        return simplejson.dumps([recipe.name for recipe in recipes])

    def list_bags(self, bags):
        """
        Create a JSON list of bag names from the
        provided bags.
        """
        return simplejson.dumps([bag.name for bag in bags])

    def list_tiddlers(self, bag):
        """
        List the tiddlers in a bag as JSON.
        The format is a list of dicts in
        the form described by self._tiddler_dict.
        """
        return simplejson.dumps([self._tiddler_dict(tiddler) for tiddler in bag.list_tiddlers()])

    def recipe_as(self, recipe):
        """
        A recipe as a JSON dictionary.
        """
        policy = recipe.policy
        policy_dict = {}
        for key in ['owner', 'read', 'write', 'create', 'delete', 'manage']:
            policy_dict[key] = getattr(policy, key)
        return simplejson.dumps(dict(desc=recipe.desc, policy=policy_dict, recipe=recipe.get_recipe()))

    def as_recipe(self, recipe, input_string):
        """
        Turn a JSON dictionary into a Recipe
        if it is in the proper form. Include
        the policy.
        """
        info = simplejson.loads(input_string)
        try:
            recipe.set_recipe(info['recipe'])
            recipe.desc = info['desc']
            if info['policy']:
                recipe.policy = Policy()
                for key, value in info['policy'].items():
                    recipe.policy.__setattr__(key, value)
        except KeyError:
            pass
        return recipe

    def bag_as(self, bag):
        """
        Create a JSON dictionary representing
        a Bag and Policy.
        """
        policy = bag.policy
        policy_dict = {}
        for key in ['owner', 'read', 'write', 'create', 'delete', 'manage']:
            policy_dict[key] = getattr(policy, key)
        info = dict(policy=policy_dict, desc=bag.desc)
        return simplejson.dumps(info)

    def as_bag(self, bag, input_string):
        """
        Turn a JSON string into a bag.
        """
        info = simplejson.loads(input_string)
        if info['policy']:
            bag.policy = Policy()
            for key, value in info['policy'].items():
                bag.policy.__setattr__(key, value)
        bag.desc = info.get('desc', '')
        return bag

    def tiddler_as(self, tiddler):
        """
        Create a JSON dictionary representing
        a tiddler, as described by _tiddler_dict
        plus the text of the tiddler.
        """
        tiddler_dict = self._tiddler_dict(tiddler)
        if tiddler.type and tiddler.type != 'None':
            tiddler_dict['text'] = b64encode(tiddler.text)
        else:
            tiddler_dict['text'] = tiddler.text

        return simplejson.dumps(tiddler_dict)

    def as_tiddler(self, tiddler, input_string):
        """
        Turn a JSON dictionary into a Tiddler.
        """
        dict_from_input = simplejson.loads(input_string)
        accepted_keys = ['created', 'modified', 'modifier', 'tags', 'fields', 'text', 'type']
        for key, value in dict_from_input.iteritems():
            if value and key in accepted_keys:
                setattr(tiddler, key, value)
        if tiddler.type and tiddler.type != 'None':
            tiddler.text = b64decode(tiddler.text)

        return tiddler

    def _tiddler_dict(self, tiddler):
        """
        Select fields from a tiddler to create
        a dictonary.
        """
        unwanted_keys = ['text', 'store']
        wanted_keys = [attribute for attribute in tiddler.slots if attribute not in unwanted_keys]
        wanted_info = {}
        for attribute in wanted_keys:
            wanted_info[attribute] = getattr(tiddler, attribute, None)
        wanted_info['permissions'] = self._tiddler_permissions(tiddler)
        try:
            fat = self.environ['tiddlyweb.query'].get('fat', [None])[0]
            if fat:
                wanted_info['text'] = tiddler.text
        except KeyError:
            pass # tiddlyweb.query is not there
        return dict(wanted_info)

    def _tiddler_permissions(self, tiddler):
        """
        Make a list of the permissions the current user has
        on this tiddler.
        """
        perms = []
        bag = Bag(tiddler.bag)
        if tiddler.store:
            bag = tiddler.store.get(bag)
            if 'tiddlyweb.usersign' in self.environ:
                perms = bag.policy.user_perms(self.environ['tiddlyweb.usersign'])
        return perms
