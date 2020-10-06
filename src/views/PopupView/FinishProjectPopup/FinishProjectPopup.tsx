import React from 'react'
import './FinishProjectPopup.scss'
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
import {LemonActions} from '../../../logic/actions/LemonActions';
import {setProjectId} from '../../../store/lemon/actionCreators';
import {LabelType} from '../../../data/enums/LabelType';

interface IProps {
    updateActiveLabelType: (labelType: LabelType) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateImageData: (imageData: ImageData[]) => any;
    updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
    updateProjectData: (projectData: ProjectData) => any;
    setProjectId: (id: string) => any;
}

const FinishProjectPopup: React.FC<IProps> = (props) => {
    const {
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
                    작업을 마치시겠습니까?
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
            resetStore();
            PopupActions.close();
        }).then(() => {
            // TODO: navigate to ...
            window.location.href = 'http://naver.com';
        })
    }

    const resetStore = () => {
        updateActiveLabelType(null);
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: "my-project-name"});
        updateActiveImageIndex(null);
        updateImageData([]);
        updateFirstLabelCreatedFlag(false);
        setProjectId(null);
    }

    return(
        <GenericYesNoPopup
            title={"작업 완료"}
            renderContent={renderContent}
            acceptLabel={"예"}
            onAccept={onAccept}
            rejectLabel={"아니요"}
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
    setProjectId,
};

const mapStateToProps = (state: AppState) => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FinishProjectPopup);
