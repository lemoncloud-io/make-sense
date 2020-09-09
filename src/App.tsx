import React from 'react';
import './App.scss';
import EditorView from "./views/EditorView/EditorView";
import MainView from "./views/MainView/MainView";
import {ProjectType} from "./data/enums/ProjectType";
import {AppState} from "./store";
import {connect} from "react-redux";
import PopupView from "./views/PopupView/PopupView";
import MobileMainView from "./views/MobileMainView/MobileMainView";
import {ISize} from "./interfaces/ISize";
import {Settings} from "./settings/Settings";
import {SizeItUpView} from "./views/SizeItUpView/SizeItUpView";
import {PlatformModel} from "./staticModels/PlatformModel";
import classNames from "classnames";

import { AuthService, LemonOptions } from '@lemoncloud/lemon-front-lib';
import { RouteComponentProps } from 'react-router-dom';
import { initLemonCore } from './store/lemon/actionCreators';
import {store} from './index';
import {PopupWindowType} from './data/enums/PopupWindowType';
import {updateActivePopupType, } from "./store/general/actionCreators";
import PreRenderView  from './views/PreRenderView/PreRenderView';

const queryString = require('query-string');

interface IProps {
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    routeProps: RouteComponentProps;
    lemonCore: AuthService;
}

const App: React.FC<IProps> = ({projectType, windowSize, ObjectDetectorLoaded, PoseDetectionLoaded, routeProps, lemonCore}) => {
    const getProjectIdFromQuery = () => {
        const { location } = routeProps;
        const queryParams = queryString.parse(location.search);
        return queryParams.projectId || '';
    }

    const selectRoute = () => {
        const projectId = getProjectIdFromQuery();
        if (projectId) {
            // const lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
            // store.dispatch(initLemonCore(lemonOptions));
            // TODO: fetch labels
            // TODO: fetch files(images)
            // store.dispatch(updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE));
            if (!projectType) {
                return <PreRenderView/>;
            } else {
                return <EditorView/>;
            }
        }

        if (!!PlatformModel.mobileDeviceData.manufacturer && !!PlatformModel.mobileDeviceData.os)
            return <MobileMainView/>;
        if (!projectType)
            return <MainView/>;
        else {
            if (windowSize.height < Settings.EDITOR_MIN_HEIGHT || windowSize.width < Settings.EDITOR_MIN_WIDTH) {
                return <SizeItUpView/>;
            } else {
                return <EditorView/>;
            }
        }
    };

    return (
      <div className={classNames("App", {"AI": ObjectDetectorLoaded || PoseDetectionLoaded})}
          draggable={false}
      >
          {selectRoute()}
          <PopupView/>
      </div>
    );
};

const mapStateToProps = (state: AppState, routeProps: RouteComponentProps) => ({
    projectType: state.general.projectData.type,
    windowSize: state.general.windowSize,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded,
    lemonCore: state.lemon.lemonCore,
    routeProps
});

export default connect(
    mapStateToProps
)(App);
