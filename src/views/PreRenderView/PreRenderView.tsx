import React from 'react';
import './PreRenderView.scss';
import {AppState} from "../../store";
import {connect} from "react-redux";
import {AuthService, LemonOptions} from '@lemoncloud/lemon-front-lib';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType, updateProjectData} from '../../store/general/actionCreators';
import {ProjectData} from '../../store/general/types';
import {addImageData, updateActiveImageIndex, updateLabelNames} from '../../store/labels/actionCreators';
import {setProjectId} from '../../store/lemon/actionCreators';
import {ImageData, LabelName} from '../../store/labels/types';
import {ImageDataUtil} from '../../utils/ImageDataUtil';

interface IProps {
    updateProjectData: (projectData: ProjectData) => any;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    addImageData: (imageData: ImageData[]) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
    updateLabelNames: (labels: LabelName[]) => any;
    setProjectId: (projectId: string) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = (
    {
        updateProjectData,
        updateActivePopupType,
        addImageData,
        updateLabelNames,
        updateActiveImageIndex,
        setProjectId,
        projectId,
    }) => {

    // set data
    const lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
    const lemonCore: AuthService = new AuthService(lemonOptions);
    setProjectId(projectId);

    const initProject = async () => {
        const { data: { name, labels, images } } = await getProjectData(projectId);
        setLabelsToStore(labels);
        setProjectNameToStore(name);

        const fileDatas = await convertUrlsToFiles(images);
        setImagesToStore(fileDatas);
        popUpChooseLabelType();
    }

    const getProjectData = async (projectId: string) => {
        return lemonCore.request('GET', 'http://localhost:8200', `/project/${projectId}`);
    }

    const convertUrlsToFiles = async (imageUrls) => {
        const customOptions = { responseType: 'blob' };
        lemonCore.setLemonOptions({ ...lemonOptions, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(({ id, url, name }) => {
            return lemonCore.request('GET', url, '/').then(response => ({ id, file: new File([response], name) }));
        }))
    }

    const setLabelsToStore = (labels: LabelName[]) => {
        console.log(labels)
        updateLabelNames(labels);
        // setOriginLabels(labels);
    }

    const setProjectNameToStore = (name: string) => {
        updateProjectData({ name, type: null });
    }

    const setImagesToStore = datas => {
        const imageDatas = datas.map(fileData => {
            const { id, file } = fileData;
            return ImageDataUtil.createImageDataFromFileData(file, id);
        });
        updateActiveImageIndex(0);
        addImageData(imageDatas);
    }

    const popUpChooseLabelType = () => {
        updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE);
    }

    initProject();

    const test = <div className="FirstStage">TEST</div>;
    return (
        <div className="PreRenderView">
            {test}
        </div>
    )
};

const mapDispatchToProps = {
    updateProjectData,
    updateActivePopupType,
    addImageData,
    updateActiveImageIndex,
    updateLabelNames,
    setProjectId,
};

const mapStateToProps = (state: AppState) => ({
    // TODO: add something
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
