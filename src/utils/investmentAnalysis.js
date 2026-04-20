// Rule-based investment analysis engine using PLUTO + zoning data

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
