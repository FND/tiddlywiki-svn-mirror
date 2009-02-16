"""
Text based serializers.
"""

import urllib
import cgi
import simplejson

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.policy import Policy


class Serialization(SerializationInterface):
    """
    Serialize entities and collections to and from
    textual representations. This is primarily used
    by the text Store.
    """

    def list_recipes(self, recipes):
        """
        Return a linefeed separated list of recipe names.
        """
        return "\n".join([recipe.name for recipe in recipes])

    def list_bags(self, bags):
        """
        Return a linefeed separated list of recipe names.
        """
        return "\n".join([bag.name for bag in bags])

    def recipe_as(self, recipe):
        """
        Recipe as text.
        """
        policy = recipe.policy
        policy_dict = {}
        for key in ['owner', 'read', 'write', 'create', 'delete', 'manage']:
            policy_dict[key] = getattr(policy, key)
        lines = ['desc: %s' % recipe.desc, 'policy: %s' % simplejson.dumps(policy_dict), '']

        for bag, filter_string in recipe:
            line = ''
            if not isinstance(bag, basestring):
                bag = bag.name
            line += '/bags/%s/tiddlers' % bag
            if filter_string:
                line += '?filter=%s' % filter_string
            lines.append(line)
        return "\n".join(lines)

    def as_recipe(self, recipe, input_string):
        """
        Turn a string back into a recipe.
        """

        def _handle_headers(recipe, header):
            headers = header.split('\n')
            for field, value in [x.split(': ', 1) for x in headers]:
                if field == 'policy':
                    recipe.policy = Policy()
                    info = simplejson.loads(value)
                    for key, value in info.items():
                        recipe.policy.__setattr__(key, value)
                else:
                    setattr(recipe, field, value)

        try:
            header, body = input_string.rstrip().split('\n\n', 1)
            _handle_headers(recipe, header)
        except ValueError:
            body = input_string.rstrip()
            if body.startswith('desc:'):
                header = body
                body = ''
                _handle_headers(recipe, header)

        recipe_lines = self._recipe_lines(body)
        recipe.set_recipe(recipe_lines)
        return recipe

    def list_tiddlers(self, bag):
        """
        List the tiddlers in a bag as text.
        """
        if bag.revbag:
            return "\n".join(
                    ["%s:%s" % (tiddler.title, tiddler.revision)
                        for tiddler in bag.list_tiddlers()])
        else:
            return "\n".join([
                tiddler.title for tiddler in bag.list_tiddlers()])

    def tiddler_as(self, tiddler):
        """
        Represent a tiddler as a text string: headers, blank line, text.
        """
        return 'modifier: %s\ncreated: %s\nmodified: %s\ntype: %s\ntags: %s%s\n%s\n' \
                % (tiddler.modifier, tiddler.created, tiddler.modified, tiddler.type, \
                self.tags_as(tiddler.tags), self.fields_as(tiddler), tiddler.text)

    def fields_as(self, tiddler):
        """
        Turn tiddler fields into strings in
        sort of a RFC 822 header form.
        """
        info = '\n'
        for key in tiddler.fields:
            if not key.startswith('server.'):
                info += '%s: %s\n' % (key, tiddler.fields[key])
        return info

    def as_tiddler(self, tiddler, input_string):
        """
        Transform a text representation of a tiddler into
        tiddler attributes.
        """
        header, text = input_string.split('\n\n', 1)
        tiddler.text = text.rstrip()
        headers = header.split('\n')

        for field, value in [x.split(': ', 1) for x in headers]:
            if value == '':
                continue
            if hasattr(tiddler, field):
                setattr(tiddler, field, value)
            else:
                tiddler.fields[field] = value

        # we used to raise TiddlerFormatError but there are
        # currently no rules for that...

        tag_string = tiddler.tags
        if tag_string:
            tiddler.tags = self.as_tags(tag_string)

        return tiddler

    def _recipe_lines(self, body):
        """
        Given text containing a list of recipes, calculate
        the recipe information they hold and return
        as a list of bagname, filter lists.
        """
        recipe_lines = []
        if len(body):
            lines = body.rstrip().split('\n')
            for line in lines:
                if '?' in line:
                    bag, query_string = line.split('?')
                    request_info = cgi.parse_qs(query_string)
                    filter_string = request_info.get('filter', [''])[0]
                else:
                    bag = line
                    filter_string = ''
                bagname = urllib.unquote(bag.split('/')[2])
                recipe_lines.append([bagname, filter_string])
        return recipe_lines
