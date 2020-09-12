import React, {useEffect} from 'react';
import './PreRenderView.scss';
import {AppState} from "../../store";
import {connect} from "react-redux";
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {LemonActions} from '../../logic/actions/LemonActions';
import classNames from 'classnames';
import TopNavigationBar from '../EditorView/TopNavigationBar/TopNavigationBar';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    activePopupType: PopupWindowType;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId, updateActivePopupType, activePopupType }) => {

    useEffect(() => {
        LemonActions.initProject(projectId).then(() => updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE));
    });

    const getClassName = () => {
        return classNames(
            "PreRenderView",
            {
                "withPopup": !!activePopupType
            }
        );
    };

    return (
        <div className={getClassName()}
             draggable={false}>
            <TopNavigationBar/>
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({
    activePopupType: state.general.activePopupType
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
