import { analyzeParcel, generateUseCaseAnalysis } from '../utils/investmentAnalysis'

const COLOR = {
  emerald: {
    card: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    bar: 'bg-emerald-500',
    positive: 'text-emerald-700',
    label: 'text-emerald-600',
  },
  blue: {
    card: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-600 text-white',
    bar: 'bg-blue-500',
    positive: 'text-blue-700',
    label: 'text-blue-600',
  },
  amber: {
    card: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500 text-white',
    bar: 'bg-amber-400',
    positive: 'text-amber-700',
    label: 'text-amber-600',
  },
  red: {
    card: 'bg-red-50 border-red-200',
    badge: 'bg-red-600 text-white',
    bar: 'bg-red-400',
    positive: 'text-red-700',
    label: 'text-red-600',
  },
}

const FLAG_STYLES = {
  positive: {
    dot: 'bg-emerald-500',
    text: 'text-gray-700',
  },
  caution: {
    dot: 'bg-amber-400',
    text: 'text-gray-700',
  },
  negative: {
    dot: 'bg-red-500',
    text: 'text-gray-700',
  },
}

const USE_COLOR = {
  blue:    { header: 'bg-blue-600',   light: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800' },
  emerald: { header: 'bg-emerald-600',light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  violet:  { header: 'bg-violet-600', light: 'bg-violet-50 border-violet-200', text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-800' },
  amber:   { header: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800' },
  indigo:  { header: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
}

export default function DeveloperTake({ pluto, zoning, geo }) {
  const district =
    pluto?.zonedist1 ||
    zoning?.zonedist ||
    zoning?.zoning_district ||
    null

  const analysis = analyzeParcel({ pluto, geo, district })
  if (!analysis) return null

  const useCases = generateUseCaseAnalysis({ pluto, geo })

  const c = COLOR[analysis.verdictColor]

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${c.card}`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Developer's Take</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${c.badge}`}>
              {analysis.verdict}
            </span>
            <p className="text-sm text-gray-600">{analysis.verdictSummary}</p>
          </div>
        </div>

        {/* Score meter */}
        <div className="flex-shrink-0 text-right">
          <p className="text-3xl font-black text-gray-800">{analysis.score}</p>
          <p className="text-xs text-gray-400">/ 100</p>
          <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-1 ml-auto overflow-hidden">
            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${analysis.score}%` }} />
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="px-5 pb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{analysis.narrative}</p>
      </div>

      {/* Flags */}
      {analysis.flags.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          {analysis.flags.map((flag, i) => {
            const s = FLAG_STYLES[flag.type]
            return (
              <div key={i} className="flex items-start gap-2.5">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <p className={`text-sm leading-snug ${s.text}`}>{flag.text}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Use-Case Breakdown ── */}
      {useCases && useCases.length > 0 && (
        <div className="border-t border-black/5 bg-white/60 px-5 pt-5 pb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Development Scenarios</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((use) => {
              const uc = USE_COLOR[use.color] || USE_COLOR.blue
              return (
                <div key={use.id} className={`rounded-xl border overflow-hidden ${uc.light} ${!use.feasible ? 'opacity-60' : ''}`}>
                  {/* Card header */}
                  <div className={`${uc.header} px-4 py-2 flex items-center justify-between`}>
                    <span className="text-xs font-bold text-white tracking-wide">{use.label}</span>
                    {!use.feasible && (
                      <span className="text-[10px] bg-white/20 text-white rounded px-1.5 py-0.5">Limited scale</span>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Metric label="Max FAR" value={use.far.toFixed(2)} color={uc.text} />
                      <Metric label="Buildable Area" value={use.buildableLabel} color={uc.text} />
                      {use.units !== null && (
                        <Metric label={use.unitLabel === 'keys' ? 'Hotel Keys' : use.unitLabel === 'resi units' ? 'Resi Units' : 'Units'} value={use.units.toLocaleString()} color={uc.text} />
                      )}
                      <Metric
                        label={use.valueLabel}
                        value={formatM(use.impliedValue)}
                        color={uc.text}
                        highlight
                      />
                    </div>

                    <p className="text-[11px] text-gray-400 leading-snug pt-1 border-t border-black/5">
                      {use.assumptions}
                    </p>

                    {use.warning && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 border border-amber-200">
                        ⚠ {use.warning}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            "Air rights" = unused FAR on existing building. "Full redevelop" = as-of-right if site were cleared and rebuilt to max FAR. Values use NYC market-rate estimates adjusted by borough. Not a substitute for a formal feasibility study.
          </p>
        </div>
      )}

      <div className="px-5 py-2.5 border-t border-black/5 bg-black/5">
        <p className="text-xs text-gray-400">
          Analysis is rule-based using MapPLUTO data. Not a substitute for professional underwriting or legal advice.
        </p>
      </div>
    </div>
  )
}

function Metric({ label, value, color, highlight }) {
  return (
    <div className={`rounded-lg px-2.5 py-1.5 ${highlight ? 'bg-white/70 border border-black/5' : ''}`}>
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  )
}

function formatM(n) {
  if (!n || isNaN(n)) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}
