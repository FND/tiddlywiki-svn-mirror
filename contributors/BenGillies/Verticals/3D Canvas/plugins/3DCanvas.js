//********multiply 2 matrices together.****
//**a must be a 2d array
//**b can be either 2d or 1d (a vector)
//**a[].length must always equal b.length
//*****************************************
function matMultiply(a,b)
{
	if (a[0].length == b.length)
	{//check sizes of matrices are equivalent for multiplication
		if (b[0][0])
		{//a and b are matrices
			var result = [];
			for (var h=0; h<b[0].length; h++)
			{
				result[h] = [];
			}
			for (var i=0; i<a.length; i++)
			{
				for (var j=0; j<b[0].length; j++)
				{
					result[j][i] = 0; //initialise c
					for (var k=0; k<b.length; k++)
					{
						result[j][i] += a[k][i] * b[j][k];
					}
				}
			}
			return result;
		}
		else
		{//b is a vector
			var result = [];
			for (var i=0; i<a.length; i++)
			{
				result[i] = 0; //initialise c
				for (var j=0; j<b.length; k++)
				{
					result[i] += a[j][i] * b[j];
				}
			}
			return result;
		}
	}
	else
	{//no other input is valid
		throw "Invalid input parameters to matrix multiplication";
	}
}

//***calculate the dot product of 2 vectors****
function dotProduct(a,b)
{
	var result = 0;
	if ((a.length == b.length))
	{//check both vectors are compatible
		for (var i=0; i<a.length; i++)
		{
			result += a[i] * b[i];
		}
		return result;
	}
}

//***calculate the cross product of 2 vectors****
function crossProduct(a,b)
{
	var result = [];
	if ((a.length >= 3)&&(b.length >= 3))
	{
		result[0] = a[1]*b[2]-a[2]*b[1];
		result[1] = a[2]*b[0]-a[0]*b[2];
		result[2] = a[0]*b[1]-a[1]*b[0];
		return result;
	}
}

//***calculate the unit vector of a vector
function unitVector(a)
{
	var total = 0;
	for (var i=0; i<a.length; i++)
	{
		total += Math.pow(a[i],2);
	}
	total = Math.sqrt(total);
	
	var result = [];
	for (var j=0; j < a.length; j++)
	{
		if (total > 0)
		{
			result[j] = a[j] / total;
		}
		else
		{
			result[j] = 0;
		}
	}
	
	return result;
}

