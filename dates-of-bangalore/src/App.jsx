import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Heart, Star } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const bangaloreBounds = [
  [12.7342, 77.4098],
  [13.1739, 77.8566]
]

const dateTypes = [
  'All Types',
  'drinks and snacks',
  'Food centric',
  'sit back and watch',
  'activity and adventure',
  'walk and talk'
]

function App() {
  const [dates, setDates] = useState([])
  const [filteredDates, setFilteredDates] = useState([])
  const [selectedType, setSelectedType] = useState('All Types')
  const [formData, setFormData] = useState({
    rating: '',
    type_of_date: '',
    location: '',
    story: ''
  })

  useEffect(() => {
    fetch('https://sheetdb.io/api/v1/3s63hxbbg4u9w')
      .then(res => res.json())
      .then(data => {
        setDates(data)
        setFilteredDates(data)
      })
      .catch(err => console.error('Failed to load data:', err))
  }, [])

  useEffect(() => {
    let filtered = dates
    if (selectedType !== 'All Types') {
      filtered = filtered.filter(date => date.type_of_date === selectedType)
    }
    setFilteredDates(filtered)
  }, [dates, selectedType])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.rating || !formData.type_of_date || !formData.location || !formData.story) {
      alert('Please fill in all fields')
      return
    }

    const newDate = {
      id: Date.now().toString(),
      rating: formData.rating,
      type_of_date: formData.type_of_date,
      location: formData.location,
      story: formData.story,
      latitude: (12.9716 + (Math.random() - 0.5) * 0.1).toFixed(6),
      longitude: (77.5946 + (Math.random() - 0.5) * 0.1).toFixed(6),
      timestamp: new Date().toISOString(),
      icon_url: ''
    }

    fetch('https://sheetdb.io/api/v1/3s63hxbbg4u9w', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: newDate })
    })
      .then(() => {
        setDates([...dates, newDate])
        setFilteredDates([...dates, newDate])
        setFormData({ rating: '', type_of_date: '', location: '', story: '' })
        alert('Your date story has been shared! 💕')
      })
      .catch(err => {
        console.error('Error submitting story:', err)
        alert('Something went wrong.')
      })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const createCustomIcon = (rating, type, icon_url) => {
    return L.icon({
      iconUrl: icon_url || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      className: 'custom-icon'
    })
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="text-white text-center p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
        <Heart className="mx-4" />
        Dates of Bangalore
        <Heart className="mx-4" />
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {dateTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => setSelectedType(type)}
            className={`w-[350px] h-[87px] p-[30px] rounded-lg text-white ${selectedType === type ? 'bg-pink-600' : 'bg-pink-400'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
        <MapContainer bounds={bangaloreBounds} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
            url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <div className="absolute inset-0 bg-[#a3a3a3] opacity-30 z-[999] pointer-events-none"></div>
          {filteredDates.map((date, index) => (
            <Marker
              key={index}
              position={[parseFloat(date.latitude), parseFloat(date.longitude)]}
              icon={createCustomIcon(date.rating, date.type_of_date, date.icon_url)}
            >
              <Popup>
                <strong>{date.location}</strong><br />
                {date.story}<br />
                {getRatingStars(parseInt(date.rating))}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <form onSubmit={handleFormSubmit} className="mt-10 space-y-4 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full p-2 rounded border"
        />
        <textarea
          placeholder="Your story..."
          value={formData.story}
          onChange={(e) => handleInputChange('story', e.target.value)}
          className="w-full p-2 rounded border"
        />
        <input
          type="number"
          placeholder="Rating (1-5)"
          value={formData.rating}
          onChange={(e) => handleInputChange('rating', e.target.value)}
          className="w-full p-2 rounded border"
        />
        <input
          type="text"
          placeholder="Type of date"
          value={formData.type_of_date}
          onChange={(e) => handleInputChange('type_of_date', e.target.value)}
          className="w-full p-2 rounded border"
        />
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded">Share Date</button>
      </form>

      <div className="mt-8 max-w-4xl mx-auto space-y-4">
        {filteredDates.slice(0, 5).map((date, index) => (
          <div key={index} className="bg-gray-800 text-white p-4 rounded">
            <h3 className="text-xl font-bold">{date.location}</h3>
            <div className="flex space-x-2 mb-2">{getRatingStars(parseInt(date.rating))}</div>
            <p>{date.story}</p>
            <span className="inline-block mt-2 bg-pink-600 px-2 py-1 rounded text-sm">{date.type_of_date}</span>
          </div>
        ))}
      </div>

      <style>{`
        .leaflet-marker-icon.custom-icon {
          filter: drop-shadow(0 0 3px rgba(0,0,0,0.2));
        }
      `}</style>
    </div>
  )
}

export default App
