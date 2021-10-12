import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Direction} from "../../../data/enums/Direction";
import {ISize} from "../../../interfaces/ISize";
import {Settings} from "../../../settings/Settings";
import {AppState} from "../../../store";
import {ImageData} from "../../../store/labels/types";
import ImagesList from "../SideNavigationBar/ImagesList/ImagesList";
import LabelsToolkit from "../SideNavigationBar/LabelsToolkit/LabelsToolkit";
import {SideNavigationBar} from "../SideNavigationBar/SideNavigationBar";
import {VerticalEditorButton} from "../VerticalEditorButton/VerticalEditorButton";
import './EditorContainer.scss';
import Editor from "../Editor/Editor";
import {ContextManager} from "../../../logic/context/ContextManager";
import {ContextType} from "../../../data/enums/ContextType";
import EditorBottomNavigationBar from "../EditorBottomNavigationBar/EditorBottomNavigationBar";
import EditorTopNavigationBar from "../EditorTopNavigationBar/EditorTopNavigationBar";
import {ProjectType} from "../../../data/enums/ProjectType";
import PaginationBar from '../PaginationBar/PaginationBar';
import {from} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';
import {LemonActions} from '../../../logic/actions/LemonActions';
import {updateImageDataById} from "../../../store/labels/actionCreators";
import {setOriginLabels} from "../../../store/lemon/actionCreators";
import TaskQueryNavigationBar from "../SideNavigationBar/TaskQueryNavigationBar/TaskQueryNavigationBar";

interface IProps {
    windowSize: ISize;
    activeImageIndex: number;
    imagesData: ImageData[];
    activeContext: ContextType;
    projectType: ProjectType;
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    totalPage: number;
    setOriginLabels: (originLabels: ImageData) => any;
}

const EditorContainer: React.FC<IProps> = (
    {
        windowSize,
        activeImageIndex,
        imagesData,
        activeContext,
        projectType,
        updateImageDataById,
        totalPage,
        setOriginLabels,
    }) => {
    const [leftTabStatus, setLeftTabStatus] = useState(true);
    const [rightTabStatus, setRightTabStatus] = useState(true);

    useEffect(() => {
        // TODO: refactor below
        // taskId로 데이터 가져왔을 때 (수정케이스)
        if (imagesData.length === 1 && totalPage === 0) {
            const parallelRequest$ = from(imagesData).pipe(
                mergeMap(data => LemonActions.getTaskByImageData$(data)),
                filter(({ task, origin }) => !!task)
            );
            parallelRequest$.subscribe(({ task, origin }) => {
                const { annotations } = task;
                const labels = LemonActions.getLabelsFromAnnotations(annotations);
                setOriginLabels({ ...origin, ...labels });
                updateImageDataById(origin.id, { ...origin, ...labels });
            })
        }
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

    const calculateEditorSize = (): ISize => {
        if (windowSize) {
            const leftTabWidth = leftTabStatus ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            const rightTabWidth = rightTabStatus ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            return {
                width: windowSize.width - leftTabWidth - rightTabWidth,
                height: windowSize.height - Settings.TOP_NAVIGATION_BAR_HEIGHT_PX
                    - Settings.EDITOR_BOTTOM_NAVIGATION_BAR_HEIGHT_PX - Settings.EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX,
            }
        }
        else
            return null;
    };

    const leftSideBarButtonOnClick = () => {
        if (!leftTabStatus)
            ContextManager.switchCtx(ContextType.LEFT_NAVBAR);
        else if (leftTabStatus && activeContext === ContextType.LEFT_NAVBAR)
            ContextManager.restoreCtx();

        setLeftTabStatus(!leftTabStatus);
    };

    const leftSideBarCompanionRender = () => {
        return <>
            <VerticalEditorButton
                label="Images"
                image={"ico/camera.png"}
                imageAlt={"images"}
                onClick={leftSideBarButtonOnClick}
                isActive={leftTabStatus}
            />
        </>
    };

    const leftSideBarRender = () => {
        return (
            <>
                <TaskQueryNavigationBar key="task-query-navigation-bar" />
                <ImagesList/>
                <PaginationBar/>
            </>
        );
    };

    const rightSideBarButtonOnClick = () => {
        if (!rightTabStatus)
            ContextManager.switchCtx(ContextType.RIGHT_NAVBAR);
        else if (rightTabStatus && activeContext === ContextType.RIGHT_NAVBAR)
            ContextManager.restoreCtx();

        setRightTabStatus(!rightTabStatus);
    };

    const rightSideBarCompanionRender = () => {
        return <>
            <VerticalEditorButton
                label="Labels"
                image={"ico/tags.png"}
                imageAlt={"labels"}
                onClick={rightSideBarButtonOnClick}
                isActive={rightTabStatus}
            />
        </>
    };

    const rightSideBarRender = () => {
        return <LabelsToolkit/>
    };

    return (
        <div className="EditorContainer">
            <SideNavigationBar
                direction={Direction.LEFT}
                isOpen={leftTabStatus}
                isWithContext={activeContext === ContextType.LEFT_NAVBAR}
                renderCompanion={leftSideBarCompanionRender}
                renderContent={leftSideBarRender}
                key="left-side-navigation-bar"
            />
            <div className="EditorWrapper"
                onMouseDown={() => ContextManager.switchCtx(ContextType.EDITOR)}
                 key="editor-wrapper"
            >
                {projectType === ProjectType.OBJECT_DETECTION && <EditorTopNavigationBar
                    key="editor-top-navigation-bar"
                />}
                <Editor
                    size={calculateEditorSize()}
                    imageData={imagesData[activeImageIndex]}
                    key="editor"
                />
                <EditorBottomNavigationBar
                    imageData={imagesData[activeImageIndex]}
                    size={calculateEditorSize()}
                    totalImageCount={imagesData.length}
                    key="editor-bottom-navigation-bar"
                />
            </div>
            <SideNavigationBar
                direction={Direction.RIGHT}
                isOpen={rightTabStatus}
                isWithContext={activeContext === ContextType.RIGHT_NAVBAR}
                renderCompanion={rightSideBarCompanionRender}
                renderContent={rightSideBarRender}
                key="right-side-navigation-bar"
            />
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataById,
    setOriginLabels
};

const mapStateToProps = (state: AppState) => ({
    windowSize: state.general.windowSize,
    activeImageIndex: state.labels.activeImageIndex,
    imagesData: state.labels.imagesData,
    activeContext: state.general.activeContext,
    projectType: state.general.projectData.type,
    totalPage: state.lemon.totalPage,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorContainer);
