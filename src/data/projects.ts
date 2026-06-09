/* Project index, priority order drives both the ordering and the spatial
   prominence on the Home page (flagship breaks wider). */

export interface ProjectMeta {
  slug: string;
  rank: number;
  title: string;
  subtitle: string;
  /** One-line "what it is" for the skim. */
  what: string;
  tags: string[];
  /** The single skim fact. Either a measured readout OR a qualitative line
      (Sea Ice carries NO number by design, measured-truth discipline). */
  headline:
    | { kind: 'metric'; value: string; unit?: string; prefix?: string; label: string; source?: string; accent?: 'cobalt' | 'amber' }
    | { kind: 'qualitative'; label: string };
}

export const projects: ProjectMeta[] = [
  {
    slug: 'qwen-4b',
    rank: 1,
    title: 'Maximizing a 4B Mind',
    subtitle: 'Math reasoning through prompting and decoding alone, with no training',
    what:
      'By treating inference itself as the problem to optimize, a fixed Qwen3-4B-Thinking ' +
      'model went from 0.388 to 0.724 on a math-reasoning leaderboard. There was no ' +
      'fine-tuning, and the whole thing ran on a single 12 GB GPU.',
    tags: ['LLM inference', 'vLLM · FP8', 'prompt engineering', 'CSE 151B'],
    headline: {
      kind: 'metric',
      value: '0.724',
      label: 'leaderboard score, up from a 0.388 baseline, with zero training',
      source: 'deck',
      accent: 'cobalt',
    },
  },
  {
    slug: 'socalguessr',
    rank: 2,
    title: 'Beating the Locals',
    subtitle: 'A 33k-parameter CNN that out-guesses a twenty-year resident',
    what:
      'A compact CNN places a single Street View photo in one of six Southern California ' +
      'cities. At 83.6% it more than doubles the accuracy of a twenty-year LA local, and ' +
      'it learned to do so in roughly fifteen minutes of training.',
    tags: ['CNN', 'computer vision', '33,510 params', 'DSC 140B'],
    headline: {
      kind: 'metric',
      value: '2×',
      label: 'a 20-year local’s accuracy (83.6% vs 40%)',
      source: 'metrics.json',
      accent: 'amber',
    },
  },
  {
    slug: 'sea-ice',
    rank: 3,
    title: 'The Vanishing Arctic',
    subtitle: 'A scroll-driven story where the chart is a function of scroll',
    what:
      'A D3 data story about decades of Arctic sea-ice decline. As you scroll, the chart ' +
      'redraws frame by frame, its scales and marks interpolating between states rather ' +
      'than cutting between them.',
    tags: ['D3.js', 'scrollytelling', 'data viz', 'explorable explanation'],
    headline: {
      kind: 'qualitative',
      label: 'There is no headline metric here; the craft is the story, and the chart is a continuous function of scroll.',
    },
  },
];

export const byRank = [...projects].sort((a, b) => a.rank - b.rank);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug)!;
