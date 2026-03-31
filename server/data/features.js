const features = [
  {
    "id": 1,
    "feature_name": "Exterior Color",
    "options": [
      { "id": 101, "name": "Midnight Blue", "price_modifier": 0 },
      { "id": 102, "name": "Matte Black", "price_modifier": 500 },
      { "id": 103, "name": "Racing Red", "price_modifier": 300 }
    ]
  },
  {
    "id": 2,
    "feature_name": "Wheels",
    "options": [
      { "id": 201, "name": "18-inch Standard", "price_modifier": 0, "image": "/assets/wheels-std.png" },
      { "id": 202, "name": "20-inch Sport", "price_modifier": 1200, "image": "/assets/wheels-sport.png" }
    ]
  },
  {
    "id": 3,
    "feature_name": "Roof",
    "options": [
      { "id": 301, "name": "Panoramic Glass", "price_modifier": 1500,"is_convertible": false, "image": "/assets/roof-glass.png" },
      { "id": 302, "name": "Carbon Fiber", "price_modifier": 2500,"is_convertible": false, "image": "/assets/roof-carbon.png" },
      { "id": 303, "name": "Retractable Soft Top", "price_modifier": 2000,"is_convertible": true, "image": "/assets/roof-soft-top.png"  },
      { "id": 304, "name": "Power Hardtop", "price_modifier": 4500, "is_convertible": true,"image": "/assets/roof-hard-top.png" },
    ]
  },
  {
    "id": 4,
    "feature_name": "Interior",
    "options": [
      { "id": 401, "name": "Alcantara Black", "price_modifier": 0, "image": "/assets/interior-black.png" },
      { "id": 402, "name": "Cognac Leather", "price_modifier": 1800, "image": "/assets/interior-cognac.png" }
    ]
  }
];

export default features