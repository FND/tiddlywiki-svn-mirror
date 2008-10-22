function ThreeD(){
	this.angle = 0;

	this.Poly = new Array();

	this.left = 0;
	this.top = 0;
	this.right = 800;
	this.bottom = 480;

	this.GetTranslation = funcGetTranslation;
	this.GetHidden = funcGetHidden;
	this.Move = funcMove;
	this.Rotate = funcRotate;
	this.Scale = funcScale;
	this.SetBounds = funcSetBounds;
	this.SetPoints = funcSetPoints;
	this.SetRotation = funcSetRotation;
	this.ZSort = funcZSort;

	function funcGetTranslation(){
		var TransPoly = new Array();
		polylen=this.Poly.length;
		centerx=this.right>>1;
		centery=this.bottom>>1;

		for(var value=0, newvalue=0;value<polylen;value++){
			poly2=1500-this.Poly[value][2];
			poly5=1500-this.Poly[value][5];

			if(poly2>=1300 && poly5>=1300 && poly5>=1300){
				TransPoly[newvalue] = new Array();
				TransPoly[newvalue][0] = centerx+((this.Poly[value][0]*1000)/poly2)|0;
				TransPoly[newvalue][1] = centery+((this.Poly[value][1]*1000)/poly2)|0;
				TransPoly[newvalue][2] = centery+((this.Poly[value][4]*1000)/poly2)|0;
				TransPoly[newvalue][3] = centerx+((this.Poly[value][3]*1000)/poly5)|0;
				TransPoly[newvalue][4] = centery+((this.Poly[value][1]*1000)/poly5)|0;
				TransPoly[newvalue][5] = centery+((this.Poly[value][4]*1000)/poly5)|0;
				TransPoly[newvalue][6] = this.Poly[value][6];
				newvalue++;
			}
		}
		return TransPoly;
	}

	function funcSetBounds(x1, y1, x2, y2){
		this.left = x1;
		this.top = y1;
		this.right = x2;
		this.bottom = y2;
	}
	function funcSetPoints(Poly){
		polylen = Poly.length
		for(var value=0;value<polylen;value++) this.Poly[value] = Poly[value].slice();
	}
	function funcSetRotation(angle){
		this.angle = angle * Math.PI/180;
	}

	function funcGetHidden(Points){
		return (Points[3]-Points[0]<=0)?false:true;
	}
	function funcScale(x, z, min, max, scale){
		scale=Math.abs(scale);
		if(min<0) min=0;
		if(max>this.Poly.length) this.Poly.length-1;
		if(min>max) min=max;
		for(var value=min;value<=max;value++){
			this.Poly[value][5] = ((this.Poly[value][5]-z)*scale)|0;
			this.Poly[value][3] = ((this.Poly[value][3]-x)*scale)|0;
			this.Poly[value][2] = ((this.Poly[value][2]-z)*scale)|0;
			this.Poly[value][0] = ((this.Poly[value][0]-x)*scale)|0;
		}
	}
	function funcMove(x, z, min, max){
		z=z|0;
		x=x|0;
		if(min<0) min=0;
		if(max>this.Poly.length) this.Poly.length-1;
		if(min>max) min=max;
		for(var value=min;value<=max;value++){
			this.Poly[value][5] += z;
			this.Poly[value][3] += x;
			this.Poly[value][2] += z;
			this.Poly[value][0] += x;
		}
	}
	function funcRotate(axisx, axisz, min, max){
		if(max>=this.Poly.length) this.Poly.length-1;
		if(min<0)
			min=0;
		else if(min>max)
			min=max;
		cos = Math.cos(this.angle);
		sin = Math.sin(this.angle);
		for(var value=min;value<=max;value++){
			tempz = this.Poly[value][5]-axisz;
			tempx = cos*(this.Poly[value][3]-axisx) + sin*tempz;
			this.Poly[value][5] = (cos*tempz-sin*(this.Poly[value][3]-axisx))|0;
			this.Poly[value][3] = tempx|0;
			tempz = this.Poly[value][2]-axisz;
			tempx = cos*(this.Poly[value][0]-axisx) + sin*tempz;
			this.Poly[value][2] = (cos*tempz-sin*(this.Poly[value][0]-axisx))|0;
			this.Poly[value][0] = tempx|0;
		}
	}
	function funcZSort(){
		this.Poly.sort(function(a,b){return a[2]+a[5]-b[2]-b[5]});
	}
}

ThreeDee = new ThreeD();