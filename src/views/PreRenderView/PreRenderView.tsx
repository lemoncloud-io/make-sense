import React, {useEffect} from 'react';
import './PreRenderView.scss';
import {AppState} from '../../store';
import {connect} from 'react-redux';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType, updateProjectData,} from '../../store/general/actionCreators';
import {LemonActions} from '../../logic/actions/LemonActions';
import {ProjectCategory, ProjectType} from '../../data/enums/ProjectType';
import {ProjectData} from '../../store/general/types';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectId: string;
    taskId: string;
}

const PreRenderView: React.FC<IProps> = (
    {
        projectId,
        taskId,
        updateActivePopupType,
        updateProjectData,
    }) => {

    updateActivePopupType(PopupWindowType.LOADER);
    if (!projectId && !taskId) {
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
            .then(() => {
                if (!taskId) {
                    // show assign tasks limit popup
                    updateActivePopupType(PopupWindowType.ASSIGN_TASKS_POPUP)
                } else {
                    // get only one task
                    LemonActions.initTaskByTaskId(taskId).then(res => {
                        updateActivePopupType(null);
                        const { name, category } = res;
                        let type = ProjectType.OBJECT_DETECTION;
                        if (category === ProjectCategory.IMAGE_TAG) {
                            type = ProjectType.IMAGE_RECOGNITION;
                        }
                        updateProjectData({ name, type });
                    });
                }
            });
    }

    useEffect(() => {
        if (projectId) {
            initProject(projectId);
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
