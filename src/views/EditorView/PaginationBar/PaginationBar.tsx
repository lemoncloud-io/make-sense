import React, {useEffect} from 'react';
import './PaginationBar.scss';
import {AppState} from "../../../store";
import {connect} from "react-redux";
import {ImageButton} from "../../Common/ImageButton/ImageButton";
import classNames from "classnames";
import {LemonActions} from "../../../logic/actions/LemonActions";
import {PopupWindowType} from '../../../data/enums/PopupWindowType';
import { updateActivePopupType } from '../../../store/general/actionCreators';
import {from, of} from 'rxjs';
import {catchError, delay, filter, map, mergeMap, skip, tap} from 'rxjs/operators';
import {updateImageDataById} from '../../../store/labels/actionCreators';
import {ImageData} from '../../../store/labels/types';
import {setOriginLabels} from '../../../store/lemon/actionCreators';
import {ImageView} from "@lemoncloud/ade-backend-api";

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    page: number;
    totalPage: number;
    imagesData: ImageData[];
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    setOriginLabels: (originLabels: ImageData) => any;
}

const PaginationBar: React.FC<IProps> = (
    {
        updateActivePopupType,
        totalPage,
        page,
        imagesData,
        updateImageDataById,
        setOriginLabels
    }) => {

    useEffect(() => {
        const parallelRequest$ = from(imagesData).pipe(
            skip(page === 0 ? 0 : 1), // 처음 로딩 때만 전부 가져옴
            mergeMap(imageData => LemonActions.getDetailImageData$(imageData)
                .pipe(map(detailImage => ({ detailImage, imageData })))
            ),
            delay(100),
        );
        parallelRequest$.subscribe(({ detailImage, imageData }) => {
            const labels = LemonActions.getLabelsFromImageView(detailImage);
            updateImageDataById(imageData.id, { ...imageData, ...labels });
            if (imagesData.length > 0 && imagesData[0].id === imageData.id) {
                setOriginLabels({ ...imageData, ...labels}); // storing origin labels..
            }
        })
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const getImageCounter = () => {
        return (page + 1) + " / " + totalPage;
    };

    const getClassName = () => {
        return classNames("PaginationBar");
    };

    const clickPreviousPage = () => {
        if (page === 0) {
            return;
        }
        updateActivePopupType(PopupWindowType.LOADER);
        LemonActions.pageChanged(page - 1)
            .then(() => updateActivePopupType(null))
            .catch(e => updateActivePopupType(null))
    }

    const clickNextPage = () => {
        if (page === totalPage - 1) {
            return;
        }
        updateActivePopupType(PopupWindowType.LOADER);
        LemonActions.pageChanged(page + 1)
            .then(() => updateActivePopupType(null))
            .catch(e => updateActivePopupType(null))
    }

    return (
        <>
            {totalPage < 2
                ? <></>
                : <div className={getClassName()}>
                    <ImageButton
                        image={"ico/left.png"}
                        imageAlt={"previous"}
                        buttonSize={{width: 25, height: 25}}
                        onClick={clickPreviousPage}
                        isDisabled={page === 0}
                        externalClassName={"left"}
                    />
                    <div className="CurrentImageCount"> {getImageCounter()} </div>
                    <ImageButton
                        image={"ico/right.png"}
                        imageAlt={"next"}
                        buttonSize={{width: 25, height: 25}}
                        onClick={clickNextPage}
                        isDisabled={page === totalPage - 1}
                        externalClassName={"right"}
                    />
                </div>
            }
        </>

    );
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateImageDataById,
    setOriginLabels,
};

const mapStateToProps = (state: AppState) => ({
    totalPage: state.lemon.totalPage,
    page: state.lemon.page,
    imagesData: state.labels.imagesData,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaginationBar);
