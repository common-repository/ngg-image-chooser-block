import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import { Button, CheckboxControl, SelectControl, TextControl, Modal, Icon} from '@wordpress/components';

class ImageView extends Component {

	constructor(props) {
		super(props);
		this.image = props.image;
		this.state = { checked: props.image.checked };
		this.instance = this;
	}

	componentDidMount() {
		this.props.list.push(this.instance);
		this.instance.setChecked = (checked) => {
			this.image.checked = checked;
			this.setState({ checked: checked });     
		};
	}

	render() {
		return (
			<View key={'image-view-' + this.image.id} style={{ flex: 1, flexDirection: 'row'}}>
				<View key={'thumb-view-' + this.image.id} style={{ flex: 1, backgroundImage: 'url(' + this.image.thumbnail_src + ')', backgroundRepeat: 'no-repeat', height: '160px' }}>
					<div style={{ display: 'flex', marginLeft: 5, marginTop: 5 }}>
						<CheckboxControl
							key={'checkbox-' + this.image.id}
							checked={this.state.checked}
							onChange={(checked) => {
								this.image.checked = checked;
								this.setState({ checked: checked });
							}}
						/>
					</div>
				</View>
				{ this.props.displayInfo == '1' && <View key={'meta-view-' + this.image.id} style={{ flex: 2 }}>
					<p>Title: {this.image.title}</p>
					<p>Description: {this.image.description}</p>
				</View>}
			</View>
		);
	}
}

export default ImageView;
