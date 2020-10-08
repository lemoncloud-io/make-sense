import React, { useEffect } from 'react';
import './PreRenderView.scss';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import { PopupWindowType } from '../../data/enums/PopupWindowType';
import { updateActivePopupType, updateProjectData } from '../../store/general/actionCreators';
import { LemonActions } from '../../logic/actions/LemonActions';
import { ProjectData } from '../../store/general/types';

import TopNavigationBar from '../EditorView/TopNavigationBar/TopNavigationBar';
import { ProjectType } from '../../data/enums/ProjectType';
import { Settings } from '../../settings/Settings';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId, updateActivePopupType, updateProjectData}) => {

    useEffect(() => {
        LemonActions.isAuthenticated().then((isAuth)=> {
            console.log('none Auth', isAuth);
            const isDev = process.env.NODE_ENV;
            if (isDev != 'development') {
                window.location.href = Settings.LEMONADE_HOME;
            }
        })
        updateActivePopupType(PopupWindowType.LOADER); // show loader
        LemonActions.initProject(projectId).then((projectData: ProjectData) => {
            updateActivePopupType(null); // hide loader
            updateProjectData({ ...projectData, type: ProjectType.OBJECT_DETECTION }); // go to OBJECT_DETECTION
        });
    });

    return (
        <div className='PreRenderView withPopup'
             draggable={false}>
            <TopNavigationBar/>
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateProjectData
};

const mapStateToProps = (state: AppState) => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
