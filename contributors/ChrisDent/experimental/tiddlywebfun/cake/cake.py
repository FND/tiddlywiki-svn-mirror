
import StringIO

from PIL import Image, ImageDraw
from math import ceil, floor

from tiddlyweb.serializations import SerializationInterface

class Serialization(SerializationInterface):

    def tiddler_as(self, tiddler):
        mystring = tiddler.text
        im = Image.open('cake/cake.jpg')
        imwidth, imheight = im.size

        draw = ImageDraw.Draw(im)
        twidth, theight = draw.textsize(mystring)
        strings = []
        if twidth > imwidth:
            factor = int(floor(twidth/(imwidth * .78)))
            section_len = int(len(mystring)/factor)
            while len(mystring):
                chunk = mystring[:section_len + 1]
                mystring = mystring[section_len + 1:]
                strings.append(chunk)
        else:
            strings = [mystring]

        line = 5
        for string in strings:
            draw.text((5, line), string)
            line = line + theight

        f = StringIO.StringIO()
        im.save(f, "JPEG")
        return f.getvalue()
