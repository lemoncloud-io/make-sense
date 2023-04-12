import React, {useState} from 'react';
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
import {updateActivePopupType } from './store/general/actionCreators';
import {PopupWindowType} from './data/enums/PopupWindowType';
import {LabelsSelector} from './store/selectors/LabelsSelector';
import {LemonActions} from './logic/actions/LemonActions';
import { useIdleTimer } from 'react-idle-timer'

const queryString = require('query-string');

interface IProps {
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    imagesData: any;
    routeProps: RouteComponentProps;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
}

const App: React.FC<IProps> = (
    {
        projectType,
        windowSize,
        ObjectDetectorLoaded,
        PoseDetectionLoaded,
        imagesData,
        routeProps,
        updateActivePopupType,
    }) => {

    const timeout = 1000 * 60 * 5; // 5minutes
    const [isIdle, setIsIdle] = useState(false)

    const popupIdle = () => {
        updateActivePopupType(null);
        updateActivePopupType(PopupWindowType.IDLE_POPUP);
    };

    const handleOnActive = () => {
        setIsIdle(false);
    }

    const handleOnIdle = () => {
        setIsIdle(true);
        const currentIndex: number | null = LabelsSelector.getActiveImageIndex();
        if (currentIndex === null) {
            popupIdle();
            return;
        }
        LemonActions.saveUpdatedImagesData(currentIndex)
            .then(() => popupIdle())
            .catch(e => {
                console.log(e, isIdle);
                alert(`Submit Error: ${e}`);
                popupIdle();
            })
    }

    useIdleTimer({ timeout, onActive: handleOnActive, onIdle: handleOnIdle });

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
            } else if (imagesData && imagesData.length === 0) {
                return <PreRenderView projectId={null} taskId={null}/>;
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
    imagesData: state.labels.imagesData,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded,
    routeProps
});

const mapDispatchToProps = {
    updateActivePopupType,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
