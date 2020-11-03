import React from 'react'
import './IdlePopup.scss'
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

const IdlePopup: React.FC<IProps> = (props) => {
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
            <div className="IdlePopupContent">
                <div className="Message">
                    장시간 입력이 없어 로그아웃되었습니다. 새로고침 후 이용해주세요.
                </div>
            </div>
        )
    };

    const onAccept = () => {
        resetStore();
        PopupActions.close();
        window.location.reload();
    };

    const resetStore = () => {
        updateActiveLabelType(null);
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: "my-project-name"});
        updateActiveImageIndex(null);
        updateImageData([]);
        updateFirstLabelCreatedFlag(false);
        setProjectInfo(null, null);
    }

    return(
        <GenericYesNoPopup
            title={"장시간 미입력"}
            renderContent={renderContent}
            acceptLabel={"뒤로가기"}
            onAccept={onAccept}
            skipRejectButton={true}
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

const mapStateToProps = (state: AppState) => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IdlePopup);
