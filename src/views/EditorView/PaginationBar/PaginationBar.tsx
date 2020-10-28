import React from 'react';
import './PaginationBar.scss';
import {AppState} from "../../../store";
import {connect} from "react-redux";
import {ImageButton} from "../../Common/ImageButton/ImageButton";
import classNames from "classnames";
import {LemonActions} from "../../../logic/actions/LemonActions";
import {PopupWindowType} from '../../../data/enums/PopupWindowType';
import { updateActivePopupType } from '../../../store/general/actionCreators';

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    page: number;
    totalPage: number;
}

const PaginationBar: React.FC<IProps> = (
    {
        updateActivePopupType,
        totalPage,
        page,
    }) => {

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
        <div className={getClassName()}>
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
    );
};

const mapDispatchToProps = {
    updateActivePopupType
};

const mapStateToProps = (state: AppState) => ({
    totalPage: state.lemon.totalPage,
    page: state.lemon.page,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaginationBar);
