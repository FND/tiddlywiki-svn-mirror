#!/bin/sh

function tag() {
    case $[ ( $RANDOM % 28 ) ] in
    0) echo "Mobile\c";;
    1) echo "Portable\c";;
    2) echo "Folding\c";;
    3) echo "Colapsible\c";;
    4) echo "Compostable\c";;
    5) echo "EcoFriendly\c";;
    6) echo "CarbonNeutral\c";;
    7) echo "Electronic\c";;
    8) echo "Retro\c";;
    9) echo "Polished\c";;
    10) echo "Electronic\c";;
    11) echo "SteamPunk\c";;
    12) echo "Stainless\c";;
    13) echo "Edible\c";;
    14) echo "Phone\c";;
    15) echo "Telex\c";;
    16) echo "Iphone\c";;
    17) echo "TV\c";;
    18) echo "Car\c";;
    19) echo "Bike\c";;
    20) echo "Postilion\c";;
    21) echo "Appliance\c";;
    22) echo "Utensil\c";;
    23) echo "Device\c";;
    24) echo "Hovercraft\c";;
    25) echo "Eels\c";;
    26) echo "Telephone\c";;
    27) echo "Laptop\c";;
    esac
}

n=$[ ( $RANDOM % 4 ) ]
while [ $n -gt 0 ]
do
    tag
    echo " \c"
    let n=$n-1
done

exit 0


