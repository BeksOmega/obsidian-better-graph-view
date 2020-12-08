/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview File handles computing styles for elements with various classes.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


/**
 * A map of concatenated class names to CSSStyleDeclarations with those classes.
 * @type {!Map<string, !CSSStyleDeclaration>}
 * @private
 */
const elementMap_ = new Map();

/**
 * The container for all of our test elements.
 * @type {Element|null}
 * @private
 */
let testElementsContainer_ = null;

/**
 * Returns the style associated with the given class names and pseudo element.
 * @param {!Array<string>} classNames An array of class names.
 * @param {?string} pseudoElt A valid pseudo element such as ::before or ::after.
 *     See the docs for more info: https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 * @return {!CSSStyleDeclaration} The style associated with the given class
 *     names and selector.
 */
export function getStyle(classNames, pseudoElt) {
  init_();

  classNames.sort();
  const concatNames = classNames.join(' ');
  const key = concatNames + pseudoElt;
  if (elementMap_.has(key)) {
    return elementMap_.get(key);
  }
  const elem = document.createElement('div');
  elem.style.width = 0;
  elem.style.height = 0;
  elem.className = concatNames;
  testElementsContainer_.appendChild(elem);
  const style = getComputedStyle(elem, pseudoElt);
  elementMap_.set(key, style);
  return style;
}

function init_() {
  if (!testElementsContainer_) {
    testElementsContainer_ = document.createElement('div');
    testElementsContainer_.setAttribute(
        'id', 'better-graph-view-css-test-container');
    document.body.append(testElementsContainer_);
  }
}
