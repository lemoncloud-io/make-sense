import React from 'react';
import {ISize} from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import {ImageData, LabelEllipse, LabelName } from "../../../../store/labels/types";
import './EllipseLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import LabelInputField from "../LabelInputField/LabelInputField";
import EmptyLabelList from "../EmptyLabelList/EmptyLabelList";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import {findLast} from "lodash";

interface IProps {
    size: ISize;
    imageData: ImageData;
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    activeLabelId: string;
    highlightedLabelId: string;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    labelNames: LabelName[];
    updateActiveLabelId: (activeLabelId: string) => any;
}

const EllipseLabelsList: React.FC<IProps> = ({size, imageData, updateImageDataById, labelNames, updateActiveLabelNameId, activeLabelId, highlightedLabelId, updateActiveLabelId}) => {
    const labelInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.labelEllipses.length * labelInputFieldHeight
    };

    const deleteEllipseLabelById = (labelEllipseId: string) => {
        LabelActions.deleteEllipseLabelById(imageData.id, labelEllipseId);
    };

    const updateEllipseLabel = (labelEllipseId: string, labelNameId: string) => {
        const newImageData = {
            ...imageData,
            labelEllipses: imageData.labelEllipses
                .map((labelEllipse: LabelEllipse) => {
                    if (labelEllipse.id === labelEllipseId) {
                        return {
                            ...labelEllipse,
                            labelId: labelNameId,
                            status: LabelStatus.ACCEPTED
                        }
                    } else {
                        return labelEllipse
                    }
                })
        };
        updateImageDataById(imageData.id, newImageData);
        updateActiveLabelNameId(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelId(null);
    };

    const getChildren = () => {
        return imageData.labelEllipses
            .filter((labelEllipse: LabelEllipse) => labelEllipse.status === LabelStatus.ACCEPTED)
            .map((labelEllipse: LabelEllipse) => {
                return <LabelInputField
                    size={{
                        width: size.width,
                        height: labelInputFieldHeight
                    }}
                    isActive={labelEllipse.id === activeLabelId}
                    isHighlighted={labelEllipse.id === highlightedLabelId}
                    id={labelEllipse.id}
                    key={labelEllipse.id}
                    onDelete={deleteEllipseLabelById}
                    value={labelEllipse.labelId !== null ? findLast(labelNames, {id: labelEllipse.labelId}) : null}
                    options={labelNames}
                    onSelectLabel={updateEllipseLabel}
                />
            });
    };

    return (
        <div
            className="EllipseLabelsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            {imageData.labelEllipses.filter((labelEllipse: LabelEllipse) => labelEllipse.status === LabelStatus.ACCEPTED).length === 0 ?
                <EmptyLabelList
                    labelBefore={"draw your first bounding box"}
                    labelAfter={"no labels created for this image yet"}
                /> :
                <Scrollbars>
                    <div
                        className="EllipseLabelsListContent"
                        style={listStyleContent}
                    >
                        {getChildren()}
                    </div>
                </Scrollbars>
            }
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataById,
    updateActiveLabelNameId,
    updateActiveLabelId
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EllipseLabelsList);
