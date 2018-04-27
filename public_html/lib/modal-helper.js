'use strict';

$(document).on('shown.bs.modal', '.modal', function(e) {
	if (window.innerWidth >= 992)
		$('input:visible:enabled:first', this).focus();
});

window.onhashchange = function(e) {
	$('.modal').modal('hide');
	$('.modal-backdrop').css('opacity', 0);
	setTimeout(function(){
		$('.modal-backdrop').remove();
	}, 200);
};