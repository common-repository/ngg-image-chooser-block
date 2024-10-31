import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import axios from 'axios';
import TreeView from 'deni-react-treeview';

class GalleryTreeView extends Component {

	constructor(props) {
		super(props);
		this.state = { items: [] };
	}

	componentDidMount() {
		axios({
			method: 'post',
			url: ENV.ajaxurl,
			data: 'action=ajax-getAlbumsAndGalleries&parent=root',
		})
			.then(res => this.setState({ items: res.data }));
	}

	render() {
		if (this.state.items.length > 0) {
			return (
				<TreeView key="tree" className='nggic-tree' items={this.state.items} onSelectItem={this.props.onSelectItem} />
			);
		} else {
			return (<View style={{ width: 400 }}><p>Loading, please wait...</p></View>);
		}
	}
}

export default GalleryTreeView;