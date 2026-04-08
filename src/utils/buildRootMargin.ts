import { ThresholdUnits, parseThreshold } from './threshold';

/**
 * Converts a scrollThreshold value into a CSS rootMargin string for IntersectionObserver.
 *
 * scrollThreshold represents "how far down the page before triggering" (e.g. 0.8 = 80%).
 * IntersectionObserver's rootMargin extends the root's bounding box so the sentinel is
 * detected before it actually enters the visible area.
 *
 * For a percentage threshold (e.g. 0.8 → 80%):
 *   remaining = 100% - 80% = 20% → rootMargin bottom = "20%"
 *
 * For a pixel threshold (e.g. "120px"):
 *   rootMargin bottom = "120px"
 *
 * Note: rootMargin percentages are relative to the root element's own dimensions, not
 * scrollHeight. This is a close approximation of the original scroll-event behavior and
 * is an intentional tradeoff for the performance benefit.
 *
 * For inverse mode the margin is applied to the top instead of the bottom.
 */
export function buildRootMargin(
  scrollThreshold: number | string,
  inverse: boolean
): string {
  const threshold = parseThreshold(scrollThreshold);

  let margin: string;
  if (threshold.unit === ThresholdUnits.Pixel) {
    margin = `${threshold.value}px`;
  } else {
    // threshold.value is already in percent (e.g. 80 for 0.8 input)
    const remaining = 100 - threshold.value;
    margin = `${remaining}%`;
  }

  return inverse ? `${margin} 0px 0px 0px` : `0px 0px ${margin} 0px`;
}
