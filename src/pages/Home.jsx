import itinerary from '../data/itinerary.json'
import foodGuide from '../data/food-guide.json'

export default function Home() {
  const { trip } = itinerary
  const route = trip.route.join(' → ')
  const firstRestaurant = foodGuide.cities[0].restaurants[0].name

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Japan Trip Interactive Guide</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Trip Overview</h2>
        <p><strong>{trip.duration_days} days:</strong> {route}</p>
        <p><strong>Travelers:</strong> {trip.travelers.join(', ')}</p>
        <p><strong>Dates:</strong> {trip.start_date} through {trip.days[trip.days.length - 1].date}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Itinerary</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {trip.days.map(day => (
            <li key={day.day_number} style={{ marginBottom: '0.5rem' }}>
              <strong>Day {day.day_number}:</strong> {day.title} ({day.date})
              {day.travel_day && <span style={{ marginLeft: '0.5rem', color: '#666' }}>(Travel Day)</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Food Guide</h2>
        <p>{foodGuide.cities.length} cities covered with restaurant recommendations</p>
        <p><em>First stop: {firstRestaurant} in {foodGuide.cities[0].name}</em></p>
      </section>

      <footer style={{ marginTop: '3rem', color: '#666', fontSize: '0.9rem' }}>
        <p>Data loaded successfully: {trip.days.length} days, {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} activities</p>
      </footer>
    </div>
  )
}
