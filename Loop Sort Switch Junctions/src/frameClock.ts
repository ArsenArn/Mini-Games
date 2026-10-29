// Use only requestAnimationFrame timestamps. performance.now() can already be
// later than the timestamp of a queued frame (startup or visibility changes).
export class FrameClock {
  private previous: number | null = null;

  reset(): void {
    this.previous = null;
  }

  tick(timestamp: number): number {
    if (!Number.isFinite(timestamp)) {
      this.reset();
      return 0;
    }
    const previous = this.previous;
    this.previous = timestamp;
    if (previous === null || timestamp < previous) return 0;
    return (timestamp - previous) / 1000;
  }
}
