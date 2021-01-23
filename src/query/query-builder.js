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


/**
 * Maps query key strings to query constructors.
 * String keys cannot contain: '(', ')', ' ', '-', '_', '"'
 * @type {!Map<string, Query>}
 */
const QUERY_MAP = new Map()
    .set('withtitle', WithTitle);

export function createQuery(str) {
  return parseQuery_(str);
}

function parseQuery_(str) {
  for (var i = 0; i < str.length; i++) {
    if (str[i] != '(') {
      continue;
    }
    const queryName = str.substring(0, i);
    const queryParams = str.substring(i + 1);
    const queryConstructor = getQueryByName_(queryName);
    if (queryConstructor) {
      return new queryConstructor(...parseParams_(queryParams));
    }
  }
  return undefined;
}

function parseParams_(str) {
  const params = [];
  let startIndex = 0;
  let openParensCount = 0;
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        openParensCount++;
        break;
      case ')':
        openParensCount--;
        if (!openParensCount) {
          const query = parseQuery_(str.substring(startIndex, i + 1));
          if (query) {  // TODO: Maybe log if it's not valid?
            params.push(query);
          }
          startIndex = i + 1;
        }
        break;
      case '"':
        // TODO: Handle this elsewhere.
        const tokens = str.substring(i).match(/"(.*)"/);
        if (tokens) {
          const literal = tokens[1];
          params.push(literal);
          startIndex = i + literal.length + 2;
          i = literal.length + 1;  // Only add 1 b/c ++
        }
        break;
    }
  }
  const lastQuery = parseQuery_(str.substring(startIndex));
  if (lastQuery) {
    params.push(lastQuery);
  }
  return params;
}

function getQueryByName_(name) {
  // Replace whitespace, dashes, and underscores and go to lower case.
  return QUERY_MAP.get(name.replace(/[\s\-_]/g, '').toLowerCase());
}

