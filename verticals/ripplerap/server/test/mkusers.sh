#!/bin/sh
#
#  usage mkusers [n]
#  blanks out user directories

declare -i n=$1
[ $n -le 0 ] && n=100

[ -d "users" ] || mkdir "users"

let i=0
while [ $i -lt $n ] ; do
    let i=i+1
    user=$(printf "TestUser%03d" $i)
    userdir="users/$user"
    [ -d "$userdir" ] || mkdir "$userdir"
    sed -e "s/PaulDowney/$user/" < index.xml > $userdir/index.xml
done

exit 0
