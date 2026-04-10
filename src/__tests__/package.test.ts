export {};

/**
 * Validates package.json fields that affect consumers at install time.
 * These checks run on every `yarn test` invocation — no extra infrastructure needed.
 *
 * Issue class caught: overly-narrow peerDependency ranges (e.g. "^17" instead of ">=17")
 * that block React 18/19 consumers at npm install, like #419.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json') as {
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe('package.json — peer dependency ranges', () => {
  it('react peer dep uses >= (open-ended), not ^ (caret-bounded)', () => {
    // "^17.0.0" resolves to >=17 <18 — blocks React 18/19 consumers at install time.
    // Must be ">=17.0.0" or similar open range.
    expect(pkg.peerDependencies.react).toMatch(/^>=/);
  });

  it('react-dom peer dep uses >= (open-ended), not ^ (caret-bounded)', () => {
    expect(pkg.peerDependencies['react-dom']).toMatch(/^>=/);
  });

  it('peer dep floor is not higher than the version we test against in devDependencies', () => {
    // Guards against bumping the peer dep floor without updating our dev/test version.
    // e.g. peerDep ">=19" while devDep is still "^17" would mean our tests don't cover
    // the minimum version we claim to support.
    const peerFloor = parseInt(
      /\d+/.exec(pkg.peerDependencies.react)?.[0] ?? '',
      10
    );
    const devMajor = parseInt(
      /\d+/.exec(pkg.devDependencies.react)?.[0] ?? '',
      10
    );
    expect(peerFloor).toBeLessThanOrEqual(devMajor);
  });
});
