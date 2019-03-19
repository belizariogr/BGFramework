'use strict';

$(document).on('shown.bs.modal', '.modal', e => {
	if (window.innerWidth >= 992)
		$('input:visible:enabled:first', this).focus();
});

window.onhashchange = e => {
	$('.modal').modal('hide');
	$('.modal-backdrop').css('opacity', 0);
	setTimeout(function(){
		$('.modal-backdrop').remove();
	}, 200);
};

window.onclick = event => {
	if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-container') && !event.target.matches('.dropdown-content')) {
		var dropdowns = document.getElementsByClassName("dropdown-container");
	    var i;
	    for (i = 0; i < dropdowns.length; i++) {	      	
	      	if (dropdowns[i].classList.contains('show'))
	        	dropdowns[i].classList.remove('show');
	    }
	}
}