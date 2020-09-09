import React from 'react';
import './PreRenderView.scss';
import {AppState} from "../../store";
import {connect} from "react-redux";
import {AuthService, LemonOptions} from '@lemoncloud/lemon-front-lib';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType, updateProjectData} from '../../store/general/actionCreators';
import {ProjectData} from '../../store/general/types';
import {addImageData, updateActiveImageIndex, updateLabelNames} from '../../store/labels/actionCreators';
import { setOriginLabels, setProjectId } from '../../store/lemon/actionCreators';
import {ImageData, LabelName} from '../../store/labels/types';
import {ImageDataUtil} from '../../utils/ImageDataUtil';

interface IProps {
    updateProjectData: (projectData: ProjectData) => any;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    addImageData: (imageData: ImageData[]) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
    setOriginLabels: (labels: LabelName[]) => any;
    setProjectId: (projectId: string) => any;
    projectId: string;
}

const PreRenderView: React.FC<IProps> = (
    {
        updateProjectData,
        updateActivePopupType,
        addImageData,
        updateActiveImageIndex,
        setOriginLabels,
        setProjectId,
        projectId,
    }) => {

    // set data
    setProjectId(projectId);

    const lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
    const lemonCore: AuthService = new AuthService(lemonOptions);

    const getProjectData = async (projectId: string) => {
        return await lemonCore.request('GET', 'http://localhost:8200', `/project/${projectId}`);
    }

    const convertUrlsToFiles = async (imageUrls) => {
        const customOptions = { responseType: 'blob' };
        lemonCore.setLemonOptions({ ...lemonOptions, extraOptions: { ...customOptions } });

        return Promise.all(imageUrls.map(({ id, url, name }) => {
            return lemonCore.request('GET', url, '/').then(response => ({ id, file: new File([response], name) }));
        }))
    }

    const setLabelsToStore = (labels: LabelName[]) => {
        // updateLabelNames(labels);
        setOriginLabels(labels);
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

    getProjectData(projectId)
        .then(res => {
            const { data: { name, labels, images } } = res;
            setLabelsToStore(labels);
            setProjectNameToStore(name);
            return convertUrlsToFiles(images);
        })
        .then(datas => {
            setImagesToStore(datas);
            popUpChooseLabelType();
        });

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
    setOriginLabels,
    setProjectId,
};

const mapStateToProps = (state: AppState) => ({
    // TODO: add something
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
