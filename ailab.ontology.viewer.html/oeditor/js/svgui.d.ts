/// <reference path="d3.d.ts"/>
declare module svgui {
    export interface Vector {
        x: number;
        y: number;
    }

    export interface Margin {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }

    export interface UIElement {
        root: D3.Selection;
        margin: Margin;
        update(): void;
        measure(maxSize: Vector): Vector;
        arrange(): void;
    }

    export function measure(element: UIElement, maxSize: Vector): Vector;
    export function arrange(element: UIElement, x: number, y: number, size?: Vector): void;
    export function sizeWithMargin(element: UIElement): Vector;

    export interface LabelParams {
        text?: string;
        textClass?: string;
        interline?: number;
        raze?: boolean;
    }

    export function Label(params?: LabelParams): UIElement;

    export interface PropertyTableParams {
        content?: {
            name: string;
            val: {left: string; right: string};
        };
        captionClass?: string;
        pairClass?: string;
        percent_leftright?: number;
        indentBetweenLeftAndRight?: number;
        horIndent?: number;
        spacing?: Vector;
    }

    export function PropertyTable(params?: PropertyTableParams): UIElement;

    export interface ExpanderParams {
        first: UIElement;
        second: UIElement;
        splitterMargin: number;
        expanded: boolean;
    }

    export function Expander(params?: ExpanderParams): UIElement;

    export interface PaginatorParams {}

    export function Paginator(params?: PaginatorParams): PaginatorElement;

    export interface PaginatorElement extends UIElement {
        currentPage: number;
        pageCount: number;
        onPageChanged: (currentPage: number) => void;
        color: any;
        changePageTo(newPage: number): void;
    }
}
