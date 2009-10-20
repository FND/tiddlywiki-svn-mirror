#!/bin/sh

cd ..
PATH=$PATH:./testdata

while read user 
do 
    user=$(echo $user | sed 's/[ ]*//g')
    n=$[ ( $RANDOM % 10 ) ]

    while [ $n -ge  0 ]
    do
        text=$(fortune)
        idea=$(idea.sh)
        tags=$(tags.sh)
        points=$[ ( $RANDOM % 200 ) ]

        echo $user $idea

    twanager tiddler ideas tiddler <<-!
modifier: $user
title: $idea
modified: 20091016134847
tags: $tags
points: $points

$text
!
    n=$[ $n - 1 ]
    done

done < testdata/names.txt

