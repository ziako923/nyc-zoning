import { useEffect, useRef } from 'react'

export default function SiteMap({ lat, lng, address }) {
  const mapRef    = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Clean up previous instance if address changed
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
      if (!mapRef.current) return

      // Fix default marker icon path issue with bundlers
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Red pin marker
      const redIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:24px;height:36px;
          background:#e53e3e;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
      })

      L.marker([lat, lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<strong style="font-size:12px">${address}</strong>`, { maxWidth: 220 })
        .openPopup()

      instanceRef.current = map
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [lat, lng, address])

  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Map container */}
      <div className="relative" style={{ height: '340px' }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Street View thumbnail — bottom-left overlay */}
        <a
          href={streetViewUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 left-3 z-[1000] group"
          title="Open Street View"
        >
          <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-200 relative">
            <img
              src={`https://maps.googleapis.com/maps/api/streetview?size=256x160&location=${lat},${lng}&fov=90&key=`}
              alt="Street View"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if no API key — show a styled placeholder
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="absolute inset-0 hidden items-center justify-center bg-gray-800 flex-col gap-1">
              <svg className="w-6 h-6 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <span className="text-white text-[10px] font-semibold opacity-80">Street View</span>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-semibold text-center py-0.5">
              Street View
            </div>
          </div>
        </a>

        {/* Google Maps link — top right */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 border border-gray-200"
        >
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Google Maps
        </a>
      </div>
    </div>
  )
}
