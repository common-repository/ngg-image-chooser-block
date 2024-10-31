<?php
/*
    NextGEN Gallery Image Chooser
    Version 1.0.3

    Author: Ulrich Mertin
    
    Released under the GPL version 2.
    A copy of the license is in the root folder of this plugin.
*/

require_once 'constants.php';

nggicb_setdefaults();

/**
* Sets the default options in the global variable $nggicb_options.
*
* @param NULL
* @return NULL
*/
function nggicb_setdefaults() {
	global $nggicb_options;

	$nggicb_options = [];
	$nggicb_options['sortby'] = 'gallery_order';
	$nggicb_options['insertion_option'] = 'ngg_thumb_multi';
	$nggicb_options['tag_width'] = '';
	$nggicb_options['tag_height'] = '';
	$nggicb_options['images_per_page'] = 15;
	$nggicb_options['default_alignment'] = 'none';
	$nggicb_options['default_mode'] = 'default';
	$nggicb_options['custom_url'] = 'http://';
	$nggicb_options['display_info'] = TRUE;
	$nggicb_options['template'] = '';
	$nggicb_options['settings_version'] = NGGICB_SETTINGS_VERSION;
}

?>
