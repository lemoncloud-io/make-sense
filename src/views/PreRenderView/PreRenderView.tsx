import React from 'react';
import './PreRenderView.scss';
import { LemonActions } from '../../logic/actions/LemonActions';

interface IProps {
    projectId: string;
}

const PreRenderView: React.FC<IProps> = ({ projectId }) => {

    LemonActions.initProject(projectId);

    const test = <div className="FirstStage">TEST</div>;
    return (
        <div className="PreRenderView">
            {test}
        </div>
    )
};


export default PreRenderView;
