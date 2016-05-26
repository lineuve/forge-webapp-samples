
/**
 * Run when DOM is ready.
 * The Forge object already exists in this point
 */
jQuery(function ($) {

	//First let's see if we have a valid access token
	if (Autodesk.Forge.Client.isAccessTokenValid()) {
		$('#auth-iframe-wrapper').hide();
		$('.logged-out-container').hide();
		$('.logged-in-container').show();

	} else {
		$('.logged-out-container').show();
		$('.logged-in-container').hide();

	}
});
