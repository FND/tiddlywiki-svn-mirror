#!/bin/bash

cd ..
function makeUsers() {
  for user in $* ; do
    twanager adduser $user pass
    # echo "title: $user\ntags: voter\n\nno profile yet" | twanager tiddler profiles tiddler
    twanager tiddler profiles tiddler <<-!
title: $user
tags: voter
avatar: http://osmosoft.com/~psd/avatars/avatar.jpg

no profile yet
!
  done
}

#makeUsers psd mahemoff martin rakugo smm ben jermolene

while read name
do 
    name=$(echo $name | sed 's/[ ]*//g')
    makeUsers $name
done < testdata/names.txt

