/**
 * Mock for IntersectionObserver — jsdom does not implement it.
 * This file is registered in jest.config.js as a setupFile so the global
 * is available in every test. Tests that want to simulate intersections
 * import MockIntersectionObserver and call triggerIntersect().
 */
export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  callback: (entries: IntersectionObserverEntry[]) => void;
  options: IntersectionObserverInit;
  observedElements: Element[] = [];

  constructor(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observedElements.push(el);
  }

  unobserve(el: Element) {
    this.observedElements = this.observedElements.filter((e) => e !== el);
  }

  disconnect() {
    this.observedElements = [];
  }

  /** Simulate the sentinel element becoming visible. */
  triggerIntersect(el?: Element) {
    const target = el ?? this.observedElements[0];
    this.callback([
      { isIntersecting: true, target } as IntersectionObserverEntry,
    ]);
  }

  /** Simulate the sentinel element leaving the viewport. */
  triggerNoIntersect(el?: Element) {
    const target = el ?? this.observedElements[0];
    this.callback([
      { isIntersecting: false, target } as IntersectionObserverEntry,
    ]);
  }
}

// Assign globally so `new IntersectionObserver(...)` in the component resolves to the mock.
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
