import { useState, useEffect } from 'react'
import './App.css'

const cars = [
  { id: 1, name: 'Tesla Model S', category: 'Electric', price: 89, seats: 5, transmission: 'Auto', image: '🚗', color: '#C8102E', tag: 'Most Popular' },
  { id: 2, name: 'BMW M4', category: 'Sport', price: 129, seats: 4, transmission: 'Manual', image: '🏎️', color: '#0066CC', tag: 'Premium' },
  { id: 3, name: 'Range Rover Sport', category: 'SUV', price: 149, seats: 7, transmission: 'Auto', image: '🚙', color: '#1A5C38', tag: 'Family Pick' },
  { id: 4, name: 'Porsche 911', category: 'Sport', price: 199, seats: 2, transmission: 'Auto', image: '🏎️', color: '#E8A000', tag: 'Luxury' },
  { id: 5, name: 'Mercedes V-Class', category: 'Van', price: 109, seats: 8, transmission: 'Auto', image: '🚐', color: '#6B6B6B', tag: 'Group Travel' },
  { id: 6, name: 'Audi e-tron GT', category: 'Electric', price: 159, seats: 5, transmission: 'Auto', image: '⚡', color: '#BB0A21', tag: 'Eco Choice' },
]

const categories = ['All', 'Electric', 'Sport', 'SUV', 'Van']

const stats = [
  { value: '12K+', label: 'Happy Clients' },
  { value: '340+', label: 'Fleet Vehicles' },
  { value: '28', label: 'City Locations' },
  { value: '4.9★', label: 'Average Rating' },
]

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [location, setLocation] = useState('')
  const [heroVisible, setHeroVisible] = useState(false)
  const [bookedCar, setBookedCar] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const filtered = activeCategory === 'All' ? cars : cars.filter(c => c.category === activeCategory)

  return (
    <div className="app">

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="logo-mark">V</span>
            <span className="logo-text">VELOCE</span>
          </a>
          <ul className="nav-links">
            <li><a href="#fleet">Fleet</a></li>
            <li><a href="#why">Why Us</a></li>
            <li><a href="#locations">Locations</a></li>
          </ul>
          <a href="#book" className="nav-cta">Book Now</a>
        </div>
      </nav>

      {/* HERO */}
      <section className={`hero ${heroVisible ? 'visible' : ''}`}>
        <div className="hero-bg">
          <div className="hero-stripe s1" />
          <div className="hero-stripe s2" />
          <div className="hero-stripe s3" />
          <div className="hero-orb o1" />
          <div className="hero-orb o2" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Premium Car Rental</div>
          <h1 className="hero-heading">
            Drive<br />
            <span className="hero-accent">Without</span><br />
            Limits.
          </h1>
          <p className="hero-sub">
            From city cruisers to weekend warriors — every journey starts here.
          </p>
        </div>
        <div className="hero-visual">
          <div className="car-showcase">
            <div className="showcase-glow" />
            <span className="showcase-emoji">🏎️</span>
            <div className="showcase-shadow" />
          </div>
        </div>

        {/* BOOKING BAR */}
        <div className="booking-bar" id="book">
          <div className="booking-field">
            <label>Pick-up Location</label>
            <input type="text" placeholder="City or airport..." value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="booking-divider" />
          <div className="booking-field">
            <label>Pick-up Date</label>
            <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
          </div>
          <div className="booking-divider" />
          <div className="booking-field">
            <label>Return Date</label>
            <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
          </div>
          <button className="booking-submit">
            <span>Search Cars</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* FLEET */}
      <section className="fleet" id="fleet">
        <div className="section-header">
          <div className="section-eyebrow">Our Fleet</div>
          <h2 className="section-title">Choose Your Ride</h2>
          <div className="filter-tabs">
            {categories.map(cat => (
              <button key={cat} className={`filter-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="cars-grid">
          {filtered.map((car, i) => (
            <article
              key={car.id}
              className={`car-card ${bookedCar === car.id ? 'booked' : ''}`}
              style={{ '--card-color': car.color, '--delay': `${i * 0.07}s` } as React.CSSProperties}
            >
              <div className="card-tag">{car.tag}</div>
              <div className="card-visual">
                <div className="card-glow" />
                <span className="card-emoji">{car.image}</span>
              </div>
              <div className="card-info">
                <div className="card-category">{car.category}</div>
                <h3 className="card-name">{car.name}</h3>
                <div className="card-specs">
                  <span>👤 {car.seats} seats</span>
                  <span>⚙️ {car.transmission}</span>
                </div>
              </div>
              <div className="card-footer">
                <div className="card-price">
                  <span className="price-amount">${car.price}</span>
                  <span className="price-unit">/day</span>
                </div>
                <button className="rent-btn" onClick={() => setBookedCar(car.id)}>
                  {bookedCar === car.id ? '✓ Reserved' : 'Rent Now'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="why" id="why">
        <div className="why-inner">
          <div className="why-text">
            <div className="section-eyebrow">Why Veloce</div>
            <h2 className="section-title">The Smarter<br />Way to Rent</h2>
            <p className="why-desc">No hidden fees. No long queues. Just a seamless experience from booking to keys in hand.</p>
            <ul className="why-list">
              {[
                ['🔑', 'Instant Confirmation', 'Reserve online in under 60 seconds.'],
                ['🛡️', 'Full Insurance Coverage', 'Drive with complete peace of mind.'],
                ['📍', '24/7 Roadside Assist', "We're always a call away, day or night."],
                ['💳', 'No Hidden Fees', 'The price you see is the price you pay.'],
              ].map(([icon, title, desc]) => (
                <li key={title as string} className="why-item">
                  <span className="why-icon">{icon}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="why-visual">
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2>Ready to hit the road?</h2>
          <p>First rental? Use code <strong>VELOCE20</strong> for 20% off.</p>
          <a href="#book" className="cta-button">Get Started →</a>
        </div>
        <div className="cta-bg-emoji">🏎️</div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="logo-mark">V</span>
              <span className="logo-text">VELOCE</span>
            </div>
            <p>Premium car rentals for every journey.</p>
          </div>
          <div className="footer-links">
            <div><strong>Company</strong><a href="#">About</a><a href="#">Careers</a><a href="#">Press</a></div>
            <div><strong>Support</strong><a href="#">Help Center</a><a href="#">Contact</a><a href="#">Locations</a></div>
            <div><strong>Legal</strong><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
          </div>
        </div>
      </footer>
    </div>
  )
}