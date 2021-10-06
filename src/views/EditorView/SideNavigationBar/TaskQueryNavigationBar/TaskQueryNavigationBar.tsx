import {ContextType} from "../../../../data/enums/ContextType";
import './TaskQueryNavigationBar.scss';
import React from "react";
import classNames from "classnames";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {updateActivePopupType} from "../../../../store/general/actionCreators";
import {ImageButton} from "../../../Common/ImageButton/ImageButton";
import {ISize} from "../../../../interfaces/ISize";
import {TaskState} from "../../../../store/lemon/types";
import {PopupWindowType} from "../../../../data/enums/PopupWindowType";
import {LemonActions} from "../../../../logic/actions/LemonActions";
import {VerticalEditorButton} from "../../VerticalEditorButton/VerticalEditorButton";
import {HorizontalEditorButton} from "../../HorizontalEditorButton/HorizontalEditorButton";

interface IProps {
    activeTaskState: TaskState;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
}

const TaskQueryNavigationBar: React.FC<IProps> = (
    {
        activeTaskState,
        updateActivePopupType
    }) => {
    const buttonSize: ISize = {width: 30, height: 30};
    const buttonPadding: number = 10;

    const setTaskState = (state: TaskState) => {
        updateActivePopupType(PopupWindowType.LOADER);
        LemonActions.updateTaskState(state)
            .then(() => updateActivePopupType(null))
            .catch(e => updateActivePopupType(null))
    }

    return (
        <div className="TaskQueryNavigationBar">
            <div className="ButtonWrapper">
                <HorizontalEditorButton
                    label="모두"
                    onClick={() => setTaskState('all')}
                    isActive={activeTaskState === 'all'}
                />
                <HorizontalEditorButton
                    label="새로운 작업만"
                    onClick={() => setTaskState('open')}
                    isActive={activeTaskState === 'open'}
                />
            </div>
        </div>
    )
};

const mapDispatchToProps = {
    updateActivePopupType,
};

const mapStateToProps = (state: AppState) => ({
    activeTaskState: state.lemon.taskState,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TaskQueryNavigationBar);
