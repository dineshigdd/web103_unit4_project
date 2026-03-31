const customItem = [
  {
    "id": 1,
    "item_name": "Skyline Special",
    "base_price": 25000,
    "is_convertible": true,
    "selected_options": {
      "1": { "id": 102, "name": "Midnight Blue", "price_modifier": 500 },
      "2": { "id": 202, "name": "Sport Alloys", "price_modifier": 1200 },
      "3": { "id": 304, "name": "Power Hardtop", "price_modifier": 4500, "is_convertible": true }
    },
    "total_price": 31200,
    "created_at": "2026-03-27T10:15:00Z"
  },
  {
    "id": 2,
    "item_name": "Urban Explorer",
    "base_price": 25000,
    "is_convertible": false, // <--- COUPE SELECTION
    "selected_options": {
      "1": { "id": 101, "name": "Silver Metallic", "price_modifier": 0 },
      "2": { "id": 201, "name": "Standard Wheels", "price_modifier": 0 },
      "3": { "id": 301, "name": "Panoramic Glass", "price_modifier": 1500, "is_convertible": false }
    },
    "total_price": 26500,
    "created_at": "2026-03-28T14:30:00Z"
  }
]

export default customItem;