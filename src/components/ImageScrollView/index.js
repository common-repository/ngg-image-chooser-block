import React, { Component, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import ImageView from "../ImageView";

class ImageScrollView extends Component {

	constructor(props) {
		super(props);
	}


	render() {
		var list = this.props.list;
		var images = this.props.images;
		var image_list = [];
		var displayInfo = this.props.displayInfo;
		if (displayInfo == '0') {
			var imageCount = images.length;
			for(var i = 0; i < imageCount; i+=2) {
				var image1 = images[i];
				var image2 = i + 1 < imageCount ? images[i+1] : undefined; 
				image_list.push(
					<li key={i}>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<ImageView key={image1.id} image={ image1 } list={ list } displayInfo={ displayInfo } />
							{ image2 && <ImageView key={image2.id} image={ image2 } list={ list } displayInfo={ displayInfo } /> }
						</View>
					</li>
				);
			}
			
		} else {
			images.forEach(function(image) {
				image_list.push(
					<li key={image.id}>
						<ImageView key={image.id} image={ image } list={ list } displayInfo={ displayInfo } />
					</li>
				);
			});
		}
		return (<ScrollView key="svImages"><ul key="ulImages">{ image_list }</ul></ScrollView>);
	}
}

export default ImageScrollView;
