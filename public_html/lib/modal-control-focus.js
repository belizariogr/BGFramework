
$(document).on('shown.bs.modal', '.modal', function() {

	$('input:visible:enabled:first', this).focus();

})