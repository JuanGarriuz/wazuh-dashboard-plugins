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
import React, { Component } from 'react';
import {
  EuiInMemoryTable,
  EuiCallOut
} from '@elastic/eui';

import { connect } from 'react-redux';

import {
  updateLoadingStatus,
  updateFileContent,
  updateRuleInfo,
  updateDecoderInfo,
  updateListContent
} from '../../../../redux/actions/rulesetActions';

import RulesetColums from './utils/columns';

class WzRulesetTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    this.rulesetColums = new RulesetColums(this.props);
    const { isLoading, items, section, showingFiles, error } = this.props.state;
    const rulesetColums = this.rulesetColums.columns;
    const columns = showingFiles ? rulesetColums.files : rulesetColums[section]
    const message = isLoading ? false : 'No results...';
    if (!error) {
      return (
        <EuiInMemoryTable
          itemId="id"
          items={items}
          columns={columns}
          pagination={true}
          loading={isLoading}
          sorting={true}
          message={message}
        />
      );
    } else {
      return (
        <EuiCallOut color="warning" title={error} iconType="gear"/>
      );
    }

  }
}

const mapStateToProps = (state) => {
  return {
    state: state.rulesetReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateFileContent: content => dispatch(updateFileContent(content)),
    updateRuleInfo: info => dispatch(updateRuleInfo(info)),
    updateDecoderInfo: info => dispatch(updateDecoderInfo(info)),
    updateListContent: content => dispatch(updateListContent(content))
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(WzRulesetTable);
