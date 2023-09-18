/*
 * Wazuh app - React component building the welcome screen of an agent.
 * version, OS, registration date, last keep alive.
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
import {
  EuiLink,
  EuiPanel,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiText,
  EuiFlexGrid,
  EuiButtonEmpty,
  EuiPage,
  EuiButton,
  EuiPopover,
  EuiLoadingChart,
  EuiToolTip,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiPageBody,
} from '@elastic/eui';
import {
  FimEventsTable,
  ScaScan,
  MitreTopTactics,
  RequirementVis,
} from './components';
import { AgentInfo } from './agents-info';
import store from '../../../redux/store';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import MenuAgent from './components/menu-agent';
import './welcome.scss';
import { WzDatePicker } from '../../../components/wz-date-picker/wz-date-picker';
import KibanaVis from '../../../kibana-integrations/kibana-vis';
import { VisFactoryHandler } from '../../../react-services/vis-factory-handler';
import { AppState } from '../../../react-services/app-state';
import { FilterHandler } from '../../../utils/filter-handler';
import { TabVisualizations } from '../../../factories/tab-visualizations';
import { updateCurrentAgentData } from '../../../redux/actions/appStateActions';
import { getAngularModule } from '../../../kibana-services';
import { hasAgentSupportModule } from '../../../react-services/wz-agents';
import { withErrorBoundary, withGlobalBreadcrumb, withReduxProvider } from '../hocs';
import { compose } from 'redux';
import {
  API_NAME_AGENT_STATUS,
  WAZUH_AGENTS_OS_TYPE,
} from '../../../../common/constants';
import { webDocumentationLink } from '../../../../common/services/web_documentation';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import {
  getNavigationAppURL,
  navigateAppURL,
} from '../../../react-services/navigate-app';

export const AgentsWelcome = compose(
  withReduxProvider,
  withErrorBoundary,
  withGlobalBreadcrumb(({ agent }) => {
    return [
      { text: '' },
      {
        text: 'IT Hygiene',
      },
      {
        text: `${agent.name}`,
        truncate: true,
      },
    ];
  }),
)(
  class AgentsWelcome extends Component {
    _isMount = false;
    constructor(props) {
      super(props);

      this.offset = 275;

      this.state = {
        extensions: this.props.extensions,
        lastScans: [],
        isLoading: true,
        sortField: 'start_scan',
        sortDirection: 'desc',
        actionAgents: true, // Hide actions agents
        selectedRequirement: 'pci',
        menuAgent: {},
        maxModules: 6,
        widthWindow: window.innerWidth,
      };
    }

    updateWidth = () => {
      let menuSize = window.innerWidth - this.offset;
      let maxModules = 6;
      if (menuSize > 1250) {
        maxModules = 6;
      } else {
        if (menuSize > 1100) {
          maxModules = 5;
        } else {
          if (menuSize > 900) {
            maxModules = 4;
          } else {
            maxModules = 3;
            if (menuSize < 750) {
              maxModules = null;
            }
          }
        }
      }

      this.setState({ maxModules: maxModules, widthWindow: window.innerWidth });
    };

    async componentDidMount() {
      this._isMount = true;
      store.dispatch(updateCurrentAgentData(this.props.agent));
      this.updateMenuAgents();
      this.updateWidth();
      const tabVisualizations = new TabVisualizations();
      tabVisualizations.removeAll();
      tabVisualizations.setTab('welcome');
      tabVisualizations.assign({
        welcome: 8,
      });
      const filterHandler = new FilterHandler(AppState.getCurrentPattern());
      const $injector = getAngularModule().$injector;
      this.router = $injector.get('$route');
      window.addEventListener('resize', this.updateWidth); //eslint-disable-line
      await VisFactoryHandler.buildAgentsVisualizations(
        filterHandler,
        'welcome',
        null,
        this.props.agent.id,
      );
    }

    updateMenuAgents() {
      const defaultMenuAgents = {
        general: {
          id: 'general',
          text: 'Security events',
          isPin: true,
        },
        fim: {
          id: 'fim',
          text: 'Integrity monitoring',
          isPin: true,
        },
        sca: {
          id: 'sca',
          text: 'SCA',
          isPin: true,
        },
        audit: {
          id: 'audit',
          text: 'System Auditing',
          isPin: true,
        },
        vuls: {
          id: 'vuls',
          text: 'Vulnerabilities',
          isPin: true,
        },
        mitre: {
          id: 'mitre',
          text: 'MITRE ATT&CK',
          isPin: true,
        },
      };

      let menuAgent = JSON.parse(window.localStorage.getItem('menuAgent'));

      // Check if pinned modules to agent menu are enabled in Settings/Modules, if not then modify localstorage removing the disabled modules
      if (menuAgent) {
        const needUpdateMenuAgent = Object.keys(menuAgent)
          .map(moduleName => menuAgent[moduleName])
          .reduce((accum, item) => {
            if (
              typeof this.props.extensions[item.id] !== 'undefined' &&
              this.props.extensions[item.id] === false
            ) {
              delete menuAgent[item.id];
              accum = true;
            }
            return accum;
          }, false);
        if (needUpdateMenuAgent) {
          // Update the pinned modules matching to enabled modules in Setings/Modules
          window.localStorage.setItem('menuAgent', JSON.stringify(menuAgent));
        }
      } else {
        menuAgent = defaultMenuAgents;
        window.localStorage.setItem(
          'menuAgent',
          JSON.stringify(defaultMenuAgents),
        );
      }
      this.setState({ menuAgent: menuAgent });
    }

    renderModules() {
      const menuAgent = [
        ...Object.keys(this.state.menuAgent).map(item => {
          return this.state.menuAgent[item];
        }),
      ];

      return (
        <Fragment>
          {menuAgent.map((menuAgent, i) => {
            if (
              i < this.state.maxModules &&
              hasAgentSupportModule(this.props.agent, menuAgent.id)
            ) {
              return (
                <EuiFlexItem
                  key={i}
                  grow={false}
                  style={{ marginLeft: 0, marginTop: 7 }}
                >
                  <EuiButtonEmpty
                    onClick={() => {
                      navigateAppURL(
                        `/app/${
                          WAZUH_MODULES[menuAgent.id].appId
                        }#/overview/?tab=${menuAgent.id}&tabView=${
                          menuAgent.text === 'Security configuration assessment'
                            ? 'inventory'
                            : 'panels'
                        }`,
                      );
                      this.router.reload();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>
                      {menuAgent.text !== 'Security configuration assessment'
                        ? menuAgent.text
                        : 'SCA'}
                      &nbsp;
                    </span>
                  </EuiButtonEmpty>
                </EuiFlexItem>
              );
            }
          })}
          <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
            <EuiPopover
              button={
                <EuiButtonEmpty
                  iconSide='right'
                  iconType='arrowDown'
                  onClick={() =>
                    this.setState({ switchModule: !this.state.switchModule })
                  }
                >
                  More...
                </EuiButtonEmpty>
              }
              isOpen={this.state.switchModule}
              closePopover={() => this.setState({ switchModule: false })}
              repositionOnScroll={false}
              anchorPosition='downCenter'
            >
              <div>
                <WzReduxProvider>
                  <div style={{ maxWidth: 730 }}>
                    <MenuAgent
                      isAgent={this.props.agent}
                      updateMenuAgents={() => this.updateMenuAgents()}
                      closePopover={() => {
                        this.setState({ switchModule: false });
                      }}
                      switchTab={module => this.props.switchTab(module)}
                    ></MenuAgent>
                  </div>
                </WzReduxProvider>
              </div>
            </EuiPopover>
          </EuiFlexItem>
        </Fragment>
      );
    }

    renderTitle() {
      const notNeedStatus = true;
      return (
        <EuiFlexGroup>
          <EuiFlexItem className='wz-module-header-agent-title'>
            <EuiFlexGroup>
              {(this.state.maxModules !== null && this.renderModules()) || (
                <EuiFlexItem style={{ marginTop: 7 }}>
                  <EuiPopover
                    button={
                      <EuiButtonEmpty
                        iconSide='right'
                        iconType='arrowDown'
                        onClick={() =>
                          this.setState({
                            switchModule: !this.state.switchModule,
                          })
                        }
                      >
                        Modules
                      </EuiButtonEmpty>
                    }
                    isOpen={this.state.switchModule}
                    closePopover={() => this.setState({ switchModule: false })}
                    repositionOnScroll={false}
                    anchorPosition='downCenter'
                  >
                    <div>
                      <WzReduxProvider>
                        <div style={{ maxWidth: 730 }}>
                          <MenuAgent
                            isAgent={this.props.agent}
                            updateMenuAgents={() => this.updateMenuAgents()}
                            closePopover={() => {
                              this.setState({ switchModule: false });
                            }}
                            switchTab={module => this.props.switchTab(module)}
                          ></MenuAgent>
                        </div>
                      </WzReduxProvider>
                    </div>
                  </EuiPopover>
                </EuiFlexItem>
              )}
              <EuiFlexItem className='wz-agent-empty-item'></EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType='inspect'
                  onClick={() =>
                    this.props.switchTab('syscollector', notNeedStatus)
                  }
                >
                  Inventory data
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType='stats'
                  onClick={() => this.props.switchTab('stats', notNeedStatus)}
                >
                  Stats
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType='gear'
                  onClick={() =>
                    this.props.switchTab('configuration', notNeedStatus)
                  }
                >
                  Configuration
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    onTimeChange = datePicker => {
      const { start: from, end: to } = datePicker;
      this.setState({ datePicker: { from, to } });
    };

    renderMitrePanel() {
      return (
        <Fragment>
          <EuiPanel paddingSize='s' height={{ height: 300 }}>
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <h2 className='embPanel__title wz-headline-title'>
                    <EuiText size='xs'>
                      <h2>MITRE</h2>
                    </EuiText>
                  </h2>
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ alignSelf: 'center' }}>
                  <EuiToolTip position='top' content='Open MITRE'>
                    <EuiButtonIcon
                      iconType='popout'
                      color='primary'
                      onClick={() => {
                        navigateAppURL('/app/mitre-attack');
                        this.router.reload();
                      }}
                      aria-label='Open MITRE'
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiSpacer size='m' />
            <EuiFlexGroup>
              <EuiFlexItem>
                <MitreTopTactics agentId={this.props.agent.id} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </Fragment>
      );
    }

    renderCompliancePanel() {
      return (
        <RequirementVis
          agent={this.props.agent}
          width={200}
          height={200}
          innerRadius={70}
          outerRadius={100}
        />
      );
    }

    renderEventCountVisualization() {
      return (
        <EuiPanel paddingSize='s'>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <h2 className='embPanel__title wz-headline-title'>
                  <EuiText size='xs'>
                    <h2>Events count evolution</h2>
                  </EuiText>
                </h2>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size='s' />
            <div
              style={{
                height: this.props.resultState !== 'loading' ? '350px' : 0,
              }}
            >
              <WzReduxProvider>
                <KibanaVis
                  visID={'Wazuh-App-Agents-Welcome-Events-Evolution'}
                  tab={'welcome'}
                ></KibanaVis>
              </WzReduxProvider>
            </div>
            <div
              style={{
                display:
                  this.props.resultState === 'loading' ? 'block' : 'none',
                alignSelf: 'center',
                paddingTop: 100,
              }}
            >
              <EuiLoadingChart size='xl' />
            </div>
          </EuiFlexItem>
        </EuiPanel>
      );
    }

    renderSCALastScan() {
      return (
        <EuiFlexGroup direction='column'>
          <ScaScan switchTab={this.props.switchTab} {...this.props} />
        </EuiFlexGroup>
      );
    }

    render() {
      const title = this.renderTitle();

      if (this.props.agent.status === API_NAME_AGENT_STATUS.NEVER_CONNECTED) {
        return (
          <EuiEmptyPrompt
            iconType='securitySignalDetected'
            style={{ marginTop: 20 }}
            title={<h2>Agent has never connected.</h2>}
            body={
              <Fragment>
                <p>
                  The agent has been registered but has not yet connected to the
                  manager.
                </p>
                <EuiLink
                  href={webDocumentationLink(
                    'user-manual/agents/agent-connection.html',
                  )}
                  external
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Checking connection with the Wazuh server
                </EuiLink>
              </Fragment>
            }
            actions={
              <EuiButton
                href={getNavigationAppURL(
                  '/app/endpoints-summary#/agents-preview',
                )}
                color='primary'
                fill
              >
                Back
              </EuiButton>
            }
          />
        );
      }

      return (
        <div className='wz-module wz-module-welcome'>
          <div className='wz-module-header-agent wz-module-header-agent-wrapper'>
            <div className='wz-module-header-agent-main'>{title}</div>
          </div>
          <div className='wz-module-agent-body wz-module-agents-padding-responsive'>
            <EuiPage>
              <EuiPageBody component='div'>
                <div className='wz-module-header-nav'>
                  <div>
                    <EuiPanel
                      grow
                      paddingSize='s'
                      className='wz-welcome-page-agent-info'
                    >
                      <AgentInfo
                        agent={this.props.agent}
                        isCondensed={false}
                        hideActions={true}
                        {...this.props}
                      ></AgentInfo>
                    </EuiPanel>
                  </div>
                </div>
                <EuiFlexGroup>
                  <EuiFlexItem />
                  <EuiFlexItem
                    style={{
                      alignItems: 'flex-end',
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    {' '}
                    {/* DatePicker */}
                    <WzDatePicker condensed={true} onTimeChange={() => {}} />
                  </EuiFlexItem>
                </EuiFlexGroup>
                {(this.state.widthWindow < 1150 && (
                  <Fragment>
                    <EuiFlexGrid columns={2}>
                      <EuiFlexItem
                        key={'Wazuh-App-Agents-Welcome-MITRE-Top-Tactics'}
                      >
                        {this.renderMitrePanel()}
                      </EuiFlexItem>
                      {this.renderCompliancePanel()}
                    </EuiFlexGrid>
                    <EuiSpacer size='m' />
                    <EuiFlexGroup>
                      <FimEventsTable
                        agent={this.props.agent}
                        router={this.router}
                      />
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                    <EuiFlexGroup>
                      <EuiFlexItem
                        key={'Wazuh-App-Agents-Welcome-Events-Evolution'}
                      >
                        {' '}
                        {/* Events count evolution */}
                        {this.renderEventCountVisualization()}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                    <EuiFlexGroup>
                      <EuiFlexItem>{this.renderSCALastScan()}</EuiFlexItem>
                    </EuiFlexGroup>
                  </Fragment>
                )) || (
                  <Fragment>
                    <EuiFlexGrid columns={2}>
                      <EuiFlexItem>
                        <EuiFlexGroup>
                          <EuiFlexItem
                            key={'Wazuh-App-Agents-Welcome-MITRE-Top-Tactics'}
                          >
                            {this.renderMitrePanel()}
                          </EuiFlexItem>
                          {this.renderCompliancePanel()}
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      <FimEventsTable
                        agent={this.props.agent}
                        router={this.router}
                      />
                    </EuiFlexGrid>
                    <EuiSpacer size='l' />
                    <EuiFlexGroup>
                      <EuiFlexItem
                        key={'Wazuh-App-Agents-Welcome-Events-Evolution'}
                      >
                        {' '}
                        {/* Events count evolution */}
                        {this.renderEventCountVisualization()}
                      </EuiFlexItem>
                      <EuiFlexItem>{this.renderSCALastScan()}</EuiFlexItem>
                    </EuiFlexGroup>
                  </Fragment>
                )}
              </EuiPageBody>
            </EuiPage>
          </div>
        </div>
      );
    }
  },
);
