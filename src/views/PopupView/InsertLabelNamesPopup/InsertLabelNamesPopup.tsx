import React, { useRef, useState } from 'react';
import './InsertLabelNamesPopup.scss'
import {GenericYesNoPopup} from "../GenericYesNoPopup/GenericYesNoPopup";
import {PopupWindowType} from "../../../data/enums/PopupWindowType";
import {updateLabelNames} from "../../../store/labels/actionCreators";
import {updateActivePopupType} from "../../../store/general/actionCreators";
import {AppState} from "../../../store";
import {connect} from "react-redux";
import Scrollbars from 'react-custom-scrollbars';
import TextInput from "../../Common/TextInput/TextInput";
import {ImageButton} from "../../Common/ImageButton/ImageButton";
import uuidv1 from 'uuid/v1';
import {LabelName} from "../../../store/labels/types";
import {LabelUtil} from "../../../utils/LabelUtil";
import {LabelsSelector} from "../../../store/selectors/LabelsSelector";
import {LabelActions} from "../../../logic/actions/LabelActions";
import {ProjectType} from "../../../data/enums/ProjectType";

type LabelValue = {
    name: string;
    isEditable?: boolean;
}

interface IProps {
    projectType: ProjectType;
    projectId: string;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateLabelNames: (labels: LabelName[]) => any;
    isUpdate: boolean;
}

const InsertLabelNamesPopup: React.FC<IProps> = (
    {
        projectId,
        projectType,
        updateActivePopupType,
        updateLabelNames,
        isUpdate
    }) => {

    const scrollRef = useRef(null);

    const initialLabels: LabelValue[] = LabelUtil.convertLabelNamesListToMap(LabelsSelector.getLabelNames());
    const [labelNames, setLabelNames] = useState(initialLabels);
    const originLabels = [...LabelsSelector.getLabelNames()]; // to diff updated

    const addHandle = () => {
        const newLabel: LabelValue = { name: '', isEditable: true };
        const newLabelNames = {...labelNames, [uuidv1()]: newLabel };
        setLabelNames(newLabelNames);
        setTimeout(scrollRef.current.scrollToBottom, 150);
    };

    const deleteHandle = (key: string) => {
        const newLabelNames = { ...labelNames };
        delete newLabelNames[key];
        setLabelNames(newLabelNames);
    };

    const labelInputs = Object.keys(labelNames).map((key: string) => {
        return <div className="LabelEntry" key={key}>
                <TextInput
                    key={key}
                    value={labelNames[key].name}
                    isPassword={false}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(key, event.target.value)}
                    label={labelNames[key].isEditable ? "Insert Label" : "Default Label"}
                    disabled={!labelNames[key].isEditable}
                />
                {
                    labelNames[key].isEditable
                        ? <ImageButton
                            image={"ico/trash.png"}
                            imageAlt={"remove_label"}
                            buttonSize={{width: 30, height: 30}}
                            onClick={() => deleteHandle(key)}
                        />
                        : <></>
                }
        </div>
    });

    const onChange = (key: string, value: string) => {
        const newLabelNames = {...labelNames, [key]: { name: value, isEditable: true } };
        setLabelNames(newLabelNames);
    };

    const onCreateAccept = () => {
        const labelNamesList: LabelValue[] = extractLabelNamesList();
        if (labelNamesList.length > 0) {
            updateLabelNames(LabelUtil.convertMapToLabelNamesList(labelNames));
        }

        if (projectType === ProjectType.OBJECT_DETECTION)
            updateActivePopupType(PopupWindowType.LOAD_AI_MODEL);
        else
            updateActivePopupType(null);
    };

    const onUpdateAccept = () => {
        const labelNamesList: LabelValue[] = extractLabelNamesList();
        const updatedLabelNamesList: LabelName[] = LabelUtil.convertMapToLabelNamesList(labelNames);
        const missingIds: string[] = LabelUtil.labelNamesIdsDiff(LabelsSelector.getLabelNames(), updatedLabelNamesList);
        LabelActions.removeLabelNames(missingIds);
        // TODO: request DELETE missingIds
        console.log('missingIds', missingIds);
        // requestDeleteLabels(missingIds).then(res => console.log(res));

        if (labelNamesList.length > 0) {
            checkUpdatedLabels(updatedLabelNamesList);
            updateLabelNames(LabelUtil.convertMapToLabelNamesList(labelNames));
            updateActivePopupType(null);
        }
    };

    const checkUpdatedLabels = (updatedLabels: LabelName[], ) => {
        const updated = updatedLabels.filter(updatedLabel => !originLabels.some(originLabel => originLabel.name === updatedLabel.name));
        console.log('updated', updated);
        // TODO: request PUT data
    }

    const onCreateReject = () => {
        updateActivePopupType(PopupWindowType.LOAD_LABEL_NAMES);
    };

    const onUpdateReject = () => {
        updateActivePopupType(null);
    };

    const extractLabelNamesList = (): LabelValue[] => {
        return Object.values(labelNames).filter(((value: LabelValue) => !!value.name));
    };

    // const requestDeleteLabels = async (labelIds: string[]) => {
    //     const lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
    //     const lemonCore: AuthService = new AuthService(lemonOptions);
    //     return await lemonCore.request('PUT', 'http://localhost:8200', `/project/${projectId}`, {}, { labelIds });
    // }

    const renderContent = () => {
        return(<div className="InsertLabelNamesPopup">
            <div className="LeftContainer">
                <ImageButton
                    image={"ico/plus.png"}
                    imageAlt={"plus"}
                    buttonSize={{width: 40, height: 40}}
                    padding={25}
                    onClick={addHandle}
                />
            </div>
            <div className="RightContainer">
                <div className="Message">
                    {
                        isUpdate ?
                        "You can now edit the label names you use to describe the objects in the photos. Use the + " +
                        "button to add a new empty text field." :
                        "Before you start, you can create a list of labels you plan to assign to objects in your " +
                        "project. You can also choose to skip that part for now and define label names as you go."
                    }
                </div>
                <div className="LabelsContainer">
                    {Object.keys(labelNames).length > 0 ?
                        <Scrollbars ref={scrollRef}>
                        <div
                            className="InsertLabelNamesPopupContent"
                        >
                            {labelInputs}
                        </div>
                    </Scrollbars> :
                    <div
                        className="EmptyList"
                        onClick={addHandle}
                    >
                        <img
                            draggable={false}
                            alt={"upload"}
                            src={"img/type-writer.png"}
                        />
                        <p className="extraBold">Your label list is empty</p>
                    </div>}
                </div>
            </div>
        </div>);
    };

    return(
        <GenericYesNoPopup
            title={isUpdate ? "Edit labels" : "Create labels"}
            renderContent={renderContent}
            acceptLabel={isUpdate ? "Accept" : "Start project"}
            onAccept={isUpdate ? onUpdateAccept : onCreateAccept}
            rejectLabel={isUpdate ? "Cancel" : "Load labels from file"}
            onReject={isUpdate ? onUpdateReject : onCreateReject}
        />)
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateLabelNames
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    projectId: state.lemon.projectId,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InsertLabelNamesPopup);
