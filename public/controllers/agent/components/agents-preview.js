/*
 * Wazuh app - React component for building the agents preview section.
 *
 * Copyright (C) 2015-2022 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiPage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiStat,
  EuiLoadingChart,
  EuiEmptyPrompt,
  EuiSpacer,
  EuiToolTip,
  EuiCard,
} from '@elastic/eui';
import { AgentsTable } from './agents-table';
import { WzRequest } from '../../../react-services/wz-request';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import { WazuhConfig } from './../../../react-services/wazuh-config.js';
import { WzDatePicker } from '../../../components/wz-date-picker/wz-date-picker';
import WzKibanaVis from '../../../components/wz-kibana-vis/wz-kibana-vis';
import {
  withReduxProvider,
  withGlobalBreadcrumb,
  withUserAuthorizationPrompt,
} from '../../../components/common/hocs';
import { formatUIDate } from '../../../../public/react-services/time-service';
import { compose } from 'redux';
import { withErrorBoundary } from '../../../components/common/hocs';
import './agents-preview.scss';
import { UI_LOGGER_LEVELS, UI_ORDER_AGENT_STATUS } from '../../../../common/constants';
import { UI_ERROR_SEVERITIES } from '../../../react-services/error-orchestrator/types';
import { getErrorOrchestrator } from '../../../react-services/common-services';
import { VisualizationBasic } from '../../../components/common/charts/visualizations/basic';
import { agentStatusColorByAgentStatus, agentStatusLabelByAgentStatus } from '../../../../common/services/wz_agent_status';

export const AgentsPreview = compose(
  withErrorBoundary,
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: 'Agents' }]),
  withUserAuthorizationPrompt([
    [
      { action: 'agent:read', resource: 'agent:id:*' },
      { action: 'agent:read', resource: 'agent:group:*' },
    ],
  ])
)(
  class AgentsPreview extends Component {
    _isMount = false;
    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        showAgentsEvolutionVisualization: false,
        agentTableFilters: [],
        agentStatusSummary: {}
      };
      this.wazuhConfig = new WazuhConfig();
      this.agentStatus = UI_ORDER_AGENT_STATUS.map(agentStatus => ({
        status: agentStatus,
        label: agentStatusLabelByAgentStatus(agentStatus),
        color: agentStatusColorByAgentStatus(agentStatus)
      }));
    }

    async componentDidMount() {
      this._isMount = true;
      this.fetchAgentStatusDetailsData();
      if (this.wazuhConfig.getConfig()['wazuh.monitoring.enabled']) {
        this._isMount && this.setState({ 
          showAgentsEvolutionVisualization: true 
        });
<<<<<<< HEAD
=======
        const tabVisualizations = new TabVisualizations();
        tabVisualizations.removeAll();
        tabVisualizations.setTab('general');
        tabVisualizations.assign({
          general: 1,
        });
        const filterHandler = new FilterHandler(AppState.getCurrentPattern());
        await VisFactoryHandler.buildOverviewVisualizations(filterHandler, 'general', null);
>>>>>>> c1f0ea9f18676d4bd8207675267ca85194521161
      }
    }



    componentWillUnmount() {
      this._isMount = false;
    }


    groupBy = function (arr) {
      return arr.reduce(function (prev, item) {
        if (item in prev) prev[item]++;
        else prev[item] = 1;
        return prev;
      }, {});
    };

    async fetchAgentStatusDetailsData(){
      try {
<<<<<<< HEAD
        this.setState({ 
          loading: true });
        const summaryData = await WzRequest.apiReq('GET', '/agents/summary/status', {});
        this.summary = summaryData.data.data;
        this.totalAgents = this.summary.total;
        const model = [
          { id: 'active', label: 'Active', value: this.summary['active'] || 0 },
          { id: 'disconnected', label: 'Disconnected', value: this.summary['disconnected'] || 0 },
          {
            id: 'neverConnected',
            label: 'Never connected',
            value: this.summary['never_connected'] || 0,
          },
        ];
        this.setState({ data: model });
        this.agentsCoverity = this.totalAgents
          ? ((this.summary['active'] || 0) / this.totalAgents) * 100
          : 0;
        const lastAgent = await WzRequest.apiReq('GET', '/agents', {
          params: { limit: 1, sort: '-dateAdd', q: 'id!=000' },
        });
        this.lastAgent = lastAgent.data.data.affected_items[0];
        this.mostActiveAgent = await this.props.tableProps.getMostActive();
        const osresult = await WzRequest.apiReq('GET', '/agents/summary/os', {});
        this.platforms = this.groupBy(osresult.data.data.affected_items);
        const platformsModel = [];
        for (let [key, value] of Object.entries(this.platforms)) {
          platformsModel.push({ id: key, label: key, value: value });
        }
        this._isMount && this.setState({ 
          platforms: platformsModel, 
          loading: false
=======
        this.setState({ loading: true });
        const {data: {data: agentStatusSummary}} = await WzRequest.apiReq('GET', '/agents/summary/status', {});

        const {data: {data: {affected_items: [lastRegisteredAgent]}}} = await WzRequest.apiReq('GET', '/agents', {
          params: { limit: 1, sort: '-dateAdd', q: 'id!=000' },
        });
        const agentMostActive = await this.props.tableProps.getMostActive();

        this.setState({
          loading: false,
          lastRegisteredAgent,
          agentStatusSummary,
          agentsActiveCoverage: ((agentStatusSummary.active/agentStatusSummary.total)*100).toFixed(2),
          agentMostActive
>>>>>>> c1f0ea9f18676d4bd8207675267ca85194521161
        });
      } catch (error) {
        this.setState({loading: false});
        const options = {
          context: `${AgentsPreview.name}.fetchAgentStatusDetailsData`,
          level: UI_LOGGER_LEVELS.ERROR,
          severity: UI_ERROR_SEVERITIES.BUSINESS,
          store: true,
          error: {
            error: error,
            message: error.message || error,
            title: `Could not get the agents summary`,
          },
        };
        getErrorOrchestrator().handleError(options);
        throw error;
      }
    }

    removeFilters() {
      this._isMount && this.setState({ agentTableFilters: [] });
    }

    showAgent(agent) {
      agent && this.props.tableProps.showAgent(agent);
    }

    filterAgentByStatus(status) {
      this._isMount &&
        this.setState({
          agentTableFilters: [{ field: 'q', value: `status=${status}` }],
        });
    }

    render() {
      return (
        <EuiPage className="flex-column">
          <EuiFlexItem>
            <EuiFlexGroup className="agents-evolution-visualization-group mt-0">
            {(this.state.loading && (
                <EuiFlexItem>
                  <EuiLoadingChart className="loading-chart" size="xl" />
                </EuiFlexItem>
              )) || (
                <>
                  <EuiFlexItem className="agents-status-pie" grow={false}>
                    <EuiCard title description betaBadgeLabel="Status" className="eui-panel">
                      <EuiFlexGroup>
                        <EuiFlexItem className="align-items-center">
                          <VisualizationBasic
                            type='donut'
                            size={{ width: '100%', height: '150px' }}
                            showLegend
                            data={this.agentStatus.map(({status, label, color}) => ({
                              label,
                              value: this.state.agentStatusSummary[status] || 0,
                              color,
                              onClick: () => this.filterAgentByStatus(status)
                            }))}
                            noDataTitle='No results'
                            noDataMessage='No results were found.'
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiCard>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} className="agents-details-card">
                    <EuiCard title description betaBadgeLabel="Details">
                      <EuiFlexGroup className="group-details">
                        {this.agentStatus.map(({status, label, color}) => (
                          <EuiFlexItem key={`agent-details-status-${status}`}>
                            <EuiStat
                              title={
                                <EuiToolTip position="top" content={`Filter by agent status: ${status}`}>
                                  <span onClick={() => this.filterAgentByStatus(status)} style={{cursor: 'pointer'}}>
                                    {this.state.agentStatusSummary[status]}
                                  </span>
                                </EuiToolTip>
                              }
                              titleSize="s"
                              description={label}
                              titleColor={color}
                              className="white-space-nowrap"
                            />
                          </EuiFlexItem>
                        ))}
                        <EuiFlexItem>
                          <EuiStat
                            title={`${this.state.agentsActiveCoverage}%`}
                            titleSize='s'
                            description="Agents coverage"
                            className="white-space-nowrap"
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup className="mt-0">
                        {this.state.lastRegisteredAgent && (
                          <EuiFlexItem className="agents-link-item">
                            <EuiStat
                              className="euiStatLink last-agents-link"
                              title={
                                <EuiToolTip position="top" content="View agent details">
                                  <a onClick={() => this.showAgent(this.state.lastRegisteredAgent)}>
                                    {this.state.lastRegisteredAgent.name}
                                  </a>
                                </EuiToolTip>
                              }
                              titleSize="s"
                              description="Last registered agent"
                              titleColor="primary"
                            />
                          </EuiFlexItem>
                        )}
                        {this.state.agentMostActive && (
                          <EuiFlexItem className="agents-link-item">
                            <EuiStat
                              className={this.state.agentMostActive.name ? 'euiStatLink' : ''}
                              title={
                                <EuiToolTip position="top" content="View agent details">
                                  <a onClick={() => this.showAgent(this.state.agentMostActive)}>
                                    {this.state.agentMostActive.name || '-'}
                                  </a>
                                </EuiToolTip>
                              }
                              className="last-agents-link"
                              titleSize="s"
                              description="Most active agent"
                              titleColor="primary"
                            />
                          </EuiFlexItem>
                        )}
                      </EuiFlexGroup>
                    </EuiCard>
                  </EuiFlexItem>
<<<<<<< HEAD
                  {this.totalAgents > 0 && (
                    <EuiFlexItem grow={false} className="agents-details-card">
                      <EuiCard title description betaBadgeLabel="Details">
                            {this.summary && (
                              <EuiFlexGroup className="group-details">
                                <EuiFlexItem>
                                  <EuiStat
                                    title={
                                      <EuiToolTip position="top" content="Show active agents">
                                        <a
                                          onClick={() => this.showAgentsWithFilters(FILTER_ACTIVE)}
                                        >
                                          {this.state.data[0].value}
                                        </a>
                                      </EuiToolTip>
                                    }
                                    titleSize={'s'}
                                    description="Active"
                                    titleColor="secondary"
                                    className="white-space-nowrap"
                                  />
                                </EuiFlexItem>
                                <EuiFlexItem>
                                  <EuiStat
                                    title={
                                      <EuiToolTip position="top" content="Show disconnected agents">
                                        <a
                                          onClick={() =>
                                            this.showAgentsWithFilters(FILTER_DISCONNECTED)
                                          }
                                        >
                                          {this.state.data[1].value}
                                        </a>
                                      </EuiToolTip>
                                    }
                                    titleSize={'s'}
                                    description="Disconnected"
                                    titleColor="danger"
                                    className="white-space-nowrap"
                                  />
                                </EuiFlexItem>
                                <EuiFlexItem>
                                  <EuiStat
                                    title={
                                      <EuiToolTip
                                        position="top"
                                        content="Show never connected agents"
                                      >
                                        <a
                                          onClick={() =>
                                            this.showAgentsWithFilters(FILTER_NEVER_CONNECTED)
                                          }
                                        >
                                          {this.state.data[2].value}
                                        </a>
                                      </EuiToolTip>
                                    }
                                    titleSize={'s'}
                                    description="Never connected"
                                    titleColor="subdued"
                                    className="white-space-nowrap"
                                  />
                                </EuiFlexItem>

                                <EuiFlexItem>
                                  <EuiStat
                                    title={`${this.agentsCoverity.toFixed(2)}%`}
                                    titleSize={'s'}
                                    description="Agents coverage"
                                    className="white-space-nowrap"
                                  />
                                </EuiFlexItem>
                              </EuiFlexGroup>
                            )}
                            <EuiFlexGroup className="mt-0">
                              {this.lastAgent && (
                                <EuiFlexItem className="agents-link-item">
                                  <EuiStat
                                    className="euiStatLink last-agents-link"
                                    title={
                                      <EuiToolTip position="top" content="View agent details">
                                        <a onClick={() => this.showLastAgent()}>
                                          {this.lastAgent.name}
                                        </a>
                                      </EuiToolTip>
                                    }
                                    titleSize="s"
                                    description="Last registered agent"
                                    titleColor="primary"
                                  />
                                </EuiFlexItem>
                              )}
                              {this.mostActiveAgent && (
                                <EuiFlexItem className="agents-link-item">
                                  <EuiStat
                                    className={this.mostActiveAgent.name ? 'euiStatLink' : ''}
                                    title={
                                      <EuiToolTip position="top" content="View agent details">
                                        <a onClick={() => this.showMostActiveAgent()}>
                                          {this.mostActiveAgent.name || '-'}
                                        </a>
                                      </EuiToolTip>
                                    }
                                    className="last-agents-link"
                                    titleSize="s"
                                    description="Most active agent"
                                    titleColor="primary"
                                  />
                                </EuiFlexItem>
                              )}
                            </EuiFlexGroup>
                      </EuiCard>
                    </EuiFlexItem>
                  )}
                </Fragment>
=======
                </>
>>>>>>> c1f0ea9f18676d4bd8207675267ca85194521161
              )}
              {this.state.showAgentsEvolutionVisualization && (
                <EuiFlexItem
                  grow={false}
                  className="agents-evolution-visualization"
                  style={{
                    display: !this.state.loading ? 'inherit' : 'none',
                    margin: !this.state.loading ? '12px' : 0,
                  }}
                >
                  <EuiCard
                    title
                    description
                    paddingSize="none"
                    betaBadgeLabel="Evolution"
                    style={{ display: this.props.resultState === 'ready' ? 'block' : 'none' }}
                  >
                    <EuiFlexGroup>
                      <EuiFlexItem>
                        <div style={{
                          height: this.props.resultState === 'ready' ? '202px' : 0,
                          paddingTop: this.props.resultState === 'ready' ? "12px" : 0
                        }}
                        >
                          <WzKibanaVis
                            visID={'Wazuh-App-Overview-General-Agents-status'}
                            tab={'general'}
                          />
                        </div>
                        {this.props.resultState === 'loading' && (
                          <div className="loading-chart-xl">
                            <EuiLoadingChart size="xl" />
                          </div>
                        )}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiCard>
                  <EuiCard
                    title
                    description
                    paddingSize="none"
                    betaBadgeLabel="Evolution"
                    style={{
                      height: 193,
                      display: this.props.resultState === 'none' ? 'block' : 'none',
                    }}
                  >
                    <EuiEmptyPrompt
                      className="wz-padding-21"
                      iconType="alert"
                      titleSize="xs"
                      title={<h3>No results found in the selected time range</h3>}
                      actions={<WzDatePicker condensed={true} onTimeChange={() => {}} />}
                    />
                  </EuiCard>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
            <EuiSpacer size="m" />
            <WzReduxProvider>
              <AgentsTable
                filters={this.state.agentTableFilters}
                removeFilters={() => this.removeFilters()}
                wzReq={this.props.tableProps.wzReq}
                addingNewAgent={this.props.tableProps.addingNewAgent}
                downloadCsv={this.props.tableProps.downloadCsv}
                clickAction={this.props.tableProps.clickAction}
                formatUIDate={(date) => formatUIDate(date)}
                reload={() => this.fetchAgentStatusDetailsData()}
              />
            </WzReduxProvider>
          </EuiFlexItem>
        </EuiPage>
      );
    }
  }
);

AgentsTable.propTypes = {
  tableProps: PropTypes.object,
  showAgent: PropTypes.func,
};
