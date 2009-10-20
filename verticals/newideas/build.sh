#!/bin/bash

function makeUsers() {
  for user in $* ; do
    twanager adduser $user pass
    # echo "title: $user\ntags: voter\n\nno profile yet" | twanager tiddler profiles tiddler
    twanager tiddler profiles tiddler <<-!
title: $user
tags: voter

no profile yet
!
  done
}

makeUsers psd mahemoff martin rakugo smm ben jermolene
