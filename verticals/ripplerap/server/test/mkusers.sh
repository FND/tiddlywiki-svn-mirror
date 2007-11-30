#!/bin/sh
#
#  usage mkusers [n]
#  blanks out user directories

declare -i nusers=$1
declare -i nitems=$2

[ $nusers -le 0 ] && nusers=100
[ $nitems -le 0 ] && nitems=5

[ -d "users" ] || mkdir "users"
[ -d "notes" ] || mkdir "notes"

uri="http://www.tiddlywiki.com/"

let i=0
while [ $i -lt $nusers ] ; do
    let i=i+1
    user=$(printf "TestUser%03d" $i)
    userdir="users/$user"
    [ -d "$userdir" ] || mkdir "$userdir"
    date=$(date)
    echo $i 1>&2
{
    cat <<EOF 
<?xml version="1.0"?>
<rss version="2.0">
<channel>
<title></title>
<link>http://www.tiddlywiki.com/</link>
<description>the social conferencing tool</description>
<language>en-us</language>
<copyright>Copyright 2007 PaulDowney</copyright>
<pubDate>$date</pubDate>
<lastBuildDate>$date</lastBuildDate>
<docs>http://blogs.law.harvard.edu/tech/rss</docs>
<generator>TiddlyWiki 2.2.6</generator>
EOF

    let j=0
    while [ $j -lt $nitems ] ; do
	let j=j+1

	title=$(printf "Testing's \`Number\`: %03d" $j)
	escaped_title=$(echo "$title" | sed 's/ /%20/g')

	cat <<EOF 
<item>
<title>$title from $user</title>
<description>some stuff on $title from $user ..</description>
<category>note</category>
<category>shared</category>
<link>$uri/#$escaped_title</link>
<pubDate>$date</pubDate>
<author>$user</author>
</item>
EOF
done

    cat <<EOF 
</channel>
</rss>
EOF

} > $userdir/index.xml

done

exit 0
