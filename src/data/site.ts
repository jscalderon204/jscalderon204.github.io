/* Site-wide constants. Open blockers live here as explicit nullable fields so a
   TBD asset is a one-line edit and never gets fabricated in the markup. */

export const site = {
  name: 'Joseph Calderon',
  role: 'Data Scientist',
  location: 'San Diego, CA',
  tagline: 'A data scientist who is drawn to the problems where the constraints are the interesting part.',
  description:
    'Joseph Calderon is a data scientist in San Diego who gets research-grade results ' +
    'out of small models. He pushed a 4B math-reasoning model from 0.388 to 0.724 with ' +
    'zero training, and built a 33,000-parameter network that out-guesses a twenty-year local.',
  email: 'joseph.cal.204@gmail.com',
  linkedin: 'https://www.linkedin.com/in/joseph-calderon-480715261',

  /* Open blockers, null until the real asset is provided. Never fabricate. */
  github: null as string | null,
  resumePdf: null as string | null, // e.g. '/joseph-calderon-resume.pdf' once derived from JCResume.docx
  photo: null as string | null,     // e.g. '/joseph-calderon.jpg'
} as const;

export const nav = [
  { href: '/#work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];
