type Props = { page: 'privacy' | 'terms' }

const CONTENT = {
  privacy: {
    title: 'Privacy',
    updated: 'October 2026',
    sections: [
      ['What we collect', 'Nothing. Pit Wall has no accounts, forms, cookies or analytics, and it stores no information about visitors.'],
      ['Videos', 'The two background videos are stored with the site and play locally. Watching them sends no data anywhere.'],
      ['Fonts', 'Typefaces load from Google Fonts, so your browser requests them from Google’s servers.'],
      ['Contact', 'Questions about this project can be raised with the team listed on the home page.'],
    ],
  },
  terms: {
    title: 'Terms',
    updated: 'October 2026',
    sections: [
      ['Purpose', 'Pit Wall is an academic project for the course 23CSE351 Foundations of Data Science. It is provided for education and demonstration only.'],
      ['Accuracy', 'Figures come from the Jolpica F1 open database and the project’s own analysis. They are reported as computed and may contain errors from the source data. Do not use them for betting or commercial decisions.'],
      ['Third-party content', 'The motion graphics belong to their creators, who shared them on FrameRate (framerate.tv). Local copies are used only for this classroom demonstration. Formula 1 and related marks belong to their owners; this project is not affiliated with Formula 1.'],
      ['Code', 'The site’s code and analysis are the work of the project team.'],
    ],
  },
} as const

export function Legal({ page }: Props) {
  const c = CONTENT[page]
  return (
    <main className="gutter min-h-[100svh] pb-24 pt-32">
      <article className="mx-auto grid max-w-[68ch] gap-10">
        <a href="#top" className="eyebrow hover:text-ink">← Back to Pit Wall</a>
        <header className="grid gap-3">
          <h1 className="display text-[clamp(2.6rem,7vw,5rem)]">{c.title}</h1>
          <p className="text-sm text-ink-dim">Last updated {c.updated}</p>
        </header>
        {c.sections.map(([h, body]) => (
          <section key={h} className="grid gap-2">
            <h2 className="text-lg font-semibold">{h}</h2>
            <p className="leading-relaxed text-ink-muted">{body}</p>
          </section>
        ))}
      </article>
    </main>
  )
}
