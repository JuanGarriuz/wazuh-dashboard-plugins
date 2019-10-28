/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

const initialState = {
  section: 'rules',
  isLoading: false,
  showingFiles: false,
  items: [],
  filters: {},
  ruleInfo: false,
  decoderInfo: false,
  listInfo: false,
  fileContent: false,
  adminMode: true,
  addingRulesetFile: false,
  error: false
}

const rulesetReducers = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_RULESET_SECTION':
      return Object.assign({}, state, { section: action.section, error: false });
    case 'UPDATE_LOADING_STATUS':
      return Object.assign({}, state, { isLoading: action.status, error: false });
    case 'UPDATE_ITEMS':
      return Object.assign({}, state, { items: action.items, error: false });
    case 'UPDATE_RULE_INFO':
      return Object.assign({}, state, { ruleInfo: action.info, decoderInfo: false, listInfo: false, error: false });
    case 'UPDATE_DECODER_INFO':
      return Object.assign({}, state, { decoderInfo: action.info, ruleInfo: false, listInfo: false, error: false });
    case 'UPDATE_FILE_CONTENT':
      return Object.assign({}, state, { fileContent: action.content, decoderInfo: false, ruleInfo: false, listInfo: false, error: false });
    case 'UPDATE_LIST_CONTENT':
      return Object.assign({}, state, { fileContent: false, decoderInfo: false, ruleInfo: false, listInfo: action.content, error: false });
    case 'UPDATE_FILTERS':
      return Object.assign({}, state, { filters: action.filters, error: false });
    case 'UPDATE_ADMIN_MODE':
      return Object.assign({}, state, { adminMode: action.status });
    case 'UPDATE_ADDING_RULESET_FILE':
      return Object.assign({}, state, { addingRulesetFile: action.content, error: false });
    case 'UPDATE_ERROR':
      return Object.assign({}, state, { error: action.error });
    case 'TOGGLE_SHOW_FILES':
      return Object.assign({}, state, { showingFiles: action.status, error: false });
    case 'CLEAN_INFO':
      return Object.assign({}, state, { decoderInfo: false, ruleInfo: false, listInfo: false, fileContent: false, addingRulesetFile: false, error: false });
    case 'CLEAN_CONTENT':
      return Object.assign({}, state, { fileContent: false, error: false });
    case 'CLEAN_FILTERS':
      return Object.assign({}, state, { filters: {} });
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default rulesetReducers;