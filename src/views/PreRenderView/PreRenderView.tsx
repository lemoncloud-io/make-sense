import React from 'react';
import './PreRenderView.scss';
import {AppState} from "../../store";
import {connect} from "react-redux";
import {AuthService, LemonOptions} from '@lemoncloud/lemon-front-lib';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType, updateProjectData} from '../../store/general/actionCreators';
import {ProjectData} from '../../store/general/types';
import {addImageData, updateActiveImageIndex, updateLabelNames} from '../../store/labels/actionCreators';
import {ImageData, LabelName} from '../../store/labels/types';
import {ImageDataUtil} from '../../utils/ImageDataUtil';
import EditorView from '../EditorView/EditorView';

interface IProps {
    updateProjectData: (projectData: ProjectData) => any;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateLabelNames: (labels: LabelName[]) => any;
    addImageData: (imageData: ImageData[]) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
}

const PreRenderView: React.FC<IProps> = (
    {
        updateProjectData,
        updateActivePopupType,
        updateLabelNames,
        addImageData,
        updateActiveImageIndex,
    }) => {

    const lemonOptions: LemonOptions = { project: 'lemonade', oAuthEndpoint: 'TODO: add env' };
    const lemonCore: AuthService = new AuthService(lemonOptions);

    lemonCore.request('GET', 'http://localhost:8200/', 'project/hi').then(res => {
        const { data: { name, labels, images } } = res;
        console.log(name, labels, images);
        updateProjectData({ name, type: null });
        updateLabelNames(labels);

        // request images
        lemonCore.setLemonOptions({
            ...lemonOptions,
            extraOptions: {
                responseType: 'blob',
            }
        });

        Promise.all(images.map(({ url, name }) => {
            return lemonCore.request('GET', url, '/')
                .then(response => new File([response], name))
        })).then((files: any) => {
            updateActiveImageIndex(0);
            addImageData(files.map((fileData:File) => ImageDataUtil.createImageDataFromFileData(fileData)));
            updateActivePopupType(PopupWindowType.CHOOSE_LABEL_TYPE);
        }).catch(console.error.bind(console));
    });

    const firstStage = <div className="FirstStage">TEST</div>;

    return (<div className="PreRenderView">
            {firstStage}
    </div>)
};

const mapDispatchToProps = {
    updateProjectData,
    updateActivePopupType,
    updateLabelNames,
    addImageData,
    updateActiveImageIndex,
};

const mapStateToProps = (state: AppState) => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreRenderView);
