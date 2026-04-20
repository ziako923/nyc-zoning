import { getZoneInfo } from '../utils/zoningData'
import DeveloperTake from './DeveloperTake'
import WalkabilityCard from './WalkabilityCard'
import UnderwritingCalculator from './UnderwritingCalculator'
import { generateUseCaseAnalysis } from '../utils/investmentAnalysis'
import {
  getBuildingClassDescription,
  getLandUseDescription,
  getOwnerTypeDescription,
  formatCurrency,
  formatNum,
} from '../utils/plutoData'

export default function ZoningResult({ result }) {
  const { geo, lat, lng, zoning, pluto, walkability } = result

  const p = pluto || {}

  // --- Zoning district ---
  const district =
    p.zonedist1 ||
    zoning?.zonedist ||
    zoning?.zoning_district ||
    null
  const zoneInfo = district ? getZoneInfo(district) : null

  // --- FAR / air rights ---
  const builtFar = Number(p.builtfar) || 0
  const maxResiFar = Number(p.residfar) || 0
  const maxCommFar = Number(p.commfar) || 0
  const maxFacilFar = Number(p.facilfar) || 0
  const maxFar = Math.max(maxResiFar, maxCommFar, maxFacilFar)
  const lotArea = Number(p.lotarea) || 0
  const airRightsSqft = maxFar > 0 && lotArea > 0
    ? Math.max(0, (maxFar - builtFar) * lotArea)
    : null
  const farPct = maxFar > 0 ? Math.min(1, builtFar / maxFar) : null

  // --- Assessment ---
  const assessLand = Number(p.assessland) || 0
  const assessTot = Number(p.assesstot) || 0
  const exemptTot = Number(p.exempttot) || 0
  const landPerSqft = lotArea > 0 && assessLand > 0
    ? (assessLand / lotArea).toFixed(2)
    : null

  // --- Signals ---
  const isLandmark = p.landmark && p.landmark.trim() !== ''
  const isHistoric = p.histdist && p.histdist.trim() !== ''
  const hasAirRights = airRightsSqft !== null && airRightsSqft > 5000
  const hasOverlay = p.overlay1 && p.overlay1.trim() !== ''
  const hasSpecialDist = p.spdist1 && p.spdist1.trim() !== ''
  const isVacant = p.landuse === '11'

  const zolaUrl = `https://zola.planning.nyc.gov/#${lat}/${lng}/18`

  return (
    <div className="space-y-5">

      {/* ── Address header ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Parcel</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{geo.label || geo.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {[geo.borough, 'NY'].filter(Boolean).join(', ')}
              {geo.postalcode ? ` ${geo.postalcode}` : ''}
              {geo.neighbourhood ? ` · ${geo.neighbourhood}` : ''}
            </p>
          </div>
          <a
            href={zolaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on ZoLa
          </a>
        </div>

        {/* Quick IDs */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {geo.addendum?.pad?.bbl && <IdItem label="BBL" value={geo.addendum.pad.bbl} />}
          {geo.addendum?.pad?.bin && <IdItem label="BIN" value={geo.addendum.pad.bin} />}
          {p.block && <IdItem label="Block" value={p.block} />}
          {p.lot && <IdItem label="Lot" value={p.lot} />}
          {p.cd && <IdItem label="Community Dist." value={`CD ${p.cd}`} />}
          {p.council && <IdItem label="Council Dist." value={p.council} />}
          {p.schooldist && <IdItem label="School Dist." value={p.schooldist} />}
          {p.policeprct && <IdItem label="Precinct" value={p.policeprct} />}
        </div>
      </div>

      {/* ── Investment signals ── */}
      {(isLandmark || isHistoric || hasAirRights || isVacant || hasOverlay || hasSpecialDist) && (
        <div className="flex flex-wrap gap-2">
          {hasAirRights && (
            <Signal color="green" icon="✦">
              {formatNum(Math.round(airRightsSqft))} sq ft air rights available
            </Signal>
          )}
          {isVacant && (
            <Signal color="green" icon="◉">Vacant lot — shovel-ready</Signal>
          )}
          {hasOverlay && (
            <Signal color="blue" icon="⊕">
              Commercial overlay: {p.overlay1}{p.overlay2 ? ` / ${p.overlay2}` : ''}
            </Signal>
          )}
          {hasSpecialDist && (
            <Signal color="blue" icon="★">
              Special district: {p.spdist1}{p.spdist2 ? ` / ${p.spdist2}` : ''}
            </Signal>
          )}
          {isHistoric && (
            <Signal color="amber" icon="⚑">Historic district: {p.histdist}</Signal>
          )}
          {isLandmark && (
            <Signal color="red" icon="⛌">Individual Landmark — development restricted</Signal>
          )}
        </div>
      )}

      {/* ── Developer's Take ── */}
      <DeveloperTake pluto={pluto} zoning={zoning} geo={geo} />

      {/* ── Two-column grid for primary cards ── */}
      <div className="grid gap-5 md:grid-cols-2">

        {/* Zoning district */}
        <div className={`rounded-xl border shadow-sm p-5 ${zoneInfo?.color || 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">Zoning District</p>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-black tracking-tight">{district || '—'}</span>
            {zoneInfo && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/50 border border-white/40">
                {zoneInfo.category}
              </span>
            )}
          </div>
          {zoneInfo && (
            <>
              <p className="text-sm font-semibold mb-0.5">{zoneInfo.name}</p>
              <p className="text-sm opacity-75 leading-relaxed">{zoneInfo.description}</p>
            </>
          )}

          {/* Additional zone districts */}
          {(p.zonedist2 || p.zonedist3 || p.zonedist4) && (
            <div className="mt-3 pt-3 border-t border-white/30">
              <p className="text-xs opacity-50 mb-1">Additional districts on parcel</p>
              <div className="flex flex-wrap gap-1.5">
                {[p.zonedist2, p.zonedist3, p.zonedist4].filter(Boolean).map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded bg-white/40 text-xs font-semibold">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Overlays / special districts */}
          {(p.overlay1 || p.spdist1) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[p.overlay1, p.overlay2].filter(Boolean).map((o) => (
                <span key={o} className="px-2 py-0.5 rounded bg-blue-100/60 text-blue-900 text-xs font-medium">
                  Overlay: {o}
                </span>
              ))}
              {[p.spdist1, p.spdist2, p.spdist3].filter(Boolean).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-indigo-100/60 text-indigo-900 text-xs font-medium">
                  Spec: {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Development potential */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Development Potential</p>

          {maxFar > 0 ? (
            <>
              {/* FAR bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Built FAR: <strong className="text-gray-800">{builtFar.toFixed(2)}</strong></span>
                  <span>Max FAR: <strong className="text-gray-800">{maxFar.toFixed(2)}</strong></span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      farPct > 0.9 ? 'bg-red-400' : farPct > 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(farPct * 100).toFixed(1)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{(farPct * 100).toFixed(0)}% built out</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Air Rights Remaining"
                  value={airRightsSqft !== null ? formatNum(Math.round(airRightsSqft), 'sq ft') : '—'}
                  highlight={hasAirRights}
                />
                <StatBox label="Lot Area" value={formatNum(lotArea, 'sq ft')} />
                <StatBox label="Max Residential FAR" value={maxResiFar > 0 ? maxResiFar.toFixed(2) : '—'} />
                <StatBox label="Max Commercial FAR" value={maxCommFar > 0 ? maxCommFar.toFixed(2) : '—'} />
                {maxFacilFar > 0 && (
                  <StatBox label="Max Community Facility FAR" value={maxFacilFar.toFixed(2)} />
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400 py-4">FAR data not available for this parcel.</div>
          )}
        </div>

        {/* Property details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Property Details</p>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Year Built" value={p.yearbuilt && p.yearbuilt !== '0' ? p.yearbuilt : '—'} />
            <StatBox label="Last Altered" value={p.yearalter1 && p.yearalter1 !== '0' ? p.yearalter1 : '—'} />
            <StatBox label="Floors" value={formatNum(p.numfloors)} />
            <StatBox label="Residential Units" value={formatNum(p.unitsres)} />
            <StatBox label="Total Units" value={formatNum(p.unitstotal)} />
            <StatBox label="Land Use" value={getLandUseDescription(p.landuse) || '—'} />
            {p.bldgclass && (
              <div className="col-span-2 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Building Class</p>
                <p className="text-sm font-semibold text-gray-800">{p.bldgclass}</p>
                <p className="text-xs text-gray-500">{getBuildingClassDescription(p.bldgclass)}</p>
              </div>
            )}
          </div>

          {/* Area breakdown */}
          {(Number(p.resarea) > 0 || Number(p.comarea) > 0 || Number(p.officearea) > 0 || Number(p.retailarea) > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Floor Area Breakdown</p>
              <div className="grid grid-cols-2 gap-2">
                {Number(p.resarea) > 0 && <AreaRow label="Residential" sqft={Number(p.resarea)} />}
                {Number(p.comarea) > 0 && <AreaRow label="Commercial" sqft={Number(p.comarea)} />}
                {Number(p.officearea) > 0 && <AreaRow label="Office" sqft={Number(p.officearea)} />}
                {Number(p.retailarea) > 0 && <AreaRow label="Retail" sqft={Number(p.retailarea)} />}
                {Number(p.garagearea) > 0 && <AreaRow label="Garage" sqft={Number(p.garagearea)} />}
                {Number(p.strgearea) > 0 && <AreaRow label="Storage" sqft={Number(p.strgearea)} />}
                {Number(p.factryarea) > 0 && <AreaRow label="Factory" sqft={Number(p.factryarea)} />}
              </div>
            </div>
          )}
        </div>

        {/* Walkability */}
        <WalkabilityCard walkability={walkability} lat={lat} lng={lng} address={geo.label || geo.name} />

        {/* Assessment & ownership */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Assessment & Ownership</p>

          {assessTot > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Assessed Land Value" value={formatCurrency(assessLand)} />
                <StatBox label="Total Assessed Value" value={formatCurrency(assessTot)} />
                {exemptTot > 0 && (
                  <StatBox label="Tax Exemption" value={formatCurrency(exemptTot)} />
                )}
                {landPerSqft && (
                  <StatBox label="Land Value / sq ft" value={`$${landPerSqft}`} />
                )}
              </div>

              {exemptTot > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                  This parcel has a tax exemption of {formatCurrency(exemptTot)} — verify with DOF if purchasing.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">Assessment data not available.</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {p.ownername && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Owner of Record</p>
                <p className="text-sm font-semibold text-gray-800">{p.ownername}</p>
                <p className="text-xs text-gray-500">{getOwnerTypeDescription(p.ownertype)}</p>
              </div>
            )}
          </div>

          {/* Lot dimensions */}
          {(p.lotfront || p.lotdepth) && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              {p.lotfront && <StatBox label="Lot Frontage" value={`${Number(p.lotfront).toFixed(0)} ft`} />}
              {p.lotdepth && <StatBox label="Lot Depth" value={`${Number(p.lotdepth).toFixed(0)} ft`} />}
              {p.bldgfront && <StatBox label="Bldg Frontage" value={`${Number(p.bldgfront).toFixed(0)} ft`} />}
              {p.bldgdepth && <StatBox label="Bldg Depth" value={`${Number(p.bldgdepth).toFixed(0)} ft`} />}
            </div>
          )}
        </div>
      </div>

      {/* Historic / landmark warning */}
      {(isHistoric || isLandmark) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">Preservation Restrictions Apply</p>
            <p className="text-sm text-red-700 mt-0.5">
              {isLandmark && <span>This parcel is an <strong>Individual NYC Landmark</strong> — exterior alterations and demolition require LPC approval. </span>}
              {isHistoric && <span>Located in the <strong>{p.histdist}</strong> historic district — any changes to the exterior require Landmarks Preservation Commission review.</span>}
            </p>
          </div>
        </div>
      )}

      {/* No PLUTO data notice */}
      {!pluto && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
          PLUTO parcel data was not found for this address. Assessment, FAR, and ownership data require a valid BBL.
        </div>
      )}

      {/* Underwriting Calculator */}
      {pluto && (
        <UnderwritingCalculator
          pluto={pluto}
          useCases={generateUseCaseAnalysis({ pluto, geo })}
        />
      )}

      {/* Raw data toggle */}
      <details className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <summary className="px-5 py-3 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-50 select-none">
          Raw Data (ZoLa + PLUTO)
        </summary>
        <div className="border-t border-gray-100">
          {zoning && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ZoLa</p>
              <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 rounded-lg p-3">
                {JSON.stringify(zoning, null, 2)}
              </pre>
            </div>
          )}
          {pluto && (
            <div className="px-5 pt-2 pb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">MapPLUTO</p>
              <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 rounded-lg p-3">
                {JSON.stringify(pluto, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  )
}

// ── Sub-components ──

function IdItem({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}: </span>
      <span className="text-xs font-semibold text-gray-700 font-mono">{value}</span>
    </div>
  )
}

function StatBox({ label, value, highlight }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
      <p className={`text-xs mb-0.5 ${highlight ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-emerald-800' : 'text-gray-800'}`}>{value || '—'}</p>
    </div>
  )
}

function AreaRow({ label, sqft }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{sqft.toLocaleString()} sq ft</span>
    </div>
  )
}

function Signal({ color, icon, children }) {
  const styles = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[color]}`}>
      <span>{icon}</span>
      {children}
    </span>
  )
}
