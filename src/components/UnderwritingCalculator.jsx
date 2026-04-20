import { useState, useMemo } from 'react'
import { runUnderwriting } from '../utils/investmentAnalysis'

const fmt  = (n, d = 0) => n == null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: d })
const fmtC = (n) => {
  if (n == null || isNaN(n)) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}
const fmtPct = (n) => n == null || isNaN(n) ? '—' : `${(n * 100).toFixed(1)}%`

function NumInput({ label, value, onChange, prefix = '$', suffix = '', step = 1, min = 0, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
        {prefix && <span className="px-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none bg-white min-w-0"
        />
        {suffix && <span className="px-2.5 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none">{suffix}</span>}
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function ResultCard({ label, value, sub, highlight, color = 'gray', large }) {
  const colors = {
    green:  'bg-emerald-50 border-emerald-200 text-emerald-800',
    red:    'bg-red-50 border-red-200 text-red-700',
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    amber:  'bg-amber-50 border-amber-200 text-amber-800',
    gray:   'bg-gray-50 border-gray-200 text-gray-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[color]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className={`font-black leading-none ${large ? 'text-3xl' : 'text-xl'}`}>{value}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  )
}

export default function UnderwritingCalculator({ pluto, useCases }) {
  const p = pluto || {}

  // Derive defaults from parcel data
  const borough = (p.borough || '').toUpperCase()
  const mult = { MN: 1.85, BK: 1.15, QN: 0.95, BX: 0.72, SI: 0.65 }[borough] || 1.0

  // Pick a use-case to seed buildable sqft and units
  const rentalUC = useCases?.find((u) => u.id === 'rental')
  const condoUC  = useCases?.find((u) => u.id === 'condo')
  const defaultBuildable = rentalUC?.buildableSqft || condoUC?.buildableSqft || Number(p.lotarea) || 10000
  const defaultUnits     = rentalUC?.units || condoUC?.units || Math.max(1, Math.floor(defaultBuildable / 800))

  const [mode, setMode]             = useState('rental')
  const [buildableSqft, setBuildable] = useState(defaultBuildable)
  const [units, setUnits]           = useState(defaultUnits)
  const [landPrice, setLandPrice]   = useState(Math.round((Number(p.assessland) || 0) * 3) || 2000000)
  const [hardCostPSF, setHardCost]  = useState(Math.round(340 * mult))
  const [softCostPct, setSoftCost]  = useState(18)
  const [demolitionCost, setDemo]   = useState(0)

  // Rental inputs
  const [rentPerUnit, setRent]      = useState(Math.round(2800 * mult))
  const [vacancyPct, setVacancy]    = useState(5)
  const [expensePct, setExpense]    = useState(38)
  const [holdYears, setHold]        = useState(5)
  const [exitCapRate, setExitCap]   = useState(4.5)

  // Sale inputs
  const [salePSF, setSalePSF]       = useState(Math.round(1100 * mult))
  const [brokerPct, setBroker]      = useState(6)

  const result = useMemo(() => runUnderwriting({
    mode, buildableSqft, units, landPrice, hardCostPSF, softCostPct, demolitionCost,
    rentPerUnit, vacancyPct, expensePct, holdYears, exitCapRate,
    salePSF, brokerPct,
  }), [mode, buildableSqft, units, landPrice, hardCostPSF, softCostPct, demolitionCost,
       rentPerUnit, vacancyPct, expensePct, holdYears, exitCapRate, salePSF, brokerPct])

  const irrPct   = result?.irr != null ? result.irr * 100 : null
  const irrColor = irrPct == null ? 'gray' : irrPct >= 18 ? 'green' : irrPct >= 12 ? 'blue' : irrPct >= 7 ? 'amber' : 'red'
  const yocColor = result == null ? 'gray' : (result.yieldOnCost || 0) >= 0.065 ? 'green' : (result.yieldOnCost || 0) >= 0.05 ? 'blue' : (result.yieldOnCost || 0) >= 0.03 ? 'amber' : 'red'
  const rlvColor = result?.rlv != null ? (result.rlv > 0 ? 'indigo' : 'red') : 'gray'
  const profitColor = result?.profitOnCost != null ? (result.profitOnCost >= 0.15 ? 'green' : result.profitOnCost >= 0.08 ? 'blue' : result.profitOnCost >= 0 ? 'amber' : 'red') : 'gray'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Underwriting Calculator</p>
        </div>
        <p className="text-sm text-gray-500">Rough feasibility — adjust inputs to match your deal.</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {[['rental', 'Rental / Multifamily'], ['sale', 'For Sale / Condo']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                mode === id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Inputs grid */}
        <div className="space-y-5">
          {/* Project size */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Project Size</p>
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Buildable Sq Ft" value={buildableSqft} onChange={setBuildable} prefix="" hint="Total GFA to be built" />
              <NumInput label="Units" value={units} onChange={setUnits} prefix="" hint={mode === 'sale' ? 'Condo units' : 'Rental units'} />
            </div>
          </div>

          {/* Costs */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Costs</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumInput
                label="Land Price"
                value={landPrice}
                onChange={setLandPrice}
                step={50000}
                hint={`$${fmt(Math.round(landPrice / (Number(p.lotarea) || 1)))}/land sqft`}
              />
              <NumInput
                label="Hard Cost ($/sqft)"
                value={hardCostPSF}
                onChange={setHardCost}
                hint={`Total: ${fmtC(hardCostPSF * buildableSqft)}`}
              />
              <NumInput
                label="Soft Cost"
                value={softCostPct}
                onChange={setSoftCost}
                prefix=""
                suffix="%"
                step={0.5}
                hint={`Total: ${fmtC((hardCostPSF * buildableSqft) * softCostPct / 100)}`}
              />
              <NumInput
                label="Demolition / Removal"
                value={demolitionCost}
                onChange={setDemo}
                step={10000}
                hint="Leave 0 if vacant lot"
              />
            </div>
            {result && (
              <div className="mt-2 bg-gray-50 rounded-lg px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
                <span>Land: <strong>{fmtC(result.landPrice)}</strong></span>
                <span>Hard: <strong>{fmtC(result.hardCost)}</strong></span>
                <span>Soft: <strong>{fmtC(result.softCost)}</strong></span>
                {result.demoCost > 0 && <span>Demo: <strong>{fmtC(result.demoCost)}</strong></span>}
                <span className="font-bold text-gray-800">TDC: {fmtC(result.tdc)}</span>
                <span className="text-gray-400">${fmt(Math.round(result.tdc / buildableSqft))}/sqft all-in</span>
              </div>
            )}
          </div>

          {/* Revenue inputs */}
          {mode === 'rental' ? (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Income & Hold</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumInput
                  label="Rent / Unit / Month"
                  value={rentPerUnit}
                  onChange={setRent}
                  hint={result ? `Gross: ${fmtC(result.grossRent)}/yr` : ''}
                />
                <NumInput label="Vacancy" value={vacancyPct} onChange={setVacancy} prefix="" suffix="%" step={0.5} />
                <NumInput label="Operating Expenses" value={expensePct} onChange={setExpense} prefix="" suffix="%" step={0.5} hint="% of EGI" />
                <NumInput label="Hold Period" value={holdYears} onChange={setHold} prefix="" suffix="yrs" step={1} min={1} />
                <NumInput label="Exit Cap Rate" value={exitCapRate} onChange={setExitCap} prefix="" suffix="%" step={0.25} hint={result ? `Exit: ${fmtC(result.exitValue)}` : ''} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Sales Comps</p>
              <div className="grid grid-cols-2 gap-3">
                <NumInput
                  label="Sale Price ($/sqft)"
                  value={salePSF}
                  onChange={setSalePSF}
                  hint={result ? `Gross sellout: ${fmtC(result.grossRevenue)}` : ''}
                />
                <NumInput
                  label="Broker + Transfer Tax"
                  value={brokerPct}
                  onChange={setBroker}
                  prefix=""
                  suffix="%"
                  step={0.5}
                  hint={result ? `Net proceeds: ${fmtC(result.netRevenue)}` : ''}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Returns</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* IRR */}
              <ResultCard
                label="Unlevered IRR"
                value={irrPct != null ? `${irrPct.toFixed(1)}%` : '—'}
                sub={result.em != null ? `${result.em.toFixed(2)}x equity multiple` : null}
                color={irrColor}
                large
              />

              {/* Yield on Cost (rental) / Profit Margin (sale) */}
              {mode === 'rental' ? (
                <ResultCard
                  label="Yield on Cost"
                  value={fmtPct(result.yieldOnCost)}
                  sub={`NOI: ${fmtC(result.noi)}/yr`}
                  color={yocColor}
                  large
                />
              ) : (
                <ResultCard
                  label="Profit on Cost"
                  value={fmtPct(result.profitOnCost)}
                  sub={`Profit: ${fmtC(result.profit)}`}
                  color={profitColor}
                  large
                />
              )}

              {/* Residual Land Value */}
              <ResultCard
                label="Residual Land Value"
                value={fmtC(result.rlv)}
                sub={result.rlvPSF != null ? `$${fmt(Math.round(result.rlvPSF))}/buildable sqft · ${mode === 'rental' ? '6% YoC target' : '15% profit target'}` : null}
                color={rlvColor}
              />

              {/* Land vs RLV comparison */}
              {result.rlv != null && landPrice > 0 && (
                <ResultCard
                  label="Land Basis vs RLV"
                  value={result.rlv >= landPrice ? 'Pencils In' : 'Overpaying'}
                  sub={result.rlv >= landPrice
                    ? `RLV supports ${fmtC(result.rlv - landPrice)} of cushion`
                    : `Land is ${fmtC(landPrice - result.rlv)} above RLV`}
                  color={result.rlv >= landPrice ? 'green' : 'red'}
                />
              )}
            </div>

            {/* NOI / Revenue detail row */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
              {mode === 'rental' ? (
                <>
                  <Detail label="Gross Rent" value={fmtC(result.grossRent) + '/yr'} />
                  <Detail label="EGI" value={fmtC(result.egi) + '/yr'} />
                  <Detail label="NOI" value={fmtC(result.noi) + '/yr'} />
                  <Detail label="Exit Value" value={fmtC(result.exitValue)} />
                </>
              ) : (
                <>
                  <Detail label="Gross Sellout" value={fmtC(result.grossRevenue)} />
                  <Detail label="Net Proceeds" value={fmtC(result.netRevenue)} />
                  <Detail label="Total Dev Cost" value={fmtC(result.tdc)} />
                  <Detail label="Developer Profit" value={fmtC(result.profit)} />
                </>
              )}
            </div>

            {/* Benchmark guide */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Typical NYC thresholds (unlevered, ground-up)</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 sm:grid-cols-4 mt-1">
                <span>IRR ≥ 18% → Strong</span>
                <span>IRR 12–18% → Acceptable</span>
                <span>YoC ≥ 6.5% → Pencils in</span>
                <span>Profit on cost ≥ 15% → Target</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Simplified pro-forma. Assumes all equity in at start, 2-year construction, no leverage. RLV uses a target return hurdle. Not a substitute for a full financial model or professional advice.
        </p>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}: </span>
      <span className="text-gray-800 font-semibold text-xs">{value}</span>
    </div>
  )
}
