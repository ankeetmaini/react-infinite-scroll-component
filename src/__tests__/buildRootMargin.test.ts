import { buildRootMargin } from '../utils/buildRootMargin';

describe('buildRootMargin', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('normal (non-inverse) mode', () => {
    it('converts default number threshold (0.8) to bottom margin', () => {
      expect(buildRootMargin(0.8, false)).toBe('0px 0px 20% 0px');
    });

    it('converts 0.5 number threshold', () => {
      expect(buildRootMargin(0.5, false)).toBe('0px 0px 50% 0px');
    });

    it('converts 1.0 number threshold (trigger at 100%)', () => {
      expect(buildRootMargin(1.0, false)).toBe('0px 0px 0% 0px');
    });

    it('converts percent string threshold', () => {
      expect(buildRootMargin('80%', false)).toBe('0px 0px 20% 0px');
    });

    it('converts pixel string threshold', () => {
      expect(buildRootMargin('120px', false)).toBe('0px 0px 120px 0px');
    });

    it('converts 0px threshold', () => {
      expect(buildRootMargin('0px', false)).toBe('0px 0px 0px 0px');
    });
  });

  describe('inverse mode', () => {
    it('converts default number threshold (0.8) to top margin', () => {
      expect(buildRootMargin(0.8, true)).toBe('20% 0px 0px 0px');
    });

    it('converts pixel string threshold to top margin', () => {
      expect(buildRootMargin('120px', true)).toBe('120px 0px 0px 0px');
    });

    it('converts percent string threshold to top margin', () => {
      expect(buildRootMargin('50%', true)).toBe('50% 0px 0px 0px');
    });
  });
});
