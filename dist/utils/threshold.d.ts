export declare const ThresholdUnits: {
    Pixel: string;
    Percent: string;
};
export declare function parseThreshold(scrollThreshold: string | number): {
    unit: string;
    value: number;
};
