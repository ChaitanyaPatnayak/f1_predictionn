const TEAM = [
  ['R. Meghapranay', 'CB.SC.U4CSE24440'],
  ['P. Krishna Chaitanaya', 'CB.SC.U4CSES24436'],
  ['M. Rishit Kumar', 'CB.SC.U4CSE24428'],
  ['K. Aditya', 'CB.SC.U4CSE24423'],
] as const

export function Footer() {
  return (
    <footer className="gutter border-t border-hairline-strong pb-12 pt-20">
      <div className="mx-auto grid max-w-[1360px] gap-14">
        <p className="display text-[clamp(2.4rem,7vw,6rem)] leading-[0.9]">
          Pit<span className="text-red">/</span>Wall
        </p>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="grid content-start gap-3">
            <span className="eyebrow">Team</span>
            <ul className="grid gap-2">
              {TEAM.map(([name, reg]) => (
                <li key={reg} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-hairline pb-2">
                  <span>{name}</span><span className="num text-xs text-ink-dim">{reg}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-3 text-sm leading-relaxed text-ink-muted">
            <span className="eyebrow">Project</span>
            <p>23CSE351 Foundations of Data Science, case study. Department of Computer Science and Engineering.</p>
            <p>Every figure on this site is computed in the project notebook from the race data, 1950 to 2025.</p>
          </div>
          <div className="grid content-start gap-3 text-sm leading-relaxed text-ink-muted">
            <span className="eyebrow">Sources</span>
            <p>Race data: Jolpica F1 open database, successor to the Ergast API, <a className="text-ink underline decoration-red underline-offset-4" href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer">github.com/jolpica/jolpica-f1</a>.</p>
            <p>Motion graphics were shared by their creators on FrameRate and remain their work; local copies are used for this classroom demo only.</p>
            <p className="flex gap-4"><a className="text-ink hover:text-red" href="#privacy">Privacy</a><a className="text-ink hover:text-red" href="#terms">Terms</a></p>
          </div>
        </div>
        <p className="text-xs text-ink-dim">Formula 1 and related marks belong to their owners. This is an independent student project and is not affiliated with Formula 1.</p>
      </div>
    </footer>
  )
}
