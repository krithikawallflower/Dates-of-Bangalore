import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { MapPin, Heart, Star } from 'lucide-react'
import L from 'leaflet'
import './App.css'
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

const dateTypeOptions = [
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
  const [selectedRating, setSelectedRating] = useState('All Ratings')
  const [showForm, setShowForm] = useState(false)
  const [filterBy, setFilterBy] = useState('type')

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
    if (selectedRating !== 'All Ratings') {
      filtered = filtered.filter(date => parseInt(date.rating) === parseInt(selectedRating))
    }
    setFilteredDates(filtered)
  }, [dates, selectedType, selectedRating])

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
        setShowForm(false)
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

      <div className="flex flex-wrap justify-center gap-8 mb-8">
        {dateTypes.map((type, index) => (
          <Button
            key={index}
            onClick={() => setSelectedType(type)}
            className={`w-[350px] h-[87px] p-[30px] text-white rounded-lg ${selectedType === type ? 'bg-pink-600' : 'bg-pink-400'}`}
          >
            {type}
          </Button>
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

      <div className="mt-8 max-w-4xl mx-auto space-y-4">
        {filteredDates.slice(0, 5).map((date, index) => (
          <Card key={index} className="bg-gray-800 text-white">
            <CardHeader>
              <CardTitle>{date.location}</CardTitle>
              <div className="flex space-x-2">{getRatingStars(parseInt(date.rating))}</div>
            </CardHeader>
            <CardContent>
              <p>{date.story}</p>
              <Badge className="mt-2 bg-pink-600">{date.type_of_date}</Badge>
            </CardContent>
          </Card>
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
