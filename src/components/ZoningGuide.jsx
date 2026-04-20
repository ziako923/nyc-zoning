import { ZONE_CATEGORIES } from '../utils/zoningData'

export default function ZoningGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">NYC Zoning Districts</h2>
        <p className="text-sm text-gray-500">
          New York City's Zoning Resolution divides the city into three main zoning categories —
          Residential, Commercial, and Manufacturing — each with sub-districts that control building
          density, use, and bulk.
        </p>
      </div>

      {ZONE_CATEGORIES.map((cat) => (
        <section key={cat.category}>
          <div className={`rounded-xl border p-4 mb-3 ${cat.headerColor}`}>
            <h3 className="text-base font-bold">{cat.category} Districts</h3>
            <p className="text-sm opacity-75 mt-0.5">{cat.summary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.districts.map((d) => (
              <div key={d.code} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${cat.badgeColor}`}>{d.code}</span>
                  <span className="text-sm font-medium text-gray-800">{d.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{d.description}</p>
                {d.examples && (
                  <p className="text-xs text-gray-400 mt-2 italic">e.g. {d.examples}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Overlay Districts & Special Areas</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          In addition to base districts, NYC has commercial overlay zones (C1, C2), special purpose districts
          (e.g. Special Hudson Yards, Special Midtown), and inclusionary housing designations that modify
          the base zoning. Suffixes like "A", "X", or "-1" on district codes indicate density or bulk sub-classes.
          Always verify with the official{' '}
          <a href="https://zola.planning.nyc.gov" target="_blank" rel="noreferrer" className="underline font-medium">
            ZoLa map
          </a>{' '}
          for parcel-specific rules.
        </p>
      </div>
    </div>
  )
}
