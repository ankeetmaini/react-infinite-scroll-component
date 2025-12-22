export const ThresholdUnits = {
  Pixel: 'Pixel',
  Percent: 'Percent',
};

const defaultThreshold = {
  unit: ThresholdUnits.Percent,
  value: 0.8,
};

export function parseThreshold(scrollThreshold: string | number) {
  if (typeof scrollThreshold === 'number') {
    return {
      unit: ThresholdUnits.Percent,
      value: scrollThreshold * 100,
    };
  }

  if (typeof scrollThreshold === 'string') {
    if (/^(\d*(\.\d+)?)px$/.exec(scrollThreshold)) {
      return {
        unit: ThresholdUnits.Pixel,
        value: parseFloat(scrollThreshold),
      };
    }

    if (/^(\d*(\.\d+)?)%$/.exec(scrollThreshold)) {
      return {
        unit: ThresholdUnits.Percent,
        value: parseFloat(scrollThreshold),
      };
    }

    console.warn(
      'scrollThreshold format is invalid. Valid formats: "120px", "50%"...'
    );

    return defaultThreshold;
  }

  console.warn('scrollThreshold should be string or number');

  return defaultThreshold;
}
