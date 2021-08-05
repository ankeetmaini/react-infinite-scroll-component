/* eslint-disable no-empty */

let cachedResult: null | boolean = null;
const dummyEventName = 'testPassive' as keyof WindowEventMap;

export function supportsPassive(): boolean {
  if (cachedResult !== null) {
    return cachedResult;
  }
  if (!window) {
    return false; // to not fail if used with server-side rendering
  }
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        cachedResult = true;
      },
    });
    window.addEventListener(dummyEventName, () => null, opts);
    window.removeEventListener(dummyEventName, () => null, opts);
  } catch (e) {}
  if (cachedResult === null) {
    cachedResult = false;
  }
  return cachedResult;
}
