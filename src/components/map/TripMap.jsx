import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

const JAPAN_CENTER = [36.2048, 138.2529]
const JAPAN_ZOOM = 6

// GeoJSON stores [longitude, latitude] — Leaflet requires [latitude, longitude]
function toLeaflet(coords) {
  return [coords[1], coords[0]]
}

// Day color map — city-based grouping using project palette
const DAY_COLORS = {
  2: '#C73E3A', // Fukuoka — Torii red
  3: '#C73E3A',
  4: '#2B4C7E', // Osaka — link blue
  5: '#2B4C7E',
  6: '#8B8680', // Kyoto — muted
  7: '#8B8680',
  8: '#1A1A1A', // Tokyo — ink
  9: '#1A1A1A',
  10: '#1A1A1A',
}

function createDayIcon(dayNum) {
  const color = DAY_COLORS[dayNum] || '#1A1A1A'
  return divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  })
}

// Child component: fits map bounds to all visible locations on mount
function BoundsFitter({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates.length < 2) return
    map.fitBounds(coordinates.map(toLeaflet), { padding: [40, 40] })
  }, [map]) // run once on mount only
  return null
}

export default function TripMap({ days, visibleDays }) {
  const daysWithLocations = days.filter(d =>
    d.activities.some(a => a.location)
  )
  const allCoordinates = daysWithLocations.flatMap(d =>
    d.activities.filter(a => a.location).map(a => a.location.coordinates)
  )

  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={JAPAN_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsFitter coordinates={allCoordinates} />
      {daysWithLocations.map(day =>
        visibleDays.has(day.day_number) && (
          <LayerGroup key={day.day_number}>
            {day.activities
              .filter(a => a.location)
              .map(activity => (
                <Marker
                  key={activity.id}
                  position={toLeaflet(activity.location.coordinates)}
                  icon={createDayIcon(day.day_number)}
                >
                  <Popup>
                    <strong>{activity.name}</strong>
                    <br />
                    <span style={{ color: '#8B8680', fontSize: '0.875rem' }}>
                      {activity.location.name}
                    </span>
                    {activity.location.address && (
                      <>
                        <br />
                        <span style={{ color: '#8B8680', fontSize: '0.75rem' }}>
                          {activity.location.address}
                        </span>
                      </>
                    )}
                  </Popup>
                </Marker>
              ))}
          </LayerGroup>
        )
      )}
    </MapContainer>
  )
}
