import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, RadioControl,  SelectControl, TextControl } from '@wordpress/components';
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import axios from 'axios';

import ImageScrollView from "../ImageScrollView";

const SortOptionsSelectControl = (({ value, setValue }) => (
	<SelectControl
		label="Sorted by:"
		className="nggic-select"
		value={value}
		options={[
			{ label: __('Gallery Order', 'nggicb'), value: 'gallery_order' },
			{ label: __('Gallery Title (A-z)', 'nggicb'), value: 'title_asc' },
			{ label: __('Gallery Title (z-A)', 'nggicb'), value: 'title_desc' },
			{ label: __('Origination Time (Newest First)', 'nggicb'), value: 'orig_time_asc' },
			{ label: __('Origination Time (Oldest First)', 'nggicb'), value: 'orig_time_desc' },
		]}
		onChange={(value) => setValue(value)}
	/>
));

const InsertionOptionsSelectControl = (({ value, setValue }) => (
	<SelectControl
		label="How to insert image(s)"
		className="nggic-select"
		value={value}
		options={[
			{ label: __('NGG tag of image', 'nggicb'), value: 'ngg_singlepic' },
			{ label: __('NGG tag of thumbnail', 'nggicb'), value: 'ngg_thumb' },
			{ label: __('NGG tag of multiple thumbnails', 'nggicb'), value: 'ngg_thumb_multi' },
			{ label: __('Thumbnail with link to image', 'nggicb'), value: 'thumbnail_image' },
			{ label: __('Thumbnail with link to custom URL', 'nggicb'), value: 'thumbnail_custom_url' },
			{ label: __('Thumbnail only - no link', 'nggicb'), value: 'thumbnail_only' },
			{ label: __('Fullsized image only - no link', 'nggicb'), value: 'fullsize_only' },
			{ label: __('Text link to image', 'nggicb'), value: 'link_image' },
		]}
		onChange={(value) => { setValue(value) }}
	/>
));

const FloatClassSelectControl = (({ value, setValue }) => (
	<SelectControl
		label="NGG Float Class"
		className="nggic-select"
		value={value}
		options={[
			{ label: __('None', 'nggicb'), value: 'none' },
			{ label: __('Float left', 'nggicb'), value: 'left' },
			{ label: __('Float right', 'nggicb'), value: 'right' },
		]}
		onChange={(value) => { setValue(value) }}
	/>
));

const ModeSelectControl = (({ value, setValue }) => (
	<SelectControl
		label="Mode"
		className="nggic-select"
		value={value}
		options={[
			{ label: __('Default', 'nggicb'), value: 'default' },
			{ label: __('Web 2.0', 'nggicb'), value: 'web20' },
			{ label: __('Watermark', 'nggicb'), value: 'watermark' },
		]}
		onChange={(value) => { setValue(value) }}
	/>
));

const NGGICTextControl = (({ value, setValue }) => (
	<TextControl value={ value } onChange={ (value) => setValue(value) } />
));

const NGGICNumberControl = (({ value, setValue }) => (
	<NumberControl value={ value } onChange={ (value) => setValue(value) } isShiftStepEnabled={ true } shiftStep={ 10 } />
));

const InfoRadioControl = (({ displayInfo, setDisplayInfo }) => (
	<RadioControl selected={displayInfo}
		options={ [
			{ label: 'Thumbnails', value: '0' },
			{ label: 'Thumbnails with info', value: '1'},
		] }
		onChange={ ( option ) => setDisplayInfo(option) }
	/>
));

class ImageArea extends Component {

	constructor(props) {
		super(props);
		this.sortOption = props.options['sortby'];
		this.state = { images: [], width: props.options['tag_width'], height: props.options['tag_height'], customUrl: props.options['custom_url'],
			textLink: '', link: '', template: props.options['template'], imageBrowser: false, displayInfo: props.options['display_info'] ? '1' : '0',
			insertionOption: props.options['insertion_option'], mode: props.options['default_mode'], floatClass: props.options['default_alignment'] };
		this.imageViewList = [];
	}

	loadImages() {
		axios({
			method: 'post',
			url: ENV.ajaxurl,
			data: 'action=ajax-getImages&gallery=' + this.props.gallery.id,
		})
			.then(res => {
				res.data.forEach(function(image) {
					image.checked = false;
				});
				this.sortImages(res.data);
				this.setState({ images: res.data })
			}
			);
	}

	componentDidMount() {
		this.loadImages();
	}

	componentDidUpdate(prevProps) {
		// compare with previous props
		if (prevProps.gallery.id !== this.props.gallery.id) {
			this.setState({ images: [] });
			this.loadImages();
		}
	}

	insertSelectedGallery() {
		var options = { 'album_id': undefined, 'gallery_id': this.props.gallery.id, 'sortby': this.sortOption,
			'display_info': this.state.displayInfo == '1', 'insertion_option': this.state.insertionOption,
			'template': this.state.template, 'custom_url': this.state.customUrl, 'default_alignment': this.state.floatClass,
			'default_mode': this.state.mode, 'tag_height': this.state.height, 'tag_width': this.state.width};
		var templateAttr = this.state.template.length > 0 ? ' template="' + this.state.template + '"' : '';
		var tag;
		if (this.state.imageBrowser) {
			tag = '[imagebrowser';
		} else {
			tag = '[nggallery';
		}
		tag += ' id=' + this.props.gallery.id + templateAttr +  ']';
		this.props.setResult(tag, undefined, options);
	}

	insertSelectedImages() {
		var options = { 'album_id': undefined, 'gallery_id': this.props.gallery.id, 'sortby': this.sortOption,
			'display_info': this.state.displayInfo == '1', 'insertion_option': this.state.insertionOption,
			'template': this.state.template, 'custom_url': this.state.customUrl, 'default_alignment': this.state.floatClass,
			'default_mode': this.state.mode, 'tag_height': this.state.height, 'tag_width': this.state.width};

		var selectedImages = [];
		this.state.images.forEach(function(image) {
			if (image.checked) {
				selectedImages.push(image);
			}
		});
		if (selectedImages.length > 0) {
			options['image_count'] = selectedImages.length;
			var templateAttr = this.state.template.length > 0 ? ' template="' + this.state.template + '"' : '';
			switch(this.state.insertionOption) {
				case 'ngg_singlepic':
					var tag = '';
					var floatClass = this.state.floatClass;
					var mode = this.state.mode;
					var width = this.state.width;
					var height = this.state.height;
					var link = this.state.link;
					selectedImages.forEach(function(image) {
						tag += '[singlepic id=' + image.id;
						if (floatClass != 'none') tag += ' float="' + floatClass + '"';
						if (width) tag += ' w="' + width + '"';
						if (height) tag += ' h="' + height + '"';
						if (link != '') tag += ' link="' + link + '"';
						if (mode != 'default') tag += ' mode="' + mode + '"';
						tag += templateAttr;
						tag +=  ']';
					});
					this.props.setResult(tag, undefined, options);
					break;
				case 'ngg_thumb':
					var tag = '';
					selectedImages.forEach(function(image) {
						tag = tag + '[thumb id=' + image.id + templateAttr +  ']';
					});
					this.props.setResult(tag, undefined, options);
					break;
				case 'ngg_thumb_multi':
					var ids = '';
					selectedImages.forEach(function(image) {
						ids = ids + image.id + ',';
					});
					var tag = '[thumb id=' + ids.substr(0, ids.length - 1) + templateAttr + ']';
					this.props.setResult(tag, undefined, options);
					break;
				case 'thumbnail_image':
					var html = '';
					selectedImages.forEach(function(image) {
						html = html + '<a href="' + image.fullsize_img + '"><img title="' + image.description + '" src="' + image.thumbnail_src +
						'" alt="' + image.title + '" width="' + image.thumbnail_width +'" height="' + image.thumbnail_height + '"/></a>';
					});
					this.props.setResult(undefined, html, options);
					break;
				case 'thumbnail_custom_url':
					var customUrl = this.state.customUrl;
					var html = '';
					selectedImages.forEach(function(image) {
						html = html + '<a href="' + customUrl + '"><img title="' + image.description + '" src="' + image.thumbnail_src +
						'" alt="' + image.title + '" width="' + image.thumbnail_width +'" height="' + image.thumbnail_height + '"/></a>';
					});
					this.props.setResult(undefined, html, options);
					break;
				case 'thumbnail_only':
					var html = '';
					selectedImages.forEach(function(image) {
						html = html + '<img title="' + image.description + '" src="' + image.thumbnail_src +
						'" alt="' + image.title + '" width="' + image.thumbnail_width +'" height="' + image.thumbnail_height + '"/>';
					});
					this.props.setResult(undefined, html, options);
					break;
				case 'fullsize_only':
					var html = '';
					selectedImages.forEach(function(image) {
						html = html + '<img title="' + image.description + '" src="' + image.fullsize_img +
						'" alt="' + image.title + '"/>';
					});
					this.props.setResult(undefined, html, options);
					break;
				case 'link_image':
					var textLink = this.state.textLink;
					var html = '';
					selectedImages.forEach(function(image) {
						html = html + '<a href="' + image.fullsize_img + '"><p>' + textLink + '</p></a>';
					});
					this.props.setResult(undefined, html, options);
					break;
				default:
					alert('Unknown insertion option ' + this.state.insertionOption);
			}
		} else {
			alert('No images selected');
		}

	}

	selectAllImages() {
		this.imageViewList.forEach(function(imageView) {
			imageView.setChecked(true);
		});
	}

	unselectAllImages() {
		this.imageViewList.forEach(function(imageView) {
			imageView.setChecked(false);
		});
	}

	sortImages(images) {
		switch (this.sortOption) {
			case 'gallery_order':
				images.sort(function(left, right) { return left.order - right.order });
				break;
			case 'title_asc':
				images.sort(function(left, right) { return left.title.localeCompare(right.title) });
				break;
			case 'title_desc':
				images.sort(function(left, right) { return right.title.localeCompare(left.title) });
				break;
			case 'orig_time_asc':
				images.sort(function(left, right) { return left.date.localeCompare(right.date) });
				break;
			case 'orig_time_desc':
				images.sort(function(left, right) { return right.date.localeCompare(left.date) });
				break;
			default:
				alert('Unknown sort option ' + this.sortOption);
		}
	}

	setSortOption(sortOption) {
		this.sortOption = sortOption;
		this.sortImages(this.state.images);
		this.setState({ images: this.state.images });
	}

	setInsertionOption(insertionOption) {
		this.setState({ insertionOption: insertionOption });
	}
	
	setWidth(width) {
		this.setState({ width: width });
	}
	
	setHeight(height) {
		this.setState({ height: height });
	}
	
	setFloatClass(floatClass) {
		this.setState({ floatClass: floatClass });
	}
	
	setMode(mode) {
		this.setState({ mode: mode });
	}
	
	setLink(link) {
		this.setState({ link: link });
	}
	
	setCustomUrl(customUrl) {
		this.setState({ customUrl: customUrl });
	}
	
	setTextLink(textLink) {
		this.setState({ textLink: textLink });
	}
	
	setTemplate(template) {
		this.setState({ template: template });
	}
	
	setDisplayInfo(displayInfo) {
		this.setState({displayInfo: displayInfo});
	}
	
	render() {
		var list = this.imageViewList;
		return (<>
			<View key="buttons">
				<fieldset className='nggic-fieldset'><legend>Insert a NGG tag for the current gallery: {this.props.gallery.text}</legend>
					<div style={{ display: 'flex', marginLeft: 5 }}>
						<CheckboxControl key={'checkboxImageBrowser'} checked={this.state.imageBrowser}
							label='Insert gallery as image Browser'
							onChange={(checked) => {
								this.setState({ imageBrowser: checked });
							}}
						/>
					</div>
					<div style={{ display: 'flex' }}>
						<Button key="btnInsertGallery" className="insert-button" onClick={this.insertSelectedGallery.bind(this)} isPrimary="true">Insert</Button>
						<Text style={{ margin: 5 }}>Set the template name in &quot;Insertion Options&quot; below</Text>
					</div>
				</fieldset>
				<fieldset className='nggic-fieldset'><legend>Display Options</legend>
					<SortOptionsSelectControl value={this.sortOption} setValue={this.setSortOption.bind(this)} />
					<InfoRadioControl displayInfo={this.state.displayInfo} setDisplayInfo={this.setDisplayInfo.bind(this)} />
				</fieldset>
				<fieldset className='nggic-fieldset'><legend>Insertion Options</legend>
					<InsertionOptionsSelectControl value={this.state.insertionOption} setValue={this.setInsertionOption.bind(this)} />
					{ this.state.insertionOption == 'ngg_singlepic' && <>
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Image width x height (Leave blank for the original size)</Text>
							<NGGICNumberControl value={ this.state.width } setValue={ this.setWidth.bind(this) } />
							<NGGICNumberControl value={ this.state.height } setValue={ this.setHeight.bind(this) } />
						</div>
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Link (Leave blank for none)</Text>
							<NGGICTextControl value={ this.state.link } setValue={ this.setLink.bind(this) } />
						</div>
							<FloatClassSelectControl value={this.state.floatClass} setValue={ this.setFloatClass.bind(this) } />
							<ModeSelectControl value={this.state.mode} setValue={ this.setMode.bind(this) } />
					</>}
					{ this.state.insertionOption == 'thumbnail_custom_url' && <>
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Custom URL</Text>
							<NGGICTextControl value={ this.state.customUrl } setValue={ this.setCustomUrl.bind(this) } />
						</div>
					</>}
					{ this.state.insertionOption == 'link_image' && <>
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Text for text link</Text>
							<NGGICTextControl value={ this.state.textLink } setValue={ this.setTextLink.bind(this) } />
						</div>
					</>}
					{ (this.state.insertionOption == 'ngg_singlepic' || this.state.insertionOption == 'ngg_thumb' || this.state.insertionOption == 'ngg_thumb_multi') &&
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Template name (Leave blank for the default template)</Text>
							<NGGICTextControl value={ this.state.template } setValue={ this.setTemplate.bind(this) } />
						</div>
					}
				</fieldset>
				<fieldset className='nggic-fieldset'><legend>Press button to insert checked image(s)</legend>
					<Button key="btnInsert" className="insert-button" onClick={this.insertSelectedImages.bind(this)} isPrimary="true">Insert</Button>
					<Button key="btnSelectAll" onClick={this.selectAllImages.bind(this)} isTertiary="true">Check all</Button>
					<Button key="btnUnselectAll" onClick={this.unselectAllImages.bind(this)} isTertiary="true">Uncheck all</Button>
				</fieldset>
			</View>
			{ this.state.images.length > 0 &&  <ImageScrollView key="imageScrollView" images={this.state.images} list={list} displayInfo={this.state.displayInfo} /> }
			{ this.state.images.length == 0 &&  <View><p>Loading images, please wait...</p></View> }
		</>);
	}
};

export default ImageArea;