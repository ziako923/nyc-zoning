// NYC Zoning district reference data

const RESIDENTIAL_DISTRICTS = [
  {
    code: 'R1',
    name: 'Low-Density Residential',
    description: 'Single-family detached homes on large lots. Very low density, suburban character.',
    examples: 'Staten Island suburbs, parts of eastern Queens',
    details: [
      { label: 'FAR', value: '0.5' },
      { label: 'Max Height', value: '35 ft' },
      { label: 'Use', value: 'Single-family only' },
      { label: 'Min Lot', value: '9,500 sq ft' },
    ],
  },
  {
    code: 'R2',
    name: 'Low-Density Residential',
    description: 'Single-family detached homes. Similar to R1 with slightly smaller lots allowed.',
    examples: 'Flatbush, Bay Ridge, Flushing',
    details: [
      { label: 'FAR', value: '0.5' },
      { label: 'Max Height', value: '35 ft' },
      { label: 'Use', value: 'Single-family only' },
      { label: 'Min Lot', value: '3,800 sq ft' },
    ],
  },
  {
    code: 'R3',
    name: 'Low-Density Residential',
    description: 'Single- and two-family homes. Allows attached houses and small apartment buildings in R3A/R3X variants.',
    examples: 'Woodside, Ozone Park',
    details: [
      { label: 'FAR', value: '0.5' },
      { label: 'Max Height', value: '35 ft' },
      { label: 'Use', value: '1–2 family' },
      { label: 'Min Lot', value: '1,700 sq ft' },
    ],
  },
  {
    code: 'R4',
    name: 'Low-Medium Residential',
    description: 'Allows rowhouses, small apartment buildings. Transition zone between low and mid-density.',
    examples: 'Sunnyside, Jackson Heights, Crown Heights',
    details: [
      { label: 'FAR', value: '0.75–0.9' },
      { label: 'Max Height', value: '35 ft' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: '1,700 sq ft' },
    ],
  },
  {
    code: 'R5',
    name: 'Medium Residential',
    description: 'Walk-up apartments and rowhouses up to 4 stories. Common in outer-borough neighborhoods.',
    examples: 'Ridgewood, Flatbush, Astoria',
    details: [
      { label: 'FAR', value: '1.25' },
      { label: 'Max Height', value: '40 ft' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
  {
    code: 'R6',
    name: 'Medium-High Residential',
    description: 'Six- to seven-story apartment buildings. Very common in Brooklyn and Queens neighborhoods.',
    examples: 'Park Slope, Prospect Heights, Forest Hills',
    details: [
      { label: 'FAR', value: '2.43–3.0' },
      { label: 'Max Height', value: 'Sky Exposure' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
  {
    code: 'R7',
    name: 'High Residential',
    description: 'High-density residential allowing mid-rise and high-rise apartment buildings.',
    examples: 'Upper Manhattan, Flushing, South Bronx',
    details: [
      { label: 'FAR', value: '3.44–4.0' },
      { label: 'Max Height', value: 'Sky Exposure' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
  {
    code: 'R8',
    name: 'High-Density Residential',
    description: 'High-density residential allowing tall apartment towers.',
    examples: 'Upper West Side, Harlem, Long Island City',
    details: [
      { label: 'FAR', value: '6.02' },
      { label: 'Max Height', value: 'Sky Exposure' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
  {
    code: 'R9',
    name: 'High-Density Residential',
    description: 'Very high-density. Allows towers with large floor plates.',
    examples: 'Parts of Manhattan and Long Island City',
    details: [
      { label: 'FAR', value: '7.52' },
      { label: 'Max Height', value: 'Sky Exposure' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
  {
    code: 'R10',
    name: 'Highest Density Residential',
    description: 'The highest residential density. Allows the largest residential towers.',
    examples: 'Midtown East, Hudson Yards',
    details: [
      { label: 'FAR', value: '10.0' },
      { label: 'Max Height', value: 'Sky Exposure' },
      { label: 'Use', value: 'Multi-family' },
      { label: 'Min Lot', value: 'None' },
    ],
  },
]

const COMMERCIAL_DISTRICTS = [
  {
    code: 'C1',
    name: 'Local Retail',
    description: 'Local retail and service uses serving adjacent residential neighborhoods. Usually applied as overlays.',
    examples: 'Neighborhood strips, corner stores',
    details: [
      { label: 'FAR', value: '1.0' },
      { label: 'Typical Uses', value: 'Retail, services' },
      { label: 'Residential', value: 'Permitted' },
      { label: 'Note', value: 'Often overlay' },
    ],
  },
  {
    code: 'C2',
    name: 'Local Service',
    description: 'Wider range of local services including repair shops and funeral homes. Often used as overlay zones.',
    examples: 'Neighborhood commercial strips',
    details: [
      { label: 'FAR', value: '2.0' },
      { label: 'Typical Uses', value: 'Retail, repair, services' },
      { label: 'Residential', value: 'Permitted' },
      { label: 'Note', value: 'Often overlay' },
    ],
  },
  {
    code: 'C4',
    name: 'General Commercial',
    description: 'Major shopping centers, offices, and entertainment. Regional commercial hubs.',
    examples: 'Jamaica Center, Bay Plaza',
    details: [
      { label: 'FAR', value: '1.0–3.4' },
      { label: 'Typical Uses', value: 'Retail, office, hotel' },
      { label: 'Residential', value: 'Permitted' },
      { label: 'Max Height', value: 'Varies' },
    ],
  },
  {
    code: 'C5',
    name: 'Restricted Central Commercial',
    description: 'Major office and luxury retail in high-density central business districts.',
    examples: 'Lower Manhattan, parts of Midtown',
    details: [
      { label: 'FAR', value: 'up to 15' },
      { label: 'Typical Uses', value: 'Office, retail, hotel' },
      { label: 'Residential', value: 'Permitted' },
      { label: 'Max Height', value: 'Sky Exposure' },
    ],
  },
  {
    code: 'C6',
    name: 'Central Commercial',
    description: 'Wide range of high-density commercial uses. Core of Manhattan central business district.',
    examples: 'Midtown Manhattan, Downtown Brooklyn',
    details: [
      { label: 'FAR', value: 'up to 15' },
      { label: 'Typical Uses', value: 'Office, retail, hotel' },
      { label: 'Residential', value: 'Permitted' },
      { label: 'Max Height', value: 'Sky Exposure' },
    ],
  },
  {
    code: 'C8',
    name: 'General Service',
    description: 'Auto-related uses, heavy retail, warehouses — commercial uses incompatible with residential areas.',
    examples: 'Auto row districts, service corridors',
    details: [
      { label: 'FAR', value: '2.0' },
      { label: 'Typical Uses', value: 'Auto, warehouse, heavy retail' },
      { label: 'Residential', value: 'Not permitted' },
      { label: 'Max Height', value: 'Varies' },
    ],
  },
]

const MANUFACTURING_DISTRICTS = [
  {
    code: 'M1',
    name: 'Light Manufacturing',
    description: 'Light industrial uses with performance standards. Often adjacent to residential. Allows some commercial uses.',
    examples: 'Bush Terminal, Long Island City, Maspeth',
    details: [
      { label: 'FAR', value: '1.0–2.0' },
      { label: 'Typical Uses', value: 'Light industrial, warehouse' },
      { label: 'Residential', value: 'Not permitted' },
      { label: 'Note', value: 'Commercial permitted' },
    ],
  },
  {
    code: 'M2',
    name: 'Medium Manufacturing',
    description: 'Medium industrial uses. Allows more intensive operations than M1 with greater buffer from residential.',
    examples: 'Red Hook, Greenpoint, South Bronx',
    details: [
      { label: 'FAR', value: '2.0' },
      { label: 'Typical Uses', value: 'Manufacturing, storage' },
      { label: 'Residential', value: 'Not permitted' },
      { label: 'Note', value: 'Limited commercial' },
    ],
  },
  {
    code: 'M3',
    name: 'Heavy Manufacturing',
    description: 'Heavy industrial uses including power plants, recycling facilities, and other intensive operations.',
    examples: 'Hunts Point, Fresh Kills area',
    details: [
      { label: 'FAR', value: '2.0' },
      { label: 'Typical Uses', value: 'Heavy industry, utilities' },
      { label: 'Residential', value: 'Not permitted' },
      { label: 'Note', value: 'No commercial' },
    ],
  },
]

// Color themes per district prefix
const ZONE_COLORS = {
  R: 'bg-amber-50 border-amber-200 text-amber-900',
  C: 'bg-blue-50 border-blue-200 text-blue-900',
  M: 'bg-purple-50 border-purple-200 text-purple-900',
}

export function getZoneInfo(district) {
  if (!district) return null
  const prefix = district.charAt(0).toUpperCase()
  const baseCode = district.replace(/[^A-Z0-9]/gi, '').replace(/[A-Z]$/, '') // strip trailing letter variant

  const all = [...RESIDENTIAL_DISTRICTS, ...COMMERCIAL_DISTRICTS, ...MANUFACTURING_DISTRICTS]
  const match = all.find((d) => {
    const dc = d.code.toUpperCase()
    const input = district.toUpperCase()
    return input.startsWith(dc) || dc === input
  })

  if (!match) {
    // Generic fallback
    const category =
      prefix === 'R' ? 'Residential' : prefix === 'C' ? 'Commercial' : prefix === 'M' ? 'Manufacturing' : 'Unknown'
    return {
      category,
      name: `${category} District`,
      description: `Zone ${district} — refer to the NYC Zoning Resolution for specifics.`,
      color: ZONE_COLORS[prefix] || 'bg-gray-50 border-gray-200 text-gray-900',
      details: [],
    }
  }

  const category =
    prefix === 'R' ? 'Residential' : prefix === 'C' ? 'Commercial' : 'Manufacturing'

  return {
    ...match,
    category,
    color: ZONE_COLORS[prefix] || 'bg-gray-50 border-gray-200 text-gray-900',
  }
}

export const ZONE_CATEGORIES = [
  {
    category: 'Residential (R)',
    summary: 'Control the type and density of housing, from single-family homes to high-rise towers.',
    headerColor: 'bg-amber-50 border border-amber-200 text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800',
    districts: RESIDENTIAL_DISTRICTS,
  },
  {
    category: 'Commercial (C)',
    summary: 'Allow retail, offices, hotels, and mixed-use development at varying scales.',
    headerColor: 'bg-blue-50 border border-blue-200 text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800',
    districts: COMMERCIAL_DISTRICTS,
  },
  {
    category: 'Manufacturing (M)',
    summary: 'Industrial zones from light to heavy manufacturing, protecting industrial jobs and land.',
    headerColor: 'bg-purple-50 border border-purple-200 text-purple-900',
    badgeColor: 'bg-purple-100 text-purple-800',
    districts: MANUFACTURING_DISTRICTS,
  },
]
