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
 * String keys cannot contain: '(', ')', ' ', '-'
 * @type {!Map<string, Query>}
 */
const QUERY_MAP = new Map()
    .set('withtitle', WithTitle);

export class QueryBuilder {
  /**
   * Creates a query that can be run, given the string representation of the
   * query.
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @param {string} str The string to parse into a query.
   * @return {!Query} The created query.
   */
  createQuery(universe, str) {
    return this.parseQuery_(universe, str);
  }

  parseQuery_(universe, str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] != '(') {
        continue;
      }
      const queryName = str.substring(0, i);
      const queryParams = str.substring(i + 1);
      const queryConstructor = this.getQueryByName_(queryName);
      return queryConstructor(universe, ...this.parseParams_(queryParams));
    }
    return undefined;
  }

  parseParams_(universe, str) {
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
            const query = this.parseQuery_(
                universe, str.substring(startIndex, i + 1));
            if (query) {  // TODO: Maybe log if it's not valid?
              params.push(query);
            }
            startIndex = i + 1;
          }
          break;
        case '"':
          const literal = str.substring(i).match(/"(.*)"/)[1];
          params.push(literal);
          startIndex = i + literal.length + 2;
          i = literal.length + 1;  // Only add 1 b/c ++
          break;
      }
    }
    const lastQuery = this.parseQuery_(universe, str.substring(startIndex));
    if (lastQuery) {
      params.push(lastQuery);
    }
    return params;
  }

  getQueryByName_(name) {
    // Replace whitespace and dashes, and go to lower case.
    return QUERY_MAP.get(name.replace(/[\s\-]/g, '').toLowerCase());
  }
}

