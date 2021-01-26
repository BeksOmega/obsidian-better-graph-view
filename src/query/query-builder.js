/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class that reads a string and uses it to build a query to
 *     filter a set of QueryableNodes.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Query} from './queries/i-query';
import {WithTitle} from './queries/with-title';
import {WithTag} from './queries/with-tag';
import {InFolder} from './queries/in-folder';
import {WithinDegree} from './queries/WithinDegree';


/**
 * Maps query key strings to query constructors.
 * String keys can only contain lowercase alphanumeric characters.
 * @type {!Map<string, Query>}
 */
const QUERY_MAP = new Map()
    .set('withtitle', WithTitle)
    .set('withtag', WithTag)
    .set('infolder', InFolder)
    .set('withindegree', WithinDegree);

export function createQuery(str) {
  const result = parseQuery_(str);
  if (result) {
    return result.val;
  }
}

function parseQuery_(str) {
  // Match up until the first parenthesis or the end of the string.
  const tokens = str.match(/([^(]+)(\(|$)/);
  if (tokens) {
    const queryConstructor = getQueryByName_(tokens[1]);
    if (queryConstructor) {
      const {val, length} = parseParams_(str.substring(tokens[1].length + 1));
      return {
        val: new queryConstructor(...val),
        length: (tokens[1].length + 1) + length,
      }
    }
  }
}

function parseParams_(str) {
  const params = [];

  let i = 0;
  while (i < str.length && str[i] != ')') {
    const char = str[i];
    let returnVal;
    if (char == '"') {
      returnVal = parseStringLit_(str.substring(i));
    } else if (char == ',' || char == ' ') {
      i++;  // Continue to the next char.
    } else if (!isNaN(char)) {
      returnVal = parseNumberLit_(str.substring(i));
    } else {
      returnVal = parseQuery_(str.substring(i));
    }

    if (returnVal) {
      params.push(returnVal.val);
      i += returnVal.length;
    } else {
      i++;
    }
  }

  return {
    val: params,
    length: i + 1,
  };
}

function parseStringLit_(str) {
  // Match up until the first quote, or end of string.
  const tokens = str.match(/"([^"]*)("|$)/);
  if (tokens) {
    return {
      val: tokens[1],
      length: tokens[1].length + 2,
    }
  }
}

function parseNumberLit_(str) {
  // Match up until the next space, comma, closed paren, or end of string.
  const tokens = str.match(/(.+?)( |,|\)|$)/);
  if (tokens) {
    return {
      val: parseInt(tokens[1]),
      length: tokens[1].length,
    }
  }
}

function getQueryByName_(name) {
  // Remove anything that's not a letter.
  return QUERY_MAP.get(name.replace(/[^a-zA-Z]/g, '').toLowerCase());
}

