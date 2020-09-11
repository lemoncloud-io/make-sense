import React, {useEffect} from 'react';
import './PreRenderView.scss';
import {AppState} from "../../store";
import {connect} from "react-redux";
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {LemonActions} from '../../logic/actions/LemonActions';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId, updateActivePopupType }) => {

    useEffect(() => {
        console.log('render')
        LemonActions.initProject(projectId).then(() => updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE));
    });

    const test = <div className="FirstStage">TEST</div>;
    return (
        <div className="PreRenderView">
            {test}
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
