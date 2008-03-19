
"""
Test turning a tiddler into other forms.

Currently this test and the code in general does not
pay attention to modified and created fields in the
tiddler. This will be added later. For now it is
just in the way.
"""

import sys
sys.path.append('.')
from tiddlyweb.tiddler import Tiddler
from tiddlyweb.serializer import Serializer

expected_string = """modifier: test@example.com
created: 
modified: 200803030303
tags: foobar [[foo bar]]

Hello, I'm the content.
"""

def setup_module(module):
    pass

def test_generated_string():

    tiddler = Tiddler(
            title = 'test tiddler',
            modifier = 'test@example.com',
            tags = ['foobar', 'foo bar'],
            text = "Hello, I'm the content.",
            modified = '200803030303'
            )

    serializer = Serializer('text')
    serializer.object = tiddler
    string = serializer.to_string()

    assert string == expected_string, \
            'serialized recipe looks like we expect. should be %s, got %s' \
            % (expected_string, string)

    assert '%s' % serializer == expected_string, \
            'serializer goes to string as expected_string'
