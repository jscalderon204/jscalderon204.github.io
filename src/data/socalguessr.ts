/* SoCalGuessr data, derived at build time from the AUTHORITATIVE source files
   in proj_info/. Importing the JSON directly means every published figure is
   literally read from metrics.json / history.json, not transcribed. */
import metrics from '../../proj_info/SoCalGuessr/metrics.json';
import history from '../../proj_info/SoCalGuessr/history.json';

const CITY_LABELS: Record<string, string> = {
  Anaheim: 'Anaheim',
  Bakersfield: 'Bakersfield',
  Los_Angeles: 'Los Angeles',
  Riverside: 'Riverside',
  SLO: 'San Luis Obispo',
  San_Diego: 'San Diego',
};
const SHORT: Record<string, string> = {
  Anaheim: 'Anaheim',
  Bakersfield: 'Bakersfield',
  Los_Angeles: 'LA',
  Riverside: 'Riverside',
  SLO: 'SLO',
  San_Diego: 'San Diego',
};

export const classes = metrics.classes;
export const cityLabels = metrics.classes.map((c) => CITY_LABELS[c] ?? c);
export const cityShort = metrics.classes.map((c) => SHORT[c] ?? c);

export const overall = {
  accuracyPct: +(metrics.overall_accuracy * 100).toFixed(1), // 83.6
  correct: metrics.correct,                                   // 1534
  total: metrics.total,                                       // 1836
  epoch: metrics.epoch,                                       // 45
  source: 'metrics.json',
};

/** Per-class recall, sorted high→low, with the LA "confusion sink" flagged. */
export const perClassRecall = metrics.classes
  .map((c, i) => ({
    city: CITY_LABELS[c] ?? c,
    short: SHORT[c] ?? c,
    recallPct: +(metrics.per_class_accuracy[i] * 100).toFixed(1),
    correct: metrics.per_class_correct[i],
    total: metrics.per_class_total[i],
    sink: c === 'Los_Angeles',
  }))
  .sort((a, b) => b.recallPct - a.recallPct);

/** Confusion matrix: raw counts (the displayed value) plus the row total and
    row-normalized % (surfaced on demand in the interactive readout). */
export const confusion = metrics.confusion_matrix.map((row, i) => {
  const rowTotal = metrics.per_class_total[i];
  return row.map((count, j) => ({
    count,
    total: rowTotal,
    pct: +((count / rowTotal) * 100).toFixed(1),
    isDiagonal: i === j,
  }));
});

/** Largest single cell count, for the count-based color scale (sklearn-style:
    color encodes the raw count, not a per-row proportion). */
export const confusionMaxCount = Math.max(
  ...metrics.confusion_matrix.flat()
);

/** Training curve from history.json (80 epochs, no sampling needed). */
export const trainingCurve = history.epochs.map((e, i) => ({
  epoch: e,
  val: +(history.val_accuracy[i] * 100).toFixed(2),
  train: +(history.train_accuracy[i] * 100).toFixed(2),
}));
export const selectedEpoch = history.selected_epoch; // 45

/* The human-vs-machine punchline. Model = metrics.json; the human/chance
   figures are reported in the project brief (hand-labeled trial). */
export const beatsTheLocals = [
  { who: 'Chance', pct: 16.7, kind: 'baseline' as const, note: '1 of 6 cities' },
  { who: 'Joseph (50 imgs)', pct: 24, kind: 'human' as const, note: 'hand-labeled' },
  { who: '20-year LA local', pct: 40, kind: 'human' as const, note: 'lived here 20 yrs' },
  { who: 'The CNN', pct: overall.accuracyPct, kind: 'model' as const, note: '33,510 params' },
];
export const beatsSource = 'metrics.json · project brief';
