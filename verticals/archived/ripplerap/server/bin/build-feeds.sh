#!/bin/sh

#
#  limit the number
#
export name="$1"
[ -z "$name" ]&&name=$(basename "$PWD")

export latest_nitems="$2"
[ -z "$latest_nitems" ]&&latest_nitems=60

export sess_nitems="$3"
[ -z "$sess_nitems" ]&&sess_nitems=1000

export rooturi="http://www.ripplerap.com/$name"

notesdir=./notes

#
#  build feed for pattern, limit
#
feed()
{
    sess="$1"
    nitems="$2"
    file="$3"
    feed="$sess"
    [ -z "$feed" ] && feed="latest"
    date=$(date +"%a, %d %b %Y %H:%M:%S %Z")
    filename="feeds/$feed.xml"
    link="$rooturi/$filename"
    tmp="feeds/.$feed.xml.$$"

    {
cat <<EOF 
<?xml version="1.0"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
 <channel>
  <title>RippleRap : $name</title>
  <link>$link</link>
  <atom:link href="$link" rel="self" type="application/rss+xml" />

  <description>the social conferencing tool</description>
  <language>en-us</language>
  <pubDate>$date</pubDate>
  <lastBuildDate>$date</lastBuildDate>
  <docs>http://blogs.law.harvard.edu/tech/rss</docs>
  <generator>RippleRap</generator>
EOF
	[ -n "$sess" ]&&sess="${sess}-"
	files=$(ls $notesdir/${sess}* 2>/dev/null)
	if [ -n "$files" ]
	then
	    cat $(ls -rt $files| tail -$nitems) 
	fi
cat <<EOF 
 </channel>
</rss>
EOF
    } > $tmp
    mv $tmp $filename
}

feed "" $latest_nitems

for sess in $(ls $notesdir 2>/dev/null| sed 's/-.*$//' | uniq)
do
    feed "$sess" "$sess_nitems" 
done
