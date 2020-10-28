import React, {useState} from "react";
import {PopupActions} from "../../../logic/actions/PopupActions";
import {GenericYesNoPopup} from "../GenericYesNoPopup/GenericYesNoPopup";
import './AssignTasksPopup.scss'
import {ClipLoader} from "react-spinners";
import {findLast} from "lodash";
import {CSSHelper} from "../../../logic/helpers/CSSHelper";
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import {LemonActions} from '../../../logic/actions/LemonActions';
import {updateActivePopupType, updateProjectData} from '../../../store/general/actionCreators';
import {PopupWindowType} from '../../../data/enums/PopupWindowType';
import {ProjectData} from '../../../store/general/types';
import {ProjectType} from '../../../data/enums/ProjectType';

interface SelectLimitOption {
    title: string,
    value: number,
    flag: boolean
}

const options: SelectLimitOption[] = [
    {
        title: "5개",
        value: 5,
        flag: false
    },
    {
        title: "10개",
        value: 10,
        flag: false
    },
    {
        title: "15개",
        value: 15,
        flag: false
    },
    {
        title: "20개",
        value: 20,
        flag: false
    },
];

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectId: string;
}

const AssignTasksPopup: React.FC<IProps> = (
    {
        projectId,
        updateActivePopupType,
        updateProjectData
    }) => {
    const [modelIsLoadingStatus, setModelIsLoadingStatus] = useState(false);
    const [selectedLimitOption, updateSelectedLimitOption] = useState(options);

    const onAccept = () => {
        if (!extractSelectedLimitOption()) {
            return;
        }
        setModelIsLoadingStatus(true);
        const limit = extractSelectedLimitOption();
        LemonActions.getAllTaskData(projectId, limit).then(({ projectId, category }) => {
            updateActivePopupType(null);
            // TODO: set type as category
            updateProjectData({ name: projectId, type: ProjectType.OBJECT_DETECTION });
        });
    };

    const extractSelectedLimitOption = (): number => {
        const option: SelectLimitOption = findLast(selectedLimitOption, { flag: true });
        if (!!option) {
            return option.value
        } else {
            return null;
        }
    };

    const onSelect = (selectedLimit: number) => {
        const nextSelectedLimit: SelectLimitOption[] = selectedLimitOption.map((option: SelectLimitOption) => {
            if (option.value === selectedLimit)
                return {
                    ...option,
                    flag: !option.flag
                };
            else
                return {
                    ...option,
                    flag: false
                };
        });
        updateSelectedLimitOption(nextSelectedLimit);
    };

    const getOptions = () => {
        return selectedLimitOption.map((entry: SelectLimitOption) => {
            return <div
                className="OptionsItem"
                onClick={() => onSelect(entry.value)}
                key={entry.title}
            >
                {entry.flag ?
                    <img
                        draggable={false}
                        src={"ico/checkbox-checked.png"}
                        alt={"checked"}
                    /> :
                    <img
                        draggable={false}
                        src={"ico/checkbox-unchecked.png"}
                        alt={"unchecked"}
                    />}
                {entry.title}
            </div>
        })
    };

    const onReject = () => {
        PopupActions.close();
        window.history.back();
    };

    const renderContent = () => {
        return <div className="AssignTasksPopup">
            <div className="Message">
                작업 할당량을 선택해주세요.<br/>
                <span>(해당 프로젝트는 최대 20개 작업을 할 수 있습니다.)</span>
            </div>
            <div className="Companion">
                {modelIsLoadingStatus ?
                    <ClipLoader
                        sizeUnit={"px"}
                        size={40}
                        color={CSSHelper.getLeadingColor()}
                        loading={true}
                    /> :
                    <div className="Options">
                        {getOptions()}
                    </div>
                }
            </div>
        </div>
    };

    return(
        <GenericYesNoPopup
            title={"작업 할당량"}
            renderContent={renderContent}
            acceptLabel={"취소"}
            onAccept={onReject}
            disableAcceptButton={modelIsLoadingStatus}
            rejectLabel={"확인"}
            onReject={onAccept}
            disableRejectButton={modelIsLoadingStatus || !extractSelectedLimitOption()}
        />
    );
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateProjectData
}

const mapStateToProps = (state: AppState) => ({
    projectId: state.lemon.projectId,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssignTasksPopup);

