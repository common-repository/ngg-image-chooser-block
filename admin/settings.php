<?php  
if(preg_match('#' . basename(__FILE__) . '#', $_SERVER['PHP_SELF'])) { die('You are not allowed to call this page directly.'); }

include_once (dirname (__FILE__).'/../constants.php');
    
	function nggic_admin_options()  {
	
	global $nggicb_options;	

	// get the options
	$nggicb_options = get_option('nggicb_options');

	if (!isset($nggicb_options['settings_version']) or ($nggicb_options['settings_version'] < NGGICB_SETTINGS_VERSION)) {
		include_once (dirname (__FILE__). '/../init.php');
	}

	if ( isset($_POST['updateoption']) ) {	
		check_admin_referer('nggicb_settings');
		// get the hidden option fields, taken from WP core
		if ( $_POST['page_options'] )
			$options = explode(',', sanitize_text_field($_POST['page_options']));
			
		if ($options) {
			foreach ($options as $option) {
				$option = sanitize_text_field($option);
				$value = isset($_POST[$option]) ? sanitize_text_field($_POST[$option]) : false;
				$nggicb_options[$option] = $value;
			}
		}
		
		// Save options
		update_option('nggicb_options', $nggicb_options);
	 	NggicbAdminPanel::render_message(__('Update successful','nggicb'));
	}
	
	?>
	<script type="text/javascript">
		jQuery(function() {
			jQuery('#slider').tabs({ fxFade: true, fxSpeed: 'fast' });
		});
		function setcolor(fileid,color) {
			jQuery(fileid).css("background", color );
		};
	</script>
	
	<div id="slider" class="wrap">
	
		<!-- General Options -->

		<div id="generaloptions">
			<h2><?php _e('Image Chooser Block for NextGEN Gallery Options','nggicb'); ?></h2>
			<form name="generaloptions" method="post">
			<?php wp_nonce_field('nggicb_settings') ?>
			<input type="hidden" name="page_options"
				value="sortby,insertion_option,tag_width,tag_height,default_alignment,default_mode,display_info,template" />
			<table class="form-table">
				<tr>
					<th><?php _e('Image sort order','nggicb') ?></th>
					<td>
						<select size="1" name="sortby">
							<option value="gallery_order" <?php selected("gallery_order" , $nggicb_options['sortby']); ?> ><?php _e('NextGEN Gallery order', 'nggicb') ;?></option>
							<option value="title_asc" <?php selected("title_asc" , $nggicb_options['sortby']); ?> ><?php _e('NextGEN Gallery Title (A-z)', 'nggicb') ;?></option>
							<option value="title_desc" <?php selected("title_desc" , $nggicb_options['sortby']); ?> ><?php _e('NextGEN Gallery Title (z-A)', 'nggicb') ;?></option>
							<option value="orig_time_desc" <?php selected("orig_time_desc" , $nggicb_options['sortby']); ?> ><?php _e('Origination Time (Newest First)', 'nggicb') ;?></option>
							<option value="orig_time_asc" <?php selected("orig_time_asc" , $nggicb_options['sortby']); ?> ><?php _e('Origination Time (Oldest First)', 'nggicb') ;?></option>
						</select>
                    </td>
				</tr>
				<tr>
					<th><?php _e('How to Insert Image','nggicb') ?></th>
					<td>
						<select size="1" name="insertion_option">
							<option value="ngg_singlepic" <?php selected("ngg_singlepic" , $nggicb_options['insertion_option']); ?> ><?php _e('NGG tag of image', 'nggicb') ;?></option>
							<option value="ngg_thumb" <?php selected("ngg_thumb" , $nggicb_options['insertion_option']); ?> ><?php _e('NGG tag of thumbnail', 'nggicb') ;?></option>
							<option value="ngg_thumb_multi" <?php selected("ngg_thumb_multi" , $nggicb_options['insertion_option']); ?> ><?php _e('NGG tag of multiple thumbnails', 'nggicb') ;?></option>
							<option value="thumbnail_image" <?php selected("thumbnail_image" , $nggicb_options['insertion_option']); ?> ><?php _e('Thumbnail with link to image', 'nggicb') ;?></option>
							<option value="thumbnail_custom_url" <?php selected("thumbnail_custom_url" , $nggicb_options['insertion_option']); ?> ><?php _e('Thumbnail with link to custom URL', 'nggicb') ;?></option>
							<option value="thumbnail_only" <?php selected("thumbnail_only" , $nggicb_options['insertion_option']); ?> ><?php _e('Thumbnail only - no link', 'nggicb') ;?></option>
							<option value="fullsize_only" <?php selected("fullsize_only" , $nggicb_options['insertion_option']); ?> ><?php _e('Fullsized image only - no link', 'nggicb') ;?></option>
							<option value="link_image" <?php selected("link_image" , $nggicb_options['insertion_option']); ?> ><?php _e('Text link to image', 'nggicb') ;?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th><?php _e('Default image size (W x H)','nggicb') ?></th>
					<td><input type="text" size="3" maxlength="4" name="tag_width" value="<?php echo $nggicb_options['tag_width'] ?>" /> x
					<input type="text" size="3" maxlength="4" name="tag_height" value="<?php echo $nggicb_options['tag_height'] ?>" />
					<span class="description"><?php _e('Define width and/or height of the fullsized image. Leave blank for original size.','nggicb') ?></span></td>
				</tr>
<!--
				<tr>
					<th><?php _e('Images per page','nggicb') ?></th>
					<td><input type="text" size="3" maxlength="4" name="images_per_page" value="<?php echo $nggicb_options['images_per_page'] ?>" />
					<span class="description"><?php _e('Define how many images should be displayed on one page.','nggicb') ?></span></td>
				</tr>
-->
				<tr>
					<th><?php _e('NGG float class','nggicb') ?></th>
					<td>
					<select size="1" name="default_alignment">
						<option value="none" <?php selected("none" , $nggicb_options['default_alignment']); ?> ><?php _e('None', 'nggicb') ;?></option>
						<option value="left" <?php selected("left" , $nggicb_options['default_alignment']); ?> ><?php _e('Float Left', 'nggicb') ;?></option>
						<option value="right" <?php selected("right" , $nggicb_options['default_alignment']); ?> ><?php _e('Float Right', 'nggicb') ;?></option>
					</select>
					<span class="description"><?php _e('Define whether fullsized images should be floating.','nggicb') ?></span></td>
				</tr>
				<tr>
					<th><?php _e('Mode','nggicb') ?></th>
					<td>
					<select size="1" name="default_mode">
						<option value="default" <?php selected("default" , $nggicb_options['default_mode']); ?> ><?php _e('Default', 'nggicb') ;?></option>
						<option value="web20" <?php selected("web20" , $nggicb_options['default_mode']); ?> ><?php _e('Web 2.0', 'nggicb') ;?></option>
						<option value="watermark" <?php selected("watermark" , $nggicb_options['default_mode']); ?> ><?php _e('Watermark', 'nggicb') ;?></option>
					</select>
					<span class="description"><?php _e('Select the image display mode.','nggicb') ?></span></td>
				</tr>
				<tr>
					<th><?php _e('Template','nggicb') ?></th>
					<td><input type="text" size="30" maxlength="30" name="template" value="<?php echo $nggicb_options['template'] ?>" />
					<span class="description"><?php _e('Default template name (Leave blank for default template).','nggicb') ?></span></td>
				</tr>
				<tr>
					<th><?php _e('Display image infomation','nggicb') ?></th>
					<td><input name="display_info" type="checkbox" value="1" <?php checked(true , $nggicb_options['display_info']); ?> />
					<span class="description"><?php _e('Enables displaying of image information together with thumbnails.','nggicb') ?></span></td>
				</tr>
			</table>
			<div class="submit"><input class="button-primary" type="submit" name="updateoption" value="<?php _e('Update') ;?>"/></div>
			</form>	
		</div>
	</div>

	<?php
}

?>
