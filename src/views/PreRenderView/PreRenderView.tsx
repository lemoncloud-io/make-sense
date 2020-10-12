import React, { useEffect, useState } from 'react';
import './PreRenderView.scss';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import { PopupWindowType } from '../../data/enums/PopupWindowType';
import { updateActivePopupType, updateProjectData } from '../../store/general/actionCreators';
import { LemonActions } from '../../logic/actions/LemonActions';
import { ProjectData } from '../../store/general/types';

import TopNavigationBar from '../EditorView/TopNavigationBar/TopNavigationBar';
import { ProjectType } from '../../data/enums/ProjectType';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId, updateActivePopupType, updateProjectData }) => {
    const [isFetched, setIsFetched] = useState(false);

    useEffect(() => {
        updateActivePopupType(PopupWindowType.LOADER); // show loader
        LemonActions.isAuthenticated()
            .then((isAuth)=> {
                const isDev = process.env.NODE_ENV;
                console.log(`isAuth: ${isAuth}, isDev: ${isDev}`);
                if (isDev !== 'development' && !isAuth) {
                    window.history.back();
                }
            })
            .then(() => LemonActions.getCredentials())
            .then(() => LemonActions.initProject(projectId))
            .then((projectData: ProjectData) => {
                setIsFetched(true);
                updateActivePopupType(null); // hide loader
                updateProjectData({ ...projectData, type: ProjectType.OBJECT_DETECTION }); // go to OBJECT_DETECTION
            });
    }, []);

    return (
        <div className='PreRenderView withPopup'
             draggable={false}>
            {isFetched && <TopNavigationBar/>}
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
