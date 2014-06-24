/// <reference path="d3.d.ts"/>

declare function mergeProperties<T>(destination: T, source: T): T;
declare function formD3ChainCalls(selection: D3.Selection, chainCall: string): D3.Selection;
declare function generateUniqueId(): string;

declare function each<T>(arrayOrObject: T, functor: (T) => void): void;
declare function containsInObj(object, property): boolean;
declare function goodIndexOf<T>(array: T[], value: T, trueFinder?: (item: T, value: T) => boolean): number;
declare function sumarray(array: number[], start?: number, end?: number): number;
declare function objToArrayKeys(object: any): string[];
declare function objToArrayValues(object: any): any[];

declare function vector(x: number, y: number): {x: number; y: number};

declare function textInfo(stringOfText: string, textElementClass: string): TextInfoResult;
interface TextInfoResult {
    width: number;
    height: number;
    baseLineHeight: number;
    offsetY: number;
}

declare function addBorderedRect(
    target: D3.Selection,
    x: number, y: number,
    width: number, height: number,
    borderWidth: number,
    fill: any,
    rx: number, ry: number,
    fillStroke: D3.Color.Color
): D3.Selection;
