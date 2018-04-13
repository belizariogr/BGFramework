var menuHidden = true;

var sidebarBtnMobile = function(){
	$("#wrapper").removeClass("toggled-2");
	$("#wrapper").toggleClass("toggled");
	menuHidden = !$("#wrapper").hasClass("toggled");
}

var sidebarBtn = function(){
	$("#wrapper").removeClass("toggled");
	$("#wrapper").toggleClass("toggled-2");
}

var closeMenu = function(){
	if ($("#main-bar").is(":visible"))
		$("#nav-toggle").click();
}

$(document).on('click', '#nav-toggle', function(e) {
	if (!menuHidden)
		sidebarBtnMobile();
	e.stopPropagation();
	return false;
});

$(document).on('click', '#menu-toggle', function(e) {
	closeMenu();
	sidebarBtnMobile();
	e.stopPropagation();
	return false;
});

$(document).on('click', '#menu-toggle-2', function(e) {
	e.preventDefault();
	e.stopPropagation();
	sidebarBtn();
});

$(document).on('click', '#main-bar li a', function(e) {
	if ($("#menu-toggle").is(":visible"))
		closeMenu();
});

$(document).on('click', '#menu li a', function(e) {
	var checkElement = $(this).next();
	if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
		checkElement.slideUp('normal');
		$('#menu li').removeClass('menu-open');
	} else if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
		$('#menu ul:visible').slideUp('normal');
		$('#menu li').removeClass('menu-open');
		checkElement.slideDown('normal');
		$(this).parent().toggleClass('menu-open');
		return false;
	} else {
		var href = $(this).attr('href');
		if (!!href && href !== '#'){
			var menuButton = $('#menu-toggle');
			if (menuButton.is(':visible'))
				sidebarBtnMobile();
			window.location.href = href;
		}
	}
});

$(document).click(function(e) {
	if ($("#menu-toggle").is(":visible")){
		var target = $(e.target);
		if (target.is('i'))
			target = target.parent();
		target = target.attr('id');
		if (target != 'menu-toggle' && target != 'nav-toggle'){
			if (!menuHidden && !$(e.target).closest('#sidebar-wrapper').length)
				sidebarBtnMobile();
			if ($("#main-bar").is(":visible") && !$(e.target).closest('#main-bar').length)
				closeMenu();
		}
	}
});