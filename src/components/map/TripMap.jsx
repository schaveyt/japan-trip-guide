import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { useTheme } from '../../theme/useTheme'

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

function createDayIcon(dayNum, shadow) {
  const color = DAY_COLORS[dayNum] || '#1A1A1A'
  return divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px ${shadow}"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  })
}

function createActivityIcon(shadow) {
  return divIcon({
    html: `<div style="width:10px;height:10px;border-radius:2px;background:#C73E3A;border:2px solid white;box-shadow:0 1px 4px ${shadow}"></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -7],
  })
}

function createHotelIcon(shadow) {
  return divIcon({
    html: `<div style="width:16px;height:16px;background:#0F766E;border:2px solid white;box-shadow:0 1px 4px ${shadow};display:flex;align-items:center;justify-content:center;"><svg width="10" height="10" viewBox="0 0 10 10" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M5 1L9 5H7V9H3V5H1Z"/></svg></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })
}

// Child component: fits map bounds to all visible locations on mount
function BoundsFitter({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates.length < 2) return
    map.fitBounds(coordinates.map(toLeaflet), { padding: [40, 40] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]) // intentional: fit once on mount, ignore subsequent coordinate changes
  return null
}

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

export default function TripMap({ days, visibleDays, activityEntries = [], showActivities = false, hotels = [], showHotels = false }) {
  const { resolvedTheme } = useTheme()
  const shadow = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)'

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
        key={resolvedTheme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILE_URLS[resolvedTheme]}
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
                  icon={createDayIcon(day.day_number, shadow)}
                >
                  <Popup>
                    <strong>{activity.name}</strong>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                      {activity.location.name}
                    </span>
                    {activity.location.address && (
                      <>
                        <br />
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
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
      {showActivities && activityEntries.length > 0 && (
        <LayerGroup key="activities">
          {activityEntries.map(entry => (
            <Marker
              key={entry.id}
              position={toLeaflet(entry.location.coordinates)}
              icon={createActivityIcon(shadow)}
            >
              <Popup>
                <strong>{entry.name}</strong>
                <br />
                <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  {entry.location.name}
                </span>
                {entry.location.address && (
                  <>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
                      {entry.location.address}
                    </span>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}
      {showHotels && hotels.length > 0 && (
        <LayerGroup key="hotels">
          {hotels.map(hotel => (
            <Marker
              key={hotel.id}
              position={toLeaflet(hotel.location.coordinates)}
              icon={createHotelIcon(shadow)}
            >
              <Popup>
                <strong>{hotel.name}</strong>
                <br />
                <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  {hotel.city}
                </span>
                <br />
                <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
                  {hotel.location.address}
                </span>
                <br />
                <span style={{ fontSize: '0.75rem' }}>
                  Check-in {hotel.check_in} → Check-out {hotel.check_out}
                </span>
                <br />
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  Conf# {hotel.confirmation_number}
                </span>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}
    </MapContainer>
  )
}
