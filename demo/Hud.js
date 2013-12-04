window.addEvent('domready',function(){
	// var myMask = new gx.ui.Mask('myArea', {'background': '#555'});
	var myHud = new gx.ui.Hud($('body'), {'background': '#333'});
	myHud.add('myChild', $('myArea'), {'x': 'center', 'y': 'top'});
	
	// Hide the HUD if the blend is clicked
	myHud.addEvent('click', function() {
		myHud.hide();
	});
	
	$('btnShowBlend').addEvent('click', function() {
		//myHud.show();
		myHud.show('myChild', 1);
	});
	$('btnShowPlain').addEvent('click', function() {
		myHud.show('myChild', 0);
	});
});
