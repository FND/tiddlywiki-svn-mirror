grep -h '<title>' *xml | grep '[0-9] from '| sed -e 's/<title>//' -e 's/<\/title>//' -e 's/ from / /' > stats.out

echo "note-takers":
awk '{ print $2 }' stats.out | sort | uniq -c | sort -rn

echo "sessions":
awk '{ print $1 }' stats.out | sort | uniq -c | sort -rn
