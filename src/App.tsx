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

import {RouteComponentProps} from 'react-router-dom';
import PreRenderView from './views/PreRenderView/PreRenderView';

const queryString = require('query-string');

interface IProps {
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    imagesData: any;
    routeProps: RouteComponentProps;
}

const App: React.FC<IProps> = (
    {
        projectType,
        windowSize,
        ObjectDetectorLoaded,
        PoseDetectionLoaded,
        imagesData,
        routeProps
    }) => {

    const getQueryParams = () => {
        const { location } = routeProps;
        return queryString.parse(location.search);
    }

    const selectRoute = () => {
        const { projectId, taskId } = getQueryParams();
        if (projectId) {
            if (!projectType) {
                return <PreRenderView projectId={projectId} taskId={taskId}/>;
            } else if (imagesData && imagesData.length > 0) {
                return <EditorView/>;
            }
        } else {
            return <MainView/>;
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
    imagesData: state.labels.imagesData,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded,
    routeProps
});

export default connect(
    mapStateToProps
)(App);
