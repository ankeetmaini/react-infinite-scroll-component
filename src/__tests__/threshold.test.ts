import { parseThreshold, ThresholdUnits } from '../utils/threshold';

describe('parseThreshold', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('parses number as percent', () => {
    const t = parseThreshold(0.8);
    expect(t).toEqual({ unit: ThresholdUnits.Percent, value: 80 });
  });

  it('parses percent string', () => {
    const t = parseThreshold('37.5%');
    expect(t).toEqual({ unit: ThresholdUnits.Percent, value: 37.5 });
  });

  it('parses px string', () => {
    const t = parseThreshold('120px');
    expect(t).toEqual({ unit: ThresholdUnits.Pixel, value: 120 });
  });

  it('warns and returns default for invalid string', () => {
    const t = parseThreshold('foo' as any);
    expect(t.unit).toBe(ThresholdUnits.Percent);
    expect(t.value).toBe(0.8);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('warns and returns default for non-string/number', () => {
    const t = parseThreshold((null as unknown) as any);
    expect(t.unit).toBe(ThresholdUnits.Percent);
    expect(t.value).toBe(0.8);
    expect(warnSpy).toHaveBeenCalled();
  });
});
