#!/usr/bin/env perl

my @links = (
{ title => 'Clearleft', url => 'http://clearleft.com/' },
{ title => 'Spymaster', url => 'http://www.spymaster.co.uk/shops.html' },
{ title => 'The Team', 'http://www.theteam.co.uk/contact/' },
{ title => 'The James Clerk Maxwell Foundation', url => 'http://www.clerkmaxwellfoundation.org' },
{ url => 'http://en.wikipedia.org/wiki/Acorn_Computers' },
{ url => 'http://en.wikipedia.org/wiki/Adastral_Park' },
{ url => 'http://en.wikipedia.org/wiki/Admiralty_Arch' },
{ url => 'http://en.wikipedia.org/wiki/Alan_Turing' },
{ url => 'http://en.wikipedia.org/wiki/Albert_Bridge,_London' },
{ url => 'http://en.wikipedia.org/wiki/Alexander_Flemming' },
{ url => 'http://en.wikipedia.org/wiki/Alexandra_Palace' },
{ url => 'http://en.wikipedia.org/wiki/Arthur_Conan_Doyle' },
{ url => 'http://en.wikipedia.org/wiki/Atmospheric_railway' },
{ url => 'http://en.wikipedia.org/wiki/BBC_Television_Centre' },
{ url => 'http://en.wikipedia.org/wiki/Bank_of_England' },
{ url => 'http://en.wikipedia.org/wiki/Banksy' },
{ url => 'http://en.wikipedia.org/wiki/Battersea_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Beamish_Museum' },
{ url => 'http://en.wikipedia.org/wiki/Bletchley_Park' },
{ url => 'http://en.wikipedia.org/wiki/Bloomsbury' },
{ url => 'http://en.wikipedia.org/wiki/Bodleian_Library' },
{ url => 'http://en.wikipedia.org/wiki/Borough_Market' },
{ url => 'http://en.wikipedia.org/wiki/British_Library' },
{ url => 'http://en.wikipedia.org/wiki/British_Museum' },
{ url => 'http://en.wikipedia.org/wiki/Buzby' },
{ url => 'http://en.wikipedia.org/wiki/Cannon_Street_Railway_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Cannon_Street_station' },
{ url => 'http://en.wikipedia.org/wiki/Cerne_Abbas_giant' },
{ url => 'http://en.wikipedia.org/wiki/Chelsea_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Cleopatra%27s_Needle' },
{ url => 'http://en.wikipedia.org/wiki/Clifford_Cocks' },
{ url => 'http://en.wikipedia.org/wiki/Colossus_computer' },
{ url => 'http://en.wikipedia.org/wiki/Cross_Bones' },
{ url => 'http://en.wikipedia.org/wiki/Cuffley' },
{ url => 'http://en.wikipedia.org/wiki/Davenports' },
{ url => 'http://en.wikipedia.org/wiki/Delia_Derbyshire' },
{ url => 'http://en.wikipedia.org/wiki/Docklands_Light_Railway' },
{ url => 'http://en.wikipedia.org/wiki/Dolly_(sheep)' },
{ url => 'http://en.wikipedia.org/wiki/Douglas_adams' },
{ url => 'http://en.wikipedia.org/wiki/Elstree_Studios' },
{ url => 'http://en.wikipedia.org/wiki/Falkirk_wheel' },
{ url => 'http://en.wikipedia.org/wiki/Forbidden_Planet_(bookstore)' },
{ url => 'http://en.wikipedia.org/wiki/Forth_Railway_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Gerry_Anderson' },
{ url => 'http://en.wikipedia.org/wiki/Gonville_and_Caius_College,_Cambridge' },
{ url => 'http://en.wikipedia.org/wiki/Groombridge_Place' },
{ url => 'http://en.wikipedia.org/wiki/Hovercraft' },
{ url => 'http://en.wikipedia.org/wiki/Hovercraft_museum' },
{ url => 'http://en.wikipedia.org/wiki/Hungerford_Bridge_and_Golden_Jubilee_Bridges' },
{ url => 'http://en.wikipedia.org/wiki/Hunterian_Museum_and_Art_Gallery' },
{ url => 'http://en.wikipedia.org/wiki/Imperial_War_Museum_North' },
{ url => 'http://en.wikipedia.org/wiki/Ironbridge' },
{ url => 'http://en.wikipedia.org/wiki/Isaac_Newton' },
{ url => 'http://en.wikipedia.org/wiki/J._R._R._Tolkien' },
{ url => 'http://en.wikipedia.org/wiki/Jodrell_Bank' },
{ url => 'http://en.wikipedia.org/wiki/John_Foxx' },
{ url => 'http://en.wikipedia.org/wiki/John_Logie_Baird' },
{ url => 'http://en.wikipedia.org/wiki/John_Napier' },
{ url => 'http://en.wikipedia.org/wiki/Joint_European_Torus' },
{ url => 'http://en.wikipedia.org/wiki/Kelvedon_Hatch_Secret_Nuclear_Bunker' },
{ url => 'http://en.wikipedia.org/wiki/Kempton_Park_Steam_Engines' },
{ url => 'http://en.wikipedia.org/wiki/Kingsway_tramway_subway' },
{ url => 'http://en.wikipedia.org/wiki/Lacock_Abbey' },
{ url => 'http://en.wikipedia.org/wiki/Lambeth_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Lewis_Carroll' },
{ url => 'http://en.wikipedia.org/wiki/Lloyd%27s_building' },
{ url => 'http://en.wikipedia.org/wiki/London_Eye' },
{ url => 'http://en.wikipedia.org/wiki/London_Olympic_Stadium' },
{ url => 'http://en.wikipedia.org/wiki/London_Planetarium' },
{ url => 'http://en.wikipedia.org/wiki/London_Stone' },
{ url => 'http://en.wikipedia.org/wiki/London_Transport_Museum' },
{ url => 'http://en.wikipedia.org/wiki/London_Zoo' },
{ url => 'http://en.wikipedia.org/wiki/MONIAC_Computer' },
{ url => 'http://en.wikipedia.org/wiki/Maida_Vale_Studios' },
{ url => 'http://en.wikipedia.org/wiki/Manchester_Small-Scale_Experimental_Machine', title => 'Baby' },
{ url => 'http://en.wikipedia.org/wiki/Michelin_House' },
{ url => 'http://en.wikipedia.org/wiki/Millbank_Prison' },
{ url => 'http://en.wikipedia.org/wiki/Monument_to_the_Great_Fire_of_London' },
{ url => 'http://en.wikipedia.org/wiki/Museum_of_Scotland' },
{ url => 'http://en.wikipedia.org/wiki/Museum_of_the_History_of_Science,_Oxford' },
{ url => 'http://en.wikipedia.org/wiki/Newport_Transporter_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Old_Operating_Theatre' },
{ url => 'http://en.wikipedia.org/wiki/Ouse_Valley_Viaduct' },
{ url => 'http://en.wikipedia.org/wiki/Pontcysyllte_Aqueduct' },
{ url => 'http://en.wikipedia.org/wiki/Portmeirion' },
{ url => 'http://en.wikipedia.org/wiki/Post_Office_Research_Station' },
{ url => 'http://en.wikipedia.org/wiki/Psion' },
{ url => 'http://en.wikipedia.org/wiki/RAF_Fauld_Explosion' },
{ url => 'http://en.wikipedia.org/wiki/Radar' },
{ url => 'http://en.wikipedia.org/wiki/Royal_Albert_Hall' },
{ url => 'http://en.wikipedia.org/wiki/Royal_College_of_Surgeons_of_England' },
{ url => 'http://en.wikipedia.org/wiki/Royal_Geographical_Society' },
{ url => 'http://en.wikipedia.org/wiki/Royal_Institution' },
{ url => 'http://en.wikipedia.org/wiki/Royal_Institution_of_Great_Britain' },
{ url => 'http://en.wikipedia.org/wiki/Royal_Society' },
{ url => 'http://en.wikipedia.org/wiki/Rushton_Triangular_Lodge' },
{ url => 'http://en.wikipedia.org/wiki/Rutherford_Appleton_Laboratory' },
{ url => 'http://en.wikipedia.org/wiki/Sellafield' },
{ url => 'http://en.wikipedia.org/wiki/Senate_House_(University_of_London)' },
{ url => 'http://en.wikipedia.org/wiki/Somerset_House' },
{ url => 'http://en.wikipedia.org/wiki/Southwark_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/St._James%27s_Park' },
{ url => 'http://en.wikipedia.org/wiki/St_Katharine_Docks' },
{ url => 'http://en.wikipedia.org/wiki/St_Olave_Hart_Street' },
{ url => 'http://en.wikipedia.org/wiki/Stuckism' },
{ url => 'http://en.wikipedia.org/wiki/The_Beatles_Story' },
{ url => 'http://en.wikipedia.org/wiki/The_Eagle_(pub)' },
{ url => 'http://en.wikipedia.org/wiki/The_Fish-Slapping_Dance' },
{ url => 'http://en.wikipedia.org/wiki/Thinktank,_Birmingham' },
{ url => 'http://en.wikipedia.org/wiki/Thunderbirds_(TV_series)' },
{ url => 'http://en.wikipedia.org/wiki/Tommy_Flowers' },
{ url => 'http://en.wikipedia.org/wiki/Tottenham_Court_Road' },
{ url => 'http://en.wikipedia.org/wiki/Trafalgar_Square' },
{ url => 'http://en.wikipedia.org/wiki/Waltham_Abbey_Royal_Gunpowder_Mills' },
{ url => 'http://en.wikipedia.org/wiki/Wellcome_Trust' },
{ url => 'http://en.wikipedia.org/wiki/Wellcome_Trust_Sanger_Institute' },
{ url => 'http://en.wikipedia.org/wiki/West_End_theatre' },
{ url => 'http://en.wikipedia.org/wiki/Westminster_Bridge' },
{ url => 'http://en.wikipedia.org/wiki/Whitehall' },
{ url => 'http://en.wikipedia.org/wiki/William_Oughtred' },
{ url => 'http://en.wikipedia.org/wiki/Wimbledon_Windmill' },
{ url => 'http://en.wikipedia.org/wiki/Wortley_Top_Forge' },
{ url => 'http://en.wikipedia.org/wiki/Zx81' },
{ url => 'http://en.wikipedia.org/wiki/Giant%27s_Causeway' },
{ url => 'http://en.wikipedia.org/wiki/Millennium_Dome' },
);

use Data::Dumper;

open(RECIPE, "> split.recipe");

my $next = "HelloThere";

foreach my $o (@links) {
	my $url = $o->{url};
	my $title = $o->{title};
	unless ($title) {
		$title = $url;
		$title =~ s/.*\///;
		$title =~ s/_/ /g;
		$title =~ s/%27/'/g;
		$title =~ s/ \(.*$//g;
	}

	my $filename = $title;
	$filename =~ s/ /_/g;
	$filename =~ s/[',]//g;
	$filename .= ".tiddler";

	open(FILE, "> $filename");
	print FILE '<div title="'.$title.'" modifier="PaulDowney" created="20090721160000"><pre>'."$url\n[[NEXT|$next]]</pre></div>\n";
	print RECIPE "tiddler: $filename\n";
	close(FILE);
	$next = $title;
}

$title = "HelloThere";
$filename = "HelloThere.tiddler";
open(FILE, "> $filename");
print FILE <<EOF;
<div title="$title" modifier="PaulDowney" created="20090721160000"><pre>Hi There!
[[NEXT|$next]];
</pre></div>'."\n";
EOF
close(FILE);
print RECIPE "tiddler: $filename\n";

close(RECIPE);
