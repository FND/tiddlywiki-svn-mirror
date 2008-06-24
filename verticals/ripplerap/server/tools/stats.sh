grep -h '<title>' *xml | sed -e 's/<title>//' -e 's/<\/title>//' -e 's/ from / /' -e '/Personal Democracy Forum/d' > stats.out

echo "speakers":
awk '{ print $2 }' stats.out | sort | uniq -c | sort -rn

echo "sessions":
awk '{ print $1 }' stats.out | sort | uniq -c | sort -rn
