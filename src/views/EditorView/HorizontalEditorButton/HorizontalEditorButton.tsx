import * as React from "react";
import classNames from "classnames";
import './HorizontalEditorButton.scss';

interface IProps {
    key?:string;
    label:string;
    onClick?:() => any;
    style?:React.CSSProperties;
    isActive?:boolean;
    isDisabled?:boolean;
    image?:string,
    imageAlt?:string,
}

export const HorizontalEditorButton = (props:IProps) => {

    const { key, label, onClick, style, isActive, isDisabled, image, imageAlt} = props;

    const getClassName = () => {
        return classNames(
            "HorizontalEditorButton",
            {
                "active": isActive,
                "disabled": isDisabled
            }
        );
    };

    return(
        <div
            className={getClassName()}
            onClick={!!onClick ? onClick : undefined}
            key={key}
            style={style}
        >
            {image && <img 
                draggable={false}
                alt={imageAlt} 
                src={image}
            />}
            {label}
        </div>
    )
};
