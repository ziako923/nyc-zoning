// Rule-based investment analysis engine using PLUTO + zoning data

// ── Use-case breakdown ──────────────────────────────────────────────────────

export function generateUseCaseAnalysis({ pluto: p, geo }) {
  if (!p) return null

  const lotArea     = Number(p.lotarea)  || 0
  const builtFar    = Number(p.builtfar) || 0
  const maxResiFar  = Number(p.residfar) || 0
  const maxCommFar  = Number(p.commfar)  || 0
  const isVacant    = p.landuse === '11'
  const isLandmark  = !!(p.landmark && p.landmark.trim())
  const isHistoric  = !!(p.histdist  && p.histdist.trim())
  const isMfg       = (p.zonedist1 || '').toUpperCase().startsWith('M')
  const borough     = (p.borough || geo?.borough || '').toUpperCase()

  if (lotArea === 0 || (maxResiFar === 0 && maxCommFar === 0)) return null

  // Borough price multipliers (relative to NYC baseline)
  const mult = { MN: 1.85, BK: 1.15, QN: 0.95, BX: 0.72, SI: 0.65 }[borough] || 1.0

  // Base market rates
  const CONDO_PSF   = Math.round(1100 * mult)
  const RENTAL_RENT = Math.round(3000 * mult)
  const OFFICE_PSF  = Math.round(480  * mult)
  const RETAIL_PSF  = Math.round(380  * mult)
  const HOTEL_KEY   = Math.round(370000 * mult)

  // Full redevelopment potential (as-of-right if built from scratch)
  const fullResi = maxResiFar > 0 ? Math.round(maxResiFar * lotArea) : 0
  const fullComm = maxCommFar > 0 ? Math.round(maxCommFar * lotArea) : 0

  // Remaining air rights (what can be added without demolition)
  const airRightsResi = maxResiFar > 0 ? Math.max(0, Math.round((maxResiFar - builtFar) * lotArea)) : 0
  const airRightsComm = maxCommFar > 0 ? Math.max(0, Math.round((maxCommFar - builtFar) * lotArea)) : 0

  // Label helper: tell the user whether these are air rights or full redevelopment numbers
  const resiLabel = airRightsResi > 500 ? `${(airRightsResi/1000).toFixed(1)}K sq ft air rights` : `${(fullResi/1000).toFixed(1)}K sq ft (full redevelop)`
  const commLabel = airRightsComm > 500 ? `${(airRightsComm/1000).toFixed(1)}K sq ft air rights` : `${(fullComm/1000).toFixed(1)}K sq ft (full redevelop)`
  const resiBuildable = airRightsResi > 500 ? airRightsResi : fullResi
  const commBuildable = airRightsComm > 500 ? airRightsComm : fullComm

  const uses = []

  // ── Residential Condo ──
  if (maxResiFar > 0 && fullResi > 0 && !isMfg) {
    const buildable = resiBuildable
    const units     = Math.max(1, Math.floor(buildable / 850))
    uses.push({
      id: 'condo',
      label: 'Residential Condo',
      color: 'blue',
      far: maxResiFar,
      buildableSqft: buildable,
      buildableLabel: resiLabel,
      units,
      unitLabel: 'units',
      impliedValue: buildable * CONDO_PSF,
      valueLabel: 'Est. Gross Sellout',
      assumptions: `~850 sq ft avg unit · $${CONDO_PSF.toLocaleString()}/sq ft`,
      feasible: buildable >= 3000,
      warning: isLandmark ? 'Landmark — exterior changes restricted' : isHistoric ? 'Historic district — LPC review required' : null,
    })
  }

  // ── Multifamily Rental ──
  if (maxResiFar > 0 && fullResi > 0 && !isMfg) {
    const buildable    = resiBuildable
    const units        = Math.max(1, Math.floor(buildable / 750))
    const annualNOI    = units * RENTAL_RENT * 12 * 0.48
    const impliedValue = Math.round(annualNOI / 0.045)
    uses.push({
      id: 'rental',
      label: 'Multifamily Rental',
      color: 'emerald',
      far: maxResiFar,
      buildableSqft: buildable,
      buildableLabel: resiLabel,
      units,
      unitLabel: 'units',
      impliedValue,
      valueLabel: 'Implied Value (4.5% cap)',
      assumptions: `~750 sq ft avg · $${RENTAL_RENT.toLocaleString()}/unit/mo · 48% NOI`,
      feasible: buildable >= 3000,
      warning: null,
    })
  }

  // ── Commercial / Office ──
  if (maxCommFar > 0 && fullComm > 0) {
    const buildable = commBuildable
    uses.push({
      id: 'office',
      label: 'Commercial / Office',
      color: 'violet',
      far: maxCommFar,
      buildableSqft: buildable,
      buildableLabel: commLabel,
      units: null,
      unitLabel: null,
      impliedValue: buildable * OFFICE_PSF,
      valueLabel: 'Implied Value',
      assumptions: `$${OFFICE_PSF.toLocaleString()}/sq ft est. · subject to market vacancy`,
      feasible: buildable >= 5000,
      warning: isMfg ? 'Manufacturing zone — residential not permitted' : null,
    })
  }

  // ── Hotel ──
  if (maxCommFar > 0 && fullComm > 0) {
    const buildable = commBuildable
    const keys      = Math.max(1, Math.floor(buildable / 420))
    uses.push({
      id: 'hotel',
      label: 'Hotel',
      color: 'amber',
      far: maxCommFar,
      buildableSqft: buildable,
      buildableLabel: commLabel,
      units: keys,
      unitLabel: 'keys',
      impliedValue: keys * HOTEL_KEY,
      valueLabel: 'Implied Value',
      assumptions: `~420 sq ft/key · $${Math.round(HOTEL_KEY / 1000)}K/key est.`,
      feasible: buildable >= 8000 && keys >= 20,
      warning: null,
    })
  }

  // ── Mixed-Use ──
  if (maxResiFar > 0 && maxCommFar > 0 && !isMfg) {
    const buildable = Math.max(resiBuildable, commBuildable)
    const resiSqft  = Math.round(buildable * 0.80)
    const commSqft  = Math.round(buildable * 0.20)
    const units     = Math.max(1, Math.floor(resiSqft / 800))
    uses.push({
      id: 'mixed',
      label: 'Mixed-Use',
      color: 'indigo',
      far: Math.max(maxResiFar, maxCommFar),
      buildableSqft: buildable,
      buildableLabel: `${(buildable/1000).toFixed(1)}K sq ft total`,
      units,
      unitLabel: 'resi units',
      impliedValue: resiSqft * CONDO_PSF + commSqft * RETAIL_PSF,
      valueLabel: 'Blended Implied Value',
      assumptions: `80% resi (${resiSqft.toLocaleString()} sq ft) · 20% retail (${commSqft.toLocaleString()} sq ft)`,
      feasible: buildable >= 5000,
      warning: null,
    })
  }

  return uses.length > 0 ? uses : null
}

export function analyzeParcel({ pluto: p, geo, district }) {
  if (!p) return null

  const lotArea = Number(p.lotarea) || 0
  const bldgArea = Number(p.bldgarea) || 0
  const builtFar = Number(p.builtfar) || 0
  const maxResiFar = Number(p.residfar) || 0
  const maxCommFar = Number(p.commfar) || 0
  const maxFacilFar = Number(p.facilfar) || 0
  const maxFar = Math.max(maxResiFar, maxCommFar, maxFacilFar)
  const airRights = maxFar > 0 && lotArea > 0 ? Math.max(0, (maxFar - builtFar) * lotArea) : 0
  const farUtilization = maxFar > 0 ? builtFar / maxFar : null
  const yearBuilt = Number(p.yearbuilt) || 0
  const numFloors = Number(p.numfloors) || 0
  const unitsRes = Number(p.unitsres) || 0
  const assessLand = Number(p.assessland) || 0
  const assessTot = Number(p.assesstot) || 0
  const exemptTot = Number(p.exempttot) || 0
  const landUse = p.landuse || ''
  const isVacant = landUse === '11'
  const isLandmark = !!(p.landmark && p.landmark.trim())
  const isHistoric = !!(p.histdist && p.histdist.trim())
  const hasOverlay = !!(p.overlay1 && p.overlay1.trim())
  const hasSpecialDist = !!(p.spdist1 && p.spdist1.trim())
  const ownerType = (p.ownertype || '').toUpperCase()
  const isCityOwned = ownerType === 'C' || ownerType === 'O' || ownerType === 'X'
  const bldgClass = (p.bldgclass || '').toUpperCase()
  const prefix = district ? district.charAt(0).toUpperCase() : ''
  const isResZone = prefix === 'R'
  const isCommZone = prefix === 'C'
  const isMfgZone = prefix === 'M'
  const age = yearBuilt > 0 ? new Date().getFullYear() - yearBuilt : null

  // ── Score factors ──
  const flags = [] // { type: 'positive'|'caution'|'negative', text }
  let score = 50 // 0–100

  // Vacancy
  if (isVacant) {
    score += 20
    flags.push({ type: 'positive', text: 'Vacant lot — no demo costs, immediate entitlement path.' })
  }

  // Air rights
  if (airRights > 50000) {
    score += 20
    flags.push({ type: 'positive', text: `Significant air rights: ~${Math.round(airRights / 1000)}K sq ft of unused FAR. Major value-add or ground-up potential.` })
  } else if (airRights > 15000) {
    score += 12
    flags.push({ type: 'positive', text: `~${Math.round(airRights / 1000)}K sq ft of air rights remaining — room for vertical expansion or addition.` })
  } else if (airRights > 5000) {
    score += 6
    flags.push({ type: 'positive', text: `Modest air rights (~${Math.round(airRights / 1000)}K sq ft) — limited but may support a floor addition.` })
  } else if (farUtilization !== null && farUtilization > 0.95) {
    score -= 8
    flags.push({ type: 'caution', text: 'Site is essentially built to its FAR limit — no meaningful development upside without a rezoning.' })
  }

  // Lot size
  if (lotArea > 20000) {
    score += 10
    flags.push({ type: 'positive', text: `Large lot (${lotArea.toLocaleString()} sq ft) — scale economics favor ground-up development.` })
  } else if (lotArea < 2000) {
    score -= 5
    flags.push({ type: 'caution', text: 'Small lot — limited scale and potentially high per-unit land cost.' })
  }

  // Age & condition signal
  if (age !== null && age > 80 && !isVacant) {
    score += 8
    flags.push({ type: 'positive', text: `Building is ${age} years old (built ${yearBuilt}) — aging stock may be a teardown or major renovation candidate, creating value-add opportunity.` })
  } else if (age !== null && age < 15 && !isVacant) {
    score -= 5
    flags.push({ type: 'caution', text: `Building is relatively new (built ${yearBuilt}) — seller likely to price in current improvements; limited repositioning upside.` })
  }

  // Zoning flexibility
  if (hasOverlay) {
    score += 8
    flags.push({ type: 'positive', text: `Commercial overlay (${p.overlay1}) allows ground-floor retail, supporting mixed-use development and improving NOI.` })
  }
  if (hasSpecialDist) {
    score += 3
    flags.push({ type: 'caution', text: `Located in ${p.spdist1} special district — review DCP special district regulations; may offer bonuses or impose additional requirements.` })
  }

  // High-density residential zone
  if (isResZone && district) {
    const rNum = parseInt(district.replace(/\D/g, '')) || 0
    if (rNum >= 7) {
      score += 10
      flags.push({ type: 'positive', text: `High-density residential zone (${district}) — favorable for larger multifamily development with strong rents.` })
    } else if (rNum <= 3) {
      score -= 5
      flags.push({ type: 'caution', text: `Low-density zone (${district}) — density is limited; best suited for 1–2 family or small multifamily.` })
    }
  }

  // Commercial zone
  if (isCommZone && (district === 'C5' || district === 'C6' || (district || '').startsWith('C6'))) {
    score += 12
    flags.push({ type: 'positive', text: `Central commercial zone (${district}) — high allowable FAR, flexible uses including office, hotel, and residential.` })
  }

  // Manufacturing zone (opportunity or lock-in)
  if (isMfgZone) {
    score -= 5
    flags.push({ type: 'caution', text: `Manufacturing zone (${district}) — residential use is prohibited as-of-right. Upside exists if area is on a rezoning watch list, but speculative.` })
  }

  // Constraints
  if (isLandmark) {
    score -= 25
    flags.push({ type: 'negative', text: 'Individual NYC Landmark — demolition is not permitted. Exterior alterations require LPC approval. Significantly constrains development options and adds cost.' })
  }
  if (isHistoric) {
    score -= 12
    flags.push({ type: 'negative', text: `Located in the ${p.histdist} historic district — exterior work requires LPC review. Increases timeline and construction cost; constrains facade changes.` })
  }

  // Ownership
  if (isCityOwned) {
    score -= 15
    flags.push({ type: 'negative', text: 'City or government-owned parcel — acquisition typically requires an RFP/RFQ process. Not directly purchasable on the open market.' })
  }

  // Tax exemption
  if (exemptTot > 0 && assessTot > 0) {
    const exemptPct = (exemptTot / assessTot) * 100
    if (exemptPct > 50) {
      score += 5
      flags.push({ type: 'caution', text: `${exemptPct.toFixed(0)}% of assessed value is exempt from taxes — likely a 421-a or J-51 benefit. Verify expiration date; tax bill will rise significantly when it burns off.` })
    }
  }

  // Mixed-use signal
  const resArea = Number(p.resarea) || 0
  const comArea = Number(p.comarea) || 0
  if (resArea > 0 && comArea > 0) {
    score += 5
    flags.push({ type: 'positive', text: 'Existing mixed-use building — diversified income streams (residential + commercial) reduce vacancy risk.' })
  }

  // ── Verdict ──
  let verdict, verdictColor, verdictSummary
  if (score >= 80) {
    verdict = 'Strong Opportunity'
    verdictColor = 'emerald'
    verdictSummary = 'Multiple positive development signals. This site warrants serious underwriting.'
  } else if (score >= 62) {
    verdict = 'Moderate Potential'
    verdictColor = 'blue'
    verdictSummary = 'Solid fundamentals with some upside. Due diligence on constraints is key.'
  } else if (score >= 45) {
    verdict = 'Situational'
    verdictColor = 'amber'
    verdictSummary = 'Mixed signals — viable depending on your strategy and basis, but not an obvious buy.'
  } else {
    verdict = 'Proceed with Caution'
    verdictColor = 'red'
    verdictSummary = 'Significant constraints present. Upside is limited or hard to access without a rezoning or variance.'
  }

  // ── Narrative paragraph ──
  const narrativeParts = []

  // Site description
  if (isVacant) {
    narrativeParts.push(`This is a vacant lot in a ${district || 'NYC'} zone`)
  } else if (bldgArea > 0) {
    narrativeParts.push(`This ${age ? `${age}-year-old` : ''} ${landUseLabel(landUse)} site in a ${district || 'NYC'} zone`)
  } else {
    narrativeParts.push(`This ${district || 'NYC'}-zoned parcel`)
  }

  // Development upside
  if (airRights > 15000) {
    narrativeParts.push(`carries roughly ${Math.round(airRights / 1000)}K sq ft of unused FAR — the most actionable value-add lever on the deal`)
  } else if (farUtilization !== null && farUtilization > 0.95) {
    narrativeParts.push(`is nearly fully built out with little remaining FAR, so upside depends on repositioning existing stock or pursuing a rezoning`)
  } else if (isVacant && maxFar > 0) {
    narrativeParts.push(`allows up to ${(maxFar * lotArea).toLocaleString()} sq ft of new development as-of-right`)
  }

  // Constraints
  if (isLandmark || isHistoric) {
    narrativeParts.push(`though preservation designations will materially affect timeline, cost, and design flexibility`)
  }

  // Zoning commentary
  if (hasOverlay && isResZone) {
    narrativeParts.push(`The commercial overlay supports a mixed-income ground-up play with retail at grade`)
  }
  if (isMfgZone) {
    narrativeParts.push(`Keep an eye on rezoning pipeline — M1 sites near transit corridors have been targets for Mandatory Inclusionary Housing upzonings`)
  }

  // Ownership note
  if (isCityOwned) {
    narrativeParts.push(`Note that city ownership means you'd be bidding through a public process, not a direct negotiation`)
  }

  const narrative = narrativeParts.join('. ').replace(/\.\./g, '.') + '.'

  return {
    verdict,
    verdictColor,
    verdictSummary,
    score: Math.min(100, Math.max(0, score)),
    narrative,
    flags,
  }
}

function landUseLabel(code) {
  const map = {
    '01': 'one-to-two-family', '02': 'walk-up multifamily', '03': 'elevator multifamily',
    '04': 'mixed-use', '05': 'commercial/office', '06': 'industrial',
    '07': 'utility', '08': 'institutional', '09': 'open space', '10': 'parking', '11': 'vacant',
  }
  return map[String(code).padStart(2, '0')] || 'mixed-use'
}

// ── Underwriting engine ─────────────────────────────────────────────────────

// Bisection IRR — robust for real estate cash flow shapes
export function calculateIRR(cashFlows) {
  let lo = -0.9999, hi = 100.0
  const npv = (r) => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0)
  if (npv(lo) * npv(hi) > 0) return null // no solution
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2
    if (Math.abs(hi - lo) < 1e-8) return mid
    npv(mid) * npv(lo) <= 0 ? (hi = mid) : (lo = mid)
  }
  return (lo + hi) / 2
}

export function runUnderwriting({
  mode,           // 'rental' | 'sale'
  buildableSqft,
  units,
  landPrice,
  hardCostPSF,
  softCostPct,    // % of hard cost
  // rental inputs
  rentPerUnit,    // $/unit/month
  vacancyPct,
  expensePct,
  holdYears,
  exitCapRate,    // %
  // sale inputs
  salePSF,
  brokerPct,      // % of gross (transfer tax + broker)
}) {
  const hardCost = hardCostPSF * buildableSqft
  const softCost = hardCost * (softCostPct / 100)
  const tdc      = landPrice + hardCost + softCost
  if (tdc <= 0 || buildableSqft <= 0) return null

  if (mode === 'rental') {
    const grossRent   = rentPerUnit * units * 12
    const egi         = grossRent * (1 - vacancyPct / 100)
    const noi         = egi * (1 - expensePct / 100)
    const yieldOnCost = tdc > 0 ? noi / tdc : 0
    const exitValue   = noi / (exitCapRate / 100)
    const totalReturn = noi * holdYears + exitValue

    // Annual cash flows: year 0 = -TDC, years 1..hold = NOI, last year += exit
    const cfs = [-tdc, ...Array.from({ length: holdYears }, (_, i) =>
      noi + (i === holdYears - 1 ? exitValue : 0)
    )]
    const irr = calculateIRR(cfs)
    const em  = totalReturn / tdc

    // Residual Land Value at target 6% yield on cost
    const rlv    = noi / 0.06 - (hardCost + softCost)
    const rlvPSF = buildableSqft > 0 ? rlv / buildableSqft : 0

    return { mode, tdc, hardCost, softCost, landPrice, grossRent, egi, noi,
             yieldOnCost, exitValue, irr, em, rlv, rlvPSF, totalReturn }
  } else {
    const grossRevenue  = salePSF * buildableSqft
    const netRevenue    = grossRevenue * (1 - brokerPct / 100)
    const profit        = netRevenue - tdc
    const profitOnCost  = tdc > 0 ? profit / tdc : 0
    const profitMargin  = netRevenue > 0 ? profit / netRevenue : 0

    // Cash flows: year 0 = -TDC, year 1 = 30% proceeds, year 2 = 70% proceeds
    const cfs = [-tdc, netRevenue * 0.30, netRevenue * 0.70]
    const irr = calculateIRR(cfs)
    const em  = netRevenue / tdc

    // RLV at 15% profit-on-cost target
    const rlv    = netRevenue / 1.15 - (hardCost + softCost)
    const rlvPSF = buildableSqft > 0 ? rlv / buildableSqft : 0

    return { mode, tdc, hardCost, softCost, landPrice, grossRevenue, netRevenue,
             profit, profitOnCost, profitMargin, irr, em, rlv, rlvPSF }
  }
}
