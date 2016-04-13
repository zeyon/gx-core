'use strict';

/**
 * Gx JavaScript Library for MooTools
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.100
 * @package Gx
 * @copyright Copyright (c) 2013, Zeyon GmbH & Co. KG
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */

if (gx == undefined)
	var gx = {};

gx.version = '1.100';
gx.core = {};
gx.ui = {};

/**
 * Mootools extras.
 *
 */


/**
 * Escapes special (X)HTML characters "<", ">", "&" and the double quotation marks '"'.
 *
 * @return {String}
 */
if ( typeof String.prototype.htmlSpecialChars !== 'function' ) {
  String.prototype.htmlSpecialChars = function () {
    return this
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
}

/**
 * Array.find(function).
 *
 * Find an item of an array by providing a function returning true if found.
 *
 * [{id:2}, {id:3}].findBy(function(item) {
 *   return item.id === 3;
 * }) === {id:3}
 *
 * Convenience arguments: If you provide string as first argument and a second
 * argument you can find an item of an array with the provided key:value
 *
 * Example: This will give the same result as above:
 *
 * [{id:2}, {id:3}].findBy('id', 3) === {id:3}
 *
 */
if ( typeof Array.prototype.findBy !== 'function' ) {
  Array.prototype.findBy = function(mixed, value) {
    var func = mixed;
    if ( typeof mixed === 'string' ) {
      func = function(item) {
        return item[mixed] === value;
      };
    }

    for ( var item, i = this.length - 1; i >= 0; i-- ) {
      item = this[i];
      if ( func(item) === true )
        return item;
    }

    return null;
  };
}
