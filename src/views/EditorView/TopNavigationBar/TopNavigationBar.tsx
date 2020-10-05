import React from 'react';
import './TopNavigationBar.scss';
import StateBar from "../StateBar/StateBar";
import {PopupWindowType} from "../../../data/enums/PopupWindowType";
import {AppState} from "../../../store";
import {connect} from "react-redux";
import {updateActivePopupType, updateProjectData} from "../../../store/general/actionCreators";
import TextInput from "../../Common/TextInput/TextInput";
import {ImageButton} from "../../Common/ImageButton/ImageButton";
import {ProjectData} from "../../../store/general/types";
import { TextButton } from '../../Common/TextButton/TextButton';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectData: ProjectData;
}

const TopNavigationBar: React.FC<IProps> = ({updateActivePopupType, updateProjectData, projectData}) => {
    const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        event.target.setSelectionRange(0, event.target.value.length);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
            .toLowerCase()
            .replace(' ', '-');

        updateProjectData({
            ...projectData,
            name: value
        })
    };

    return (
        <div className="TopNavigationBar">
            <StateBar/>
            <div className="TopNavigationBarWrapper">
                <div>
                    <div
                        className="Header"
                        onClick={() => updateActivePopupType(PopupWindowType.EXIT_PROJECT)}
                    >
                        <img
                            draggable={false}
                            alt={"make-sense"}
                            src={"/make-sense-ico-transparent.png"}
                        />
                        LEMONADE
                    </div>
                </div>
                <div className="NavigationBarGroupWrapper">
                    <div className="ProjectName">Project Name:</div>
                    <TextInput
                        key={"ProjectName"}
                        isPassword={false}
                        value={projectData.name}
                        onChange={onChange}
                        onFocus={onFocus}
                        disabled={true}
                    />
                </div>
                <div className="NavigationBarGroupWrapper">
                    <TextButton
                        style={{ borderRadius: '10px', backgroundColor:'#eee', fontSize:'12px', padding:'15px' }}
                        isActive={true}
                        label={"완료"}
                        onClick={() => updateActivePopupType(PopupWindowType.FINISH_PROJECT)}
                        externalClassName={"accept"}
                    />
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateProjectData
};

const mapStateToProps = (state: AppState) => ({
    projectData: state.general.projectData
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TopNavigationBar);
