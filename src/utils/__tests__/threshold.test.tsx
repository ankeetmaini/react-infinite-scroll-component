import { cleanup } from '@testing-library/react'
import { parseThreshold } from '../threshold';


describe('when parseThreshold is called', () => {
    afterEach(() => {
        cleanup();
      });

    it('returns value and unit if scrollThreshold is a number', () => {
        const threshold = parseThreshold(4)   
        expect(threshold).toEqual({value: 400, unit: 'Percent'});     
    });

    it('returns value and unit if scrollThreshold is a string in px', () => {
        const threshold = parseThreshold('20.5px');
        expect(threshold).toEqual({value: 20.5, unit: 'Pixel'});     
    });

    it('returns value and unit if scrollThreshold is a string in %', () => {
        const threshold = parseThreshold('20.5%');
        expect(threshold).toEqual({value: 20.5, unit: 'Percent'});     
    });

    it('consoles a warning if scrollThreshold is a string with neither px nor %', () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        parseThreshold('20.5');
        expect(warn).toBeCalledWith('scrollThreshold format is invalid. Valid formats: "120px", "50%"...');
        warn.mockReset();
    });

    it('returns defaultThreshold if scrollThreshold is a string with neither px nor %', () => {
        const threshold = parseThreshold('20.5');
        expect(threshold).toEqual({value: 0.8, unit: 'Percent'});     
    });
})