# Review comments exported from the old host

## PR #7 feat: invoice report (91b2e6a)

- **Lin Wei** on `src/report.js`: Can we name the row columns somewhere? Fine for now.

## PR #9 fix(report): order dates showed the UTC day (a3f9c21)

- **Sam Ortiz**: LGTM.

## PR #12 feat(export): CSV export behind --csv (e41c0d2)

- **Sam Ortiz** on `src/export.js`: Nice, ship it.

## PR #14 fix(export): CSV stamp showed tomorrow's date in the evening (7be0d44)

- **Lin Wei**: Same bug as #9. `toISOString().slice(0, 10)` is the UTC day, not ours. We have `formatLocalDate` for this; this keeps slipping through review.
