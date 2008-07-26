
opendir(DIR,"./");
foreach (readdir(DIR)){
	if(/qrv\d.*dat$|rsc\d.*dat$/){
		open(DAT,$_);
		my $s = "";
		while(my $l=<DAT>){$s.=$l}
		open(DAT_HEX,">$_.hex");
		print DAT_HEX unpack("H*",$s)
	}
}
