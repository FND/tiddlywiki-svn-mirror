uri="$1"
if [ -z "$1" ]
then 
	uri='http://confabb.com/conferences/51133-necc-2008/notes/opml'
fi
n=$(date +"%Y%m%d%H%M%S")
for i in $(curl -s $uri | grep xmlUrl | sed -e 's/^.*xmlUrl=.//' -e 's/["].*$//')
do
	name=$(echo "$i" | sed 's/^.*\///')
	curl -s $i > $name-$n.xml
done
