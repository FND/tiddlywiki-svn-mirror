#!/bin/sh

#
#  limit the number
#
latest_nitems="$1"
[ -z "$latest_nitems" ]&&latest_nitems=60

sess_nitems="$2"
[ -z "$sess_nitems" ]&&sess_nitems=1000

notesdir=./notes

#
#  build feed for pattern, limit
#
feed()
{
    sess="$1"
    nitems="$2"
    feed="$sess"
    [ -z "$feed" ] && feed="latest"
    date=$(date +"%a, %e %b %Y %H:%M:%S %Z")

    {
cat <<EOF 
<?xml version="1.0"?>
<rss version="2.0">
 <channel>
  <title>RippleRap : LeWeb</title>
  <link>http://www.ripplerap.com/LeWeb</link>
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
    } > feeds/$feed.xml
}


feed "" $latest_nitems

for sess in $(ls $notesdir | sed 's/-.*$//' | uniq)
do
    feed "$sess" "$sess_nitems"
done
