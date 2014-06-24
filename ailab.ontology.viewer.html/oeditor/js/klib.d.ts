/// <reference path="d3.d.ts"/>
declare module kiv {
    export class Tooltip {}

    export function tooltip(elementID: string): Tooltip;

    export function zoomingArea(width: number, height: number, baseElementForOuter: D3.Selection, borderfill: any, scaleExtent: any, innerFill: any): ZoomingArea;

    export class ZoomingArea {
        getOuterGroup(): D3.Selection;
        getZoomingGroup(): D3.Selection;
        disableZoom(): void;
        enableZoom(): void;
        rescaleCoords(coords: number[]): void;
        returnBack(): void;
        translate(toX: number, toY: number): void;
    }

    export function colorHelper(): ColorHelper;

    export interface ColorHelper {
        getSomeObjectColor(objID: any): any;
    }

    export interface SmartServerRequestParams {
        request: string;
        url: string;
        interval?: number;

        guidPrefix?: string;
        cancelPrefix?: string;
        waitPrefix?: string;
        finishPrefix?: string;
        errorPrefix?: string;

        waitHandler?: (status: string) => void;
        finishHandler?: (status: string) => void;
        errorHandler?: (status: string) => void;
    }

    export function smartServerRequest(params: SmartServerRequestParams): SmartServerRequest;

    export class SmartServerRequest {
        isRunning: boolean;
        isFailed: boolean;
        isCancelled: boolean;
        cancel(): void;
    }
}

declare module kiv.ui {
    export interface UIElement {
        render(parent: D3.Selection, x: number, y: number, width: number): void;
        height(width: number): number;
        setAction(targetAction: string, functor: any, capture?: boolean): void;
    }

    export interface NiceRoundRectangleParams {
        roundXY?: number;
        uText?: string;
        lContainer?: UIElement;
        color?: any;
        marginXTop?: number;
        marginX?: number;
        marginY?: number;
        borderSize?: number;
        classUpperText?: string;
    }

    export function NiceRoundRectangle(params: NiceRoundRectangleParams): UIElement;

    export interface SimpleTextParams {
        text?: string;
        textClass?: string;
        vertMargin?: number;
        raze?: boolean;
    }

    export function SimpleText(params: SimpleTextParams): UIElement;

    export interface StructuredTextParams {
        struct_text?: {
            name: string;
            val: {left: string; right: string;}[];
        }[];
        nameTextClass?: string;
        valTextClass?: string;
        percent_leftright?: number;
        indentBetweenLeftAndRight?: number;
        horIndent?: number;
        vertMargin?: number;
    }

    export function StructuredText(params: StructuredTextParams): UIElement;

    export interface LayoutContainerParams {
        upperText: UIElement;
        lowerText: UIElement;
        lineFill?: any;
        lineSize?: number;
        vertMargin?: number;
        horMargin?: number;
    }

    export function LayoutContainer1(params: LayoutContainerParams): UIElement;
}

interface IndicatorParams {
    size?: number;
    position?: {x: number; y: number};
    maxWidth?: number;
}

declare class Indicator {
    static create(parent: D3.Selection, params?: IndicatorParams): Indicator;

    parent: D3.Selection;
    statusText: string;
    isErrorOccurred: boolean;
    isVisible: boolean;

    run(): Indicator;
    visible(isVisible: boolean): void;
    moveTo(position: {x: number; y: number;}): void;

    status(statusText: string): void;
    error(): void;
    remove(): void;
}

declare class WrapIndicator {
    static wrap(parent: D3.Selection, params?: IndicatorParams): WrapIndicator;

    parent: D3.Selection;
    wrapper: D3.Selection;

    status(statusText: string): void;
    error(): void;
    remove(): void;
}
