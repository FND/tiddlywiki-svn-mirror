export dir=/home/pauldowney/whatfettle.com/2009/01/html2pdf
export host=pauldowney@amp.dreamhost.com

#ssh $host mkdir -p $dir $dir/fop 

scp index.php $host:$dir
scp customer-contact.xsl $host:$dir
