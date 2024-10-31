import React, { useRef } from "react";
import { StyleSheet, View, ScrollView, Text } from 'react-native-web';

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, SelectControl, TextControl, Modal, Icon } from '@wordpress/components';
import { useState, RawHTML } from '@wordpress/element';

import axios from 'axios';

import ImageChooserModal from "./components/ImageChooserModal";

registerBlockType('nggic/image-chooser-block', {
	title: 'Image Chooser for NextGEN Gallery',
	icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M15.5 2C18 2 20 4 20 6.5c0 .88-.25 1.71-.69 2.4l3.08 3.1L21 13.39l-3.12-3.07c-.69.43-1.51.68-2.38.68C13 11 11 9 11 6.5S13 2 15.5 2m0 2A2.5 2.5 0 0 0 13 6.5A2.5 2.5 0 0 0 15.5 9A2.5 2.5 0 0 0 18 6.5A2.5 2.5 0 0 0 15.5 4m-8 10.5L4 19h14l-4.5-6l-3.5 4.5l-2.5-3M20 20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.5c-.32.77-.5 1.61-.5 2.5a6.5 6.5 0 0 0 6.5 6.5c.68 0 1.34-.11 1.96-.3L20 15.24V20z" />
	</svg>,
	category: 'media',
	attributes: {
		options: {
			type: 'object',
		},
		tag: {
			type: 'string',
			source: 'text',
			selector: 'div',
		},
		html: {
			type: 'string',
			source: 'html',
			selector: 'div',
		},
	},
	example: {
		attributes: {
			tag: '[nggallery id=1]',
		},
	},
	edit: (props) => {

		const {
			attributes: {
				options,
				tag,
				html
			},
			setAttributes,
		} = props;

		const [isModalOpen, setModalOpen] = useState(false);

		const NggicIcon = () => (<Icon icon={
			<svg>
				<path d="M15.5 2C18 2 20 4 20 6.5c0 .88-.25 1.71-.69 2.4l3.08 3.1L21 13.39l-3.12-3.07c-.69.43-1.51.68-2.38.68C13 11 11 9 11 6.5S13 2 15.5 2m0 2A2.5 2.5 0 0 0 13 6.5A2.5 2.5 0 0 0 15.5 9A2.5 2.5 0 0 0 18 6.5A2.5 2.5 0 0 0 15.5 4m-8 10.5L4 19h14l-4.5-6l-3.5 4.5l-2.5-3M20 20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.5c-.32.77-.5 1.61-.5 2.5a6.5 6.5 0 0 0 6.5 6.5c.68 0 1.34-.11 1.96-.3L20 15.24V20z" />
			</svg>
		} />);

		const openModal = () => {
			setModalOpen(true);
		};

		const closeModal = () => {
			setModalOpen(false);
		};

		const setResult = (tag, html, options) => {
			setAttributes({ tag: tag, html: html, options: options });
			closeModal();
		};
		
		var modalOptions;
		if(options) {
			modalOptions = options;
		} else {
			modalOptions = {}
			axios({
				method: 'post',
				url: ENV.ajaxurl,
				data: 'action=ajax-getOptions',
			})
				.then(res => setAttributes({ options: res.data }));
		}
		var contentInfo = undefined;
		if (options) {
			if (options['image_count']) {
				contentInfo = options['image_count'] + ' image(s) selected';
			} else if (options['gallery_id']) {
				contentInfo = '1 gallery selected';
			} else if (options['album_id']) {
				contentInfo = '1 album selected';
			}
		}
		
		return (
			<>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Button isPrimary='true' icon={NggicIcon} onClick={openModal}>{__('Select images or gallery', 'nggicb')}</Button>
					<p style={{ marginTop: 0, marginBottom: 0, marginLeft: 20 }}>{contentInfo && contentInfo}</p>
				</View>
				<ImageChooserModal options={modalOptions} modalOpen={isModalOpen} onClose={closeModal} setResult={ setResult } />
			</>
		);
	},
	save: ( props ) => {
		const {
			attributes: {
				tag,
				html,
			},
		} = props;
		
		if (tag && tag.startsWith('[')) {
			return (
				<div>{ tag }</div>
			);
		} else if (html) {
			return (
				<div><RawHTML>{ html }</RawHTML></div>
			);
		} else {
			return "";
		}
	},
});