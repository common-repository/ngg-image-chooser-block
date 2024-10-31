import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import { Modal } from '@wordpress/components';

import GalleryTreeView from "../GalleryTreeView";
import SelectView from "../SelectView";

class ImageChooserModal extends Component {

	constructor(props) {
		super(props);
		if (props.options['sortby']) {
			// Subsequent call
			this.state = { album: props.album, gallery: props.gallery, options: props.options };
		} else {
			// First call
			this.state = { album: undefined, gallery: undefined, options: undefined };
		}
	}

	hideModal() {
		this.props.onClose();
	}

	onSelectItem(item) {
		if (item.isLeaf) {
			this.setState({ album: undefined, gallery: item });
		} else {
			this.setState({ album: item, gallery: undefined });
		}
	}

	componentDidUpdate(prevProps) {
		// compare with previous props
		if (prevProps.options !== this.props.options) {
			this.setState({ options: this.props.options });
		}
	}
	
	render() {
		if (this.props.modalOpen) {
			return (
				<Modal
					title="Image Chooser for NextGEN Gallery"
					onRequestClose={this.hideModal.bind(this)}
				>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<GalleryTreeView onSelectItem={this.onSelectItem.bind(this)} />
						<SelectView album={this.state.album} gallery={this.state.gallery} options={this.state.options} setResult={ this.props.setResult } />
					</View>
				</Modal>
			);
		} else {
			return (<></>);
		}
	}
}

export default ImageChooserModal;