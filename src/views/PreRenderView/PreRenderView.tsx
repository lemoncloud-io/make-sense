import React, { useEffect } from 'react';
import './PreRenderView.scss';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import { PopupWindowType } from '../../data/enums/PopupWindowType';
import { updateActivePopupType } from '../../store/general/actionCreators';
import { LemonActions } from '../../logic/actions/LemonActions';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId, updateActivePopupType }) => {
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
            .then(() => updateActivePopupType(PopupWindowType.ASSIGN_TASKS_POPUP)) // show assign tasks limit popup
    }, []);

    return (
        <div className='PreRenderView withPopup'
             draggable={false}>
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
