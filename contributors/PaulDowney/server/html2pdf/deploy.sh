#export dir="/home/pauldowney/whatfettle.com/2009/01/html2pdf"
#export host="pauldowney@amp.dreamhost.com"

export host="osmodot@www.osmosoft.com"
export dir="/data/vhost/www.osmosoft.com/html/~psd/html2pdf"

scp index.php $host:$dir
scp html2pdf.sh $host:$dir
scp customer-contact.xsl $host:$dir

ssh $host "cd $dir && mkdir -p tmp && chmod a+rwx tmp"

#
#  depends on Apache FOP:
#  http://xmlgraphics.apache.org/fop/
#
#ssh $host mkdir -p $dir/fop $dir/fop/lib $dir/fop/build
#scp fop/fop $host:$dir/fop
#scp fop/lib/*jar $host:$dir/fop/lib
#scp fop/build/*jar $host:$dir/fop/build
