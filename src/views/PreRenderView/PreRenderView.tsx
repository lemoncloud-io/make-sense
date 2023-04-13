import React, {useEffect} from 'react';
import './PreRenderView.scss';
import {AppState} from '../../store';
import {connect} from 'react-redux';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType, updateProjectData,} from '../../store/general/actionCreators';
import {LemonActions} from '../../logic/actions/LemonActions';
import {ProjectCategory, ProjectType} from '../../data/enums/ProjectType';
import {ProjectData} from '../../store/general/types';
import {timer} from "rxjs";
import {retry, share, switchMap, tap} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";
import {ProjectView} from "@lemoncloud/ade-backend-api";

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectId: string;
    imageId: string;
}

const PreRenderView: React.FC<IProps> = (
    {
        projectId,
        imageId,
        updateActivePopupType,
        updateProjectData,
    }) => {

    updateActivePopupType(PopupWindowType.LOADER);
    if (!projectId && !imageId) {
        updateActivePopupType(PopupWindowType.NO_TASKS_POPUP);
    }

    const initProject = projectId => {
        LemonActions.isAuthenticated()
            .then((isAuth)=> {
                const isDev = process.env.NODE_ENV;
                const shouldGoBack = isDev !== 'development' && !isAuth;
                if (shouldGoBack) {
                    window.history.back();
                }
            })
            .then(() => LemonActions.getCredentials())
            .then(() => LemonActions.setupProject(projectId))
            .then((project: ProjectView) => LemonActions.setupImagesByProject(project, imageId))
            .then(({ name, category }) => {
                updateActivePopupType(null);
                let type = ProjectType.IMAGE_RECOGNITION;
                if (category === ProjectCategory.IMAGE_TAG || category === ProjectCategory.TEXT_TAG) {
                    type = ProjectType.OBJECT_DETECTION;
                }
                updateProjectData({ name, type });
            });
    }

    const pollingCredentials = () => {
        const POLLING_TIME = 1000 * 60 * 5; // 5 minutes;
        const refreshCredentials$ = timer(1, POLLING_TIME).pipe(
            switchMap(() => fromPromise(LemonActions.getCredentials())),
            retry(),
            share(),
            tap(() => console.log(`polling credentials every ${Math.floor(POLLING_TIME / 60 / 1000)} minutes...`)),
        );
        refreshCredentials$.subscribe(() => {});
    }

    useEffect(() => {
        if (projectId) {
            initProject(projectId);
            pollingCredentials();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='PreRenderView withPopup'
             draggable={false}>
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateProjectData,
};

const mapStateToProps = (state: AppState) => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
