import React from 'react'
import './FinishProjectPopup.scss'
import {GenericYesNoPopup} from "../GenericYesNoPopup/GenericYesNoPopup";
import {
    updateActiveImageIndex,
    updateActiveLabelNameId,
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
import {LemonActions} from '../../../logic/actions/LemonActions';

interface IProps {
    projectId: string;
    imagesData: ImageData[];
    updateActiveImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateImageData: (imageData: ImageData[]) => any;
    updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
    updateProjectData: (projectData: ProjectData) => any;
}

const FinishProjectPopup: React.FC<IProps> = (props) => {
    const {
        projectId,
        imagesData,
        updateActiveLabelNameId,
        updateLabelNames,
        updateActiveImageIndex,
        updateImageData,
        updateFirstLabelCreatedFlag,
        updateProjectData,
    } = props;

    const renderContent = () => {
        return(
            <div className="FinishProjectPopup">
                <div className="Message">
                    Are you sure you want to finish the project?
                </div>
            </div>
        )
    };

    const onAccept = () => {
        saveLabels();
    };

    const onReject = () => {
        PopupActions.close();
    };

    const saveLabels = () => {
        LemonActions.saveAllUpdatedImagesData().then(() => {
            // TODO: navigate to ...
            PopupActions.close();
        })
    }

    const resetStore = () => {
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: "my-project-name"});
        updateActiveImageIndex(null);
        updateImageData([]);
        updateFirstLabelCreatedFlag(false);
    }

    return(
        <GenericYesNoPopup
            title={"Finish project"}
            renderContent={renderContent}
            acceptLabel={"Save"}
            onAccept={onAccept}
            rejectLabel={"Back"}
            onReject={onReject}
        />)
};

const mapDispatchToProps = {
    updateActiveLabelNameId,
    updateLabelNames,
    updateProjectData,
    updateActiveImageIndex,
    updateImageData,
    updateFirstLabelCreatedFlag,
};

const mapStateToProps = (state: AppState) => ({
    projectId: state.lemon.projectId,
    imagesData: state.labels.imagesData,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FinishProjectPopup);
