#!/bin/bash
recipe=`find . -name *.html.recipe`
name=`basename $recipe .html.recipe`
cook $name
