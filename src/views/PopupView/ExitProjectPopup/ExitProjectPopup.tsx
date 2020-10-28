import React from 'react'
import './ExitProjectPopup.scss'
import {GenericYesNoPopup} from "../GenericYesNoPopup/GenericYesNoPopup";
import {
    updateActiveImageIndex,
    updateActiveLabelNameId, updateActiveLabelType,
    updateFirstLabelCreatedFlag,
    updateImageData,
    updateLabelNames
} from "../../../store/labels/actionCreators";
import {AppState} from "../../../store";
import {connect} from "react-redux";
import {ImageData, LabelName} from "../../../store/labels/types";
import {PopupActions} from "../../../logic/actions/PopupActions";
import {ProjectData} from "../../../store/general/types";
import {updateProjectData} from "../../../store/general/actionCreators";
import {setProjectInfo} from '../../../store/lemon/actionCreators';
import {LabelType} from '../../../data/enums/LabelType';

interface IProps {
    updateActiveLabelType: (labelType: LabelType) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateImageData: (imageData: ImageData[]) => any;
    updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
    updateProjectData: (projectData: ProjectData) => any;
    setProjectInfo: (id: string, category: string) => any;
}

const ExitProjectPopup: React.FC<IProps> = (props) => {
    const {
        updateActiveLabelType,
        updateActiveLabelNameId,
        updateLabelNames,
        updateActiveImageIndex,
        updateImageData,
        updateFirstLabelCreatedFlag,
        updateProjectData,
        setProjectInfo,
    } = props;

    const renderContent = () => {
        return(
            <div className="ExitProjectPopupContent">
                <div className="Message">
                    Are you sure you want to leave the editor? You will permanently lose all your progress.
                </div>
            </div>
        )
    };

    const onAccept = () => {
        updateActiveLabelType(null);
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: "my-project-name"});
        updateActiveImageIndex(null);
        updateImageData([]);
        updateFirstLabelCreatedFlag(false);
        setProjectInfo(null, null);
        PopupActions.close();
    };

    const onReject = () => {
        PopupActions.close();
    };

    return(
        <GenericYesNoPopup
            title={"Exit project"}
            renderContent={renderContent}
            acceptLabel={"Exit"}
            onAccept={onAccept}
            rejectLabel={"Back"}
            onReject={onReject}
        />)
};

const mapDispatchToProps = {
    updateActiveLabelType,
    updateActiveLabelNameId,
    updateLabelNames,
    updateProjectData,
    updateActiveImageIndex,
    updateImageData,
    updateFirstLabelCreatedFlag,
    setProjectInfo,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExitProjectPopup);
