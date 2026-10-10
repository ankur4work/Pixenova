/**
 * Usage gauge.
 *
 * Replaces Polaris's <ProgressBar> for quota display so the quota reads as
 * owned capacity rather than a loading bar: a continuous striped violet track
 * with the percentage called out beside it, turning red once the quota is spent.
 *
 * The reading sits OUTSIDE the track rather than inside it. At low usage an
 * in-track label has no filled area to sit on and either overflows the bar or
 * disappears, which is exactly when a merchant most wants to read it.
 *
 * Purely presentational: it takes the same numbers the old bar derived its
 * percentage from, so quota behaviour is unchanged.
 */
export default function UsageMeter({ used = 0, quota = 0, showReading = true }) {
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const critical = quota > 0 && used >= quota;

  // Any usage at all must be visible. A rounded 0% on a 15,000-image plan would
  // otherwise paint an apparently empty meter for a merchant who has already
  // optimized images.
  const trace = pct === 0 && used > 0;

  const track = (
    <div
      className={critical ? "px-meter is-critical" : "px-meter"}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% of the monthly image quota used`}
    >
      <div
        className={trace ? "px-meter-fill is-trace" : "px-meter-fill"}
        style={{ width: `${pct}%` }}
      />
    </div>
  );

  if (!showReading) return track;

  return (
    <div className="px-meter-row">
      {track}
      <span className={critical ? "px-meter-read is-critical" : "px-meter-read"}>
        {`${pct}%`}
      </span>
    </div>
  );
}
