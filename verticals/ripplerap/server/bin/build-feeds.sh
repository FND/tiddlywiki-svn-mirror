#!/bin/sh

#
#  limit the number
#
export name="$1"
[ -z "$name" ]&&name="LeWeb"

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
	cat $(ls -rt ${notesdir}/${sess}* | tail -$nitems) 
cat <<EOF 
 </channel>
</rss>
EOF
    } > $filename
}


feed "" $latest_nitems

for sess in $(ls $notesdir | sed 's/-.*$//' | uniq)
do
    feed "$sess" "$sess_nitems" 
done
