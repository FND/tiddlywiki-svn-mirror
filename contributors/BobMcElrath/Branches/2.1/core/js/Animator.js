// ---------------------------------------------------------------------------------
// Animation engine
// ---------------------------------------------------------------------------------

function Animator()
{
	this.running = 0; // Incremented at start of each animation, decremented afterwards. If zero, the interval timer is disabled
	this.timerID = 0; // ID of the timer used for animating
	this.animations = []; // List of animations in progress
	return this;
}

// Start animation engine
Animator.prototype.startAnimating = function() // Variable number of arguments
{
	for(var t=0; t<arguments.length; t++)
		this.animations.push(arguments[t]);
	if(this.running == 0)
		{
		var me = this;
		this.timerID = window.setInterval(function() {me.doAnimate(me);},5);
		}
	this.running += arguments.length;
}

// Perform an animation engine tick, calling each of the known animation modules
Animator.prototype.doAnimate = function(me)
{
	var a = 0;
	while(a < me.animations.length)
		{
		var animation = me.animations[a];
		if(animation.tick())
			a++;
		else
			{
			me.animations.splice(a,1);
			if(--me.running == 0)
				window.clearInterval(me.timerID);
			}
		}
}

// Map a 0..1 value to 0..1, but slow down at the start and end
Animator.slowInSlowOut = function(progress)
{
	return(1-((Math.cos(progress * Math.PI)+1)/2));
}

