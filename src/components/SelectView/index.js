import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';

import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, SelectControl, TextControl, Modal, Icon } from '@wordpress/components';

import ImageArea from "../ImageArea";

const TemplateTextControl = (({ template, setTemplate }) => (
	<TextControl value={ template } onChange={ (template) => setTemplate(template) } />
));

class SelectView extends Component {

	constructor(props) {
		super(props);
		this.state = { template: this.props.template ? this.props.template : '' };
	}

	setTemplate(template) {
		this.setState({ template: template });
	}
	
	insertSelectedAlbum() {
		var options = { 'album_id': this.props.album.id, 'gallery_id': undefined, 'sortby': undefined,
			'display_info': this.state.displayInfo == '1', 'insertion_option': this.state.insertionOption,
			'template': this.state.template, 'custom_url': this.state.customUrl, 'default_alignment': this.floatClass,
			'default_mode': this.mode, 'tag_height': this.state.height, 'tag_width': this.state.width};
		var templateAttr = this.state.template.length > 0 ? ' template="' + this.state.template + '"' : '';
		var tag = '[album id=' + this.props.album.id.substr(1) + templateAttr +  ']';
		this.props.setResult(tag, undefined, options);
	}

	Images() {
		if (this.props.gallery) {
			return (<ImageArea gallery={this.props.gallery} options={this.props.options} setResult={ this.props.setResult } />);
		} else {
			if (this.props.album) {
				return(<View key="buttons">
					<fieldset className='nggic-fieldset'>
						<legend>Insert a NGG tag for the current album: { this.props.album.text }</legend>
						<div style={{ display: 'flex' }}>
							<Text style={{ margin: 5 }}>Template name (Leave blank for the default template)</Text>
							<TemplateTextControl template={ this.state.template } setTemplate={ this.setTemplate.bind(this) } />
						</div>
						<Button key="btnInsertAlbum" className="insert-button" onClick={ this.insertSelectedAlbum.bind(this) } isPrimary="true">Insert</Button>
					</fieldset>
				</View>);
			} else {
				return (<p>Please select an album to insert or a gallery to display images</p>);
			}
		}
	}

	render() {
		return (<View key="images" style={{ flex: 3, height: 740, width: 600, marginLeft: 20 }}>
			{this.Images()}
		</View>);
	}
};

export default SelectView;