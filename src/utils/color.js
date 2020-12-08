/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview File holds a bunch of color utility functions.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


/**
 * Converts a string of the form 'rgb(r, g, b)' to a hexadecimal string of the
 * form '0xRRGGBB'.
 * @param {string} rgbString The rgb string of the form 'rgb(r, g, b)'.
 * @return {string} A hexadecimal string of the form '0xRRGGBB'.
 */
export function rgbStringToHex(rgbString) {
  let color;
  if (rgbString[3] == 'a') {
    color = rgbString.match(
        /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  } else {
    color = rgbString.match(
        /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  }
  return '0x' + decToHex(color[1]) + decToHex(color[2]) + decToHex(color[3]);
}

/**
 * Convert a decimal string to a 2 digit hexadecimal string.
 * @param {string} decString The number string in decimal.
 * @return {string} The number string in hexadecimal.
 */
function decToHex(decString) {
  const hex = parseInt(decString).toString(16);
  if (hex.length == 1) {
    return '0' + hex;
  }
  return hex;
}
