uri='http://confabb.com/conferences/60420-personal-democracy-forum-2008/notes/opml'
n=$(date +"%Y%m%d%H%M%S")
for i in $(curl -s $uri | grep xmlUrl | sed -e 's/^.*xmlUrl=.//' -e 's/["].*$//')
do
	name=$(echo "$i" | sed 's/^.*\///')
	curl -s $i > $name-$n.xml
done
