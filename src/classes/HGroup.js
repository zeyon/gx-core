/**
 * @class gx.ui.HGroup
 * @description Horizontal Grouping Component
 * @extends gx.ui.Container
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 *
 * @param {array} children The children elements
 */
gx.ui.HGroup = new Class({
	Extends: gx.ui.Container,
	options: {},
	_isOpen: true,

	initialize: function(children) {
		var root = this;
		display = new Element('table', {'class': 'group'});
		this.parent(display, {});

		this._ui.row  = new Element('tr');
		this._ui.body = new Element('tbody');
		this._ui.root.adopt(this._ui.body.adopt(this._ui.row));

		children.each(function(col) {
			root.addElem(col.content, col.width, col.styles, col.align, col.properties);
		});
	},

	/**
	 * @method addElem
	 * @description Adds an element to the hgroup
	 * @param {object} elem The element to add
	 * @param {string} width The width of the element (or null)
	 * @param {object} styles The styles to apply
	 * @param {string} align The alignment of the element
	 * @param {object} properties Additional properties to set
	 */
	addElem: function(elem, width, styles, align, properties) {
		var td = new Element('td', {'style': 'vertical-align:top;'});
		if (width != null)
			td.setStyle('width', width);
		if (styles != null)
			td.setStyles(styles);
		if (align != null)
			td.setStyle('vertical-align', align);

		td.adopt(this.initDisplay(elem));

		if ( properties )
			td.set(properties);

		this._ui.row.adopt(td);
	}

});
