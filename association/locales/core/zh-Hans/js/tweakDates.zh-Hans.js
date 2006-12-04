
Date.prototype.getAmPm = function()
{
	return this.getHours() >= 12 ? "下午" : "上午";
}
