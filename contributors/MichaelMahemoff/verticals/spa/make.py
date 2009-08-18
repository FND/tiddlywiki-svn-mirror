#!/usr/bin/env python
from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
from sys import argv
import os

# we use "." so end-programmer can run this from the dir containing their 
# template. but we also use current_path so we can read spa-template
current_path = os.path.dirname(os.path.realpath( __file__ ))
env = Environment(loader=FileSystemLoader(['.',current_path]))

(in_file, out_file) = (argv[1], argv[2])
template = env.get_template(in_file)
file = open(out_file, "w")
file.write(template.render())
file.close()
