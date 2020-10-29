import React, { useEffect } from 'react';
import './PreRenderView.scss';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import { PopupWindowType } from '../../data/enums/PopupWindowType';
import { updateActivePopupType, updateProjectData, } from '../../store/general/actionCreators';
import { LemonActions } from '../../logic/actions/LemonActions';
import {ProjectType} from '../../data/enums/ProjectType';
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

    useEffect(() => {
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
                            // TODO: set type as category
                            const { name, category } = res;
                            updateProjectData({ name, type: ProjectType.OBJECT_DETECTION });
                        });
                    }
                })
    }, []);

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
