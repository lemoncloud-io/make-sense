import './TaskQueryNavigationBar.scss';
import React from "react";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {updateActivePopupType} from "../../../../store/general/actionCreators";
import {TaskState} from "../../../../store/lemon/types";
import {PopupWindowType} from "../../../../data/enums/PopupWindowType";
import {LemonActions} from "../../../../logic/actions/LemonActions";
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

    const setTaskState = (state: TaskState) => {
        updateActivePopupType(PopupWindowType.LOADER);
        LemonActions.updateTaskState(state)
            .then((total) => {
                updateActivePopupType(total === 0 ? PopupWindowType.NO_TASKS_POPUP : null);
            })
            .catch(() => updateActivePopupType(null))
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
