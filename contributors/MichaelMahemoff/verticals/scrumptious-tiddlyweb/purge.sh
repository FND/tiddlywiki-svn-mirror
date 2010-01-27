#!/bin/bash
cd `dirname $0`
rm -fr `find store/pages -mindepth 1 -type d`
rm -fr `find store/comments -mindepth 1 -type d`
