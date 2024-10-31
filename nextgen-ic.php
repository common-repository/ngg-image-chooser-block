<?php
/*
 * Plugin Name: Image Chooser Block for NextGEN Gallery
 * Plugin URI: http://www.ulrich-mertin.de/nggic
 * Description: Comfortable image chooser for the NextGEN Gallery (Gutenberg Block).
 * Version: 1.0.3
 * Author: Ulrich Mertin
 * Author URI: http://www.ulrich-mertin.de
 */

defined( 'ABSPATH' ) || exit;

require_once 'constants.php';

/**
 * Load all translations for our plugin from the MO file.
 */
add_action( 'init', 'nggicb_load_textdomain' );
add_action( 'wp_ajax_ajax-getAlbumsAndGalleries', 'nggicb_get_albums_and_galleries' );
add_action( 'wp_ajax_nopriv_ajax-getAlbumsAndGalleries', 'nggicb_get_albums_and_galleries' );
add_action( 'wp_ajax_ajax-getImages', 'nggicb_get_images' );
add_action( 'wp_ajax_nopriv_ajax-getImages', 'nggicb_get_images' );
add_action( 'wp_ajax_ajax-getOptions', 'nggicb_get_options' );
add_action( 'wp_ajax_nopriv_ajax-getOptions', 'nggicb_get_options' );

function nggicb_load_textdomain() {
	load_plugin_textdomain( 'nggicb', false, basename( __DIR__ ) . '/languages' );
}

function nggicb_get_options() {
    global $nggicb_options;
    
    $nggicb_options = get_option ( 'nggicb_options' );
	
    if (!isset($nggicb_options['settings_version']) or ($nggicb_options['settings_version'] < NGGICB_SETTINGS_VERSION)) {
	    include_once (dirname ( __FILE__ ) . '/init.php'); // default settings
	    update_option ( 'nggicb_options', $nggicb_options );
	}
	
	if ($nggicb_options) {
		$response = json_encode($nggicb_options);
	} else {
		$response = "{}";
	}
	
	// response output
	header( "Content-Type: application/json" );
	echo $response;
	
	exit;
}

function nggicb_find_index_by_gid($galleries, $gid) {
	foreach ( $galleries as $key => $gallery ) {
		if ($gallery->gid == $gid) {
			return $key;
		}
	}
	return NULL;
}

/**
 * Get the tree of albums and galleries in JSON format.
 */
function nggicb_get_albums_and_galleries() {
	global $albums, $galleries;
	
	$galleries = array ();
	$albums = array ();
	$rootalbums = array ();
	
	// Get all galleries
	$orphan_galleries = C_Gallery_Mapper::get_instance ()->find_all ();
	
	// Set up key-less arrays and get galleries for albums
	// Remove all attached galleries from $orphan_galleries
	foreach ( C_Album_Mapper::get_instance ()->find_all () as $album ) {
		$album->expanded = false;
		$albums [$album->{$album->id_field}] = $album;
		$rootalbums [$album->{$album->id_field}] = $album;
		foreach ( $album->sortorder as $value ) {
			if (! nggicb_starts_with ( $value, 'a' )) {
				// gallery
				if (! key_exists ( $value, $galleries )) {
					$id = nggicb_find_index_by_gid ( $orphan_galleries, $value );
					$galleries [$value] = $orphan_galleries [$id];
					unset ( $orphan_galleries [$id] );
				}
			}
		}
	}
	
	// Find root albums by removing all albums that are subalbums of other
	// albums from the list
	// Find orphan galleries by removing all galleries that are attached to
	// albums
	foreach ( $albums as $id => $album ) {
		foreach ( $album->sortorder as $key => $value ) {
			if (nggicb_starts_with ( $value, 'a' )) {
				// album
				$album_id = substr ( $value, 1 );
				unset ( $rootalbums [$album_id] );
			}
		}
	}
	
	// Build tree
	$gallery_children = array ();
	foreach ( $rootalbums as $index => $rootalbum ) {
		$node = new stdClass();
		$node->id = 'a'.$rootalbum->id;
		$node->text = $rootalbum->name;
		// $node->type = 'album';
		$children = nggicb_get_children ( $rootalbum );
		$node->children = $children;
		$gallery_children [] = $node;
	}
	
	foreach ( $orphan_galleries as $index => $orphan_gallery ) {
		$node = new stdClass();
		$node->id = $orphan_gallery->gid;
		$node->text = $orphan_gallery->title;
		$node->isLeaf = true;
		// $orphan_gallery->type = 'gallery';
		$gallery_children [] = $node;
	}
	
	$response = json_encode($gallery_children);
	
	// response output
	header( "Content-Type: application/json" );
	echo $response;
	
	exit;
}

/**
 * Get child objects (albums and galleries) of an album
 *
 * @return array $children The recursive array of child albums and galleries
 */
function nggicb_get_children($parent) {
	global $albums, $galleries;
	
	$children = array ();
	foreach ( $parent->sortorder as $key => $value ) {
		if (nggicb_starts_with ( $value, 'a' )) {
			// album, recurse
			$album_id = substr ( $value, 1 );
			$album = $albums [$album_id];
			$node = new stdClass();
			$node->id = $value;
			$node->text = $album->name;
			$subchildren = nggicb_get_children ( $album );
			$node->children = $subchildren;
			$children [] = $node;
		} else {
			$gallery = $galleries [$value];
			$node = new stdClass();
			$node->id = $value;
			$node->text = $gallery->title;
			$node->isLeaf = true;
			$children [] = $node;
		}
	}
	return $children;
}

/**
 * Get the metadata of all images in a gallery in JSON format.
 */
function nggicb_get_images() {
	
	GLOBAL $nggdb;
	
	$gallery_id = sanitize_text_field($_POST['gallery']);
	
	$items = $nggdb->get_gallery ( $gallery_id );
	
	$item_infos = array ();
	$order = 0;
	
	foreach ( $items as $item ) {
		$image = $nggdb->find_image ( $item->pid );
		
		$item_info ['id'] = $item->pid;
		$item_info ['title'] = $image->alttext;
		$item_info ['description'] = $image->description;
		$date = new DateTime($item->imagedate);
		$item_info ['date'] = $date->format('Y-m-d\TH:i:s.000\Z');
		$item_info ['order'] = ++$order;
		
		$item_info ['image_url'] = $image->imageURL;
		$item_info ['fullsize_img'] = $image->imageURL;
		$item_info ['thumbnail_src'] = $image->thumbnailURL;
		
		$thumb_meta = $image->meta_data ['thumbnail'];
		$item_info ['thumbnail_width'] = $thumb_meta ['width'];
		$item_info ['thumbnail_height'] = $thumb_meta ['height'];
		
		$item_infos[] = $item_info;
	}
	
	$response = json_encode($item_infos);
	
	// response output
	header( "Content-Type: application/json" );
	echo $response;
	
	exit;
}

/**
 * Initializes the NGGICB settings.
 */
function nggicb_pluginactivate() {
	global $nggicb_options;
	
	if (! is_plugin_active ( 'nextgen-gallery/nggallery.php' )) {
		die ( __ ( 'Required NextGEN Gallery was not found!', 'nggicb' ) );
	}
	
	// Get NGGICB Option Settings
	$nggicb_options = get_option ( 'nggicb_options' );
	
	// Has NGGICB Plugin Not been correctly deactivated as Options should not yet exist.
	if (!$nggicb_options) {
		// Add BTEV Event Message
		if (function_exists ( 'btev_trigger_error' )) {
			btev_trigger_error ( 'Image Chooser Block for NextGEN Gallery PLUGIN WAS NOT DEACTIVATED', E_USER_NOTICE, __FILE__ );
		}
		nggicb_plugindeactivate ();
		$nggicb_options = '';
	}
	
	include_once (dirname ( __FILE__ ) . '/init.php'); // default settings
	
	update_option ( 'nggicb_options', $nggicb_options );
	
	// Add BTEV Event Message
	if (function_exists ( 'btev_trigger_error' )) {
		btev_trigger_error ( 'Image Chooser Block for NextGEN Gallery PLUGIN ACTIVATED', E_USER_NOTICE, __FILE__ );
	}
}

/**
 * Removes all the NGGICB settings.
 */
function nggicb_plugindeactivate() {
	
	// Delete NGGICB Option Settings
	delete_option ( 'nggicb_options' );
	
	// Add BTEV Event Message
	if (function_exists ( 'btev_trigger_error' )) {
		btev_trigger_error ( 'Image Chooser Block for NextGEN Gallery PLUGIN DEACTIVATED', E_USER_NOTICE, __FILE__ );
	}
}

/**
 * Registers all block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * Passes translations to JavaScript.
 */
function nggicb_register_block() {
	
	// automatically load dependencies and version
	$asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php');
	
	wp_register_script(
		'nggicb',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
		);
	
	wp_localize_script(
		'nggicb',
		'ENV',
		[
			'pluginPath' => plugins_url( '', __FILE__ ),
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
		]
		);
	
	wp_register_style(
		'nggic-style',
		plugins_url( 'style.css', __FILE__ ),
		array( ),
		filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
		);

	wp_enqueue_style( 'nggic-style' );
	
	register_block_type( 'nggic/nextgen-gallery-image-chooser-block', array(
		'style' => 'nggic-style',
		'editor_script' => 'nggicb',
	) );
	
	if ( function_exists( 'wp_set_script_translations' ) ) {
		/**
		 * May be extended to wp_set_script_translations( 'my-handle', 'my-domain',
		 * plugin_dir_path( MY_PLUGIN ) . 'languages' ) ). For details see
		 * https://make.wordpress.org/core/2018/11/09/new-javascript-i18n-support-in-wordpress/
		 */
		wp_set_script_translations( 'nggicb', 'nggicb' );
	}
	
}

register_activation_hook ( __FILE__, 'nggicb_pluginactivate' );
register_deactivation_hook ( __FILE__, 'nggicb_plugindeactivate' );

add_action( 'init', 'nggicb_register_block' );

// Create admin menu
if (is_admin ()) {
	require_once (dirname ( __FILE__ ) . '/admin/admin.php');
	new NggicbAdminPanel ();
}

/**
 * Helper function to determine if one text starts with another.
 *
 * @param string $haystack
 *        	the text to search in
 * @param string $needle
 *        	the text to search for
 * @return true, if $haystack starts with $needle, else false
 *
 */
function nggicb_starts_with($haystack, $needle) {
	$length = strlen ( $needle );
	return (substr ( $haystack, 0, $length ) === $needle);
}

?>