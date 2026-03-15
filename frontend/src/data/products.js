const CLOUD_NAME = 'dbvnu5iqr';

export const cloudFetch = (url, w = 400, h = 400) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_${w},h_${h},c_fill,g_center,q_auto,f_auto/${url}`;

export const categories = [
  {
    id: 'hotwheels',
    name: 'Hot Wheels',
    image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400', 200, 200),
  },
  {
    id: 'majorette',
    name: 'Majorette',
    image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400', 200, 200),
  },
  {
    id: 'matchbox',
    name: 'Matchbox',
    image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400', 200, 200),
  },
  {
    id: 'tomica',
    name: 'Tomica',
    image: cloudFetch('https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400', 200, 200),
  },
  {
    id: 'greenlight',
    name: 'Greenlight',
    image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', 200, 200),
  },
  {
    id: 'jada',
    name: 'Jada Toys',
    image: cloudFetch('https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400', 200, 200),
  },
  {
    id: 'autoworld',
    name: 'Auto World',
    image: cloudFetch('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', 200, 200),
  },
  {
    id: 'maisto',
    name: 'Maisto',
    image: cloudFetch('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400', 200, 200),
  },
];

// Sample products - will be replaced with API data later
export const sampleProducts = [
  {
    id: 1,
    name: 'Hot Wheels Porsche 911 GT3',
    price: 249,
    discount: 17,
    category: 'hotwheels',
    image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400'),
  },
  {
    id: 2,
    name: 'Matchbox Ford Mustang 1967',
    price: 199,
    discount: 0,
    category: 'matchbox',
    image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400'),
  },
  {
    id: 3,
    name: 'Majorette Lamborghini Aventador',
    price: 350,
    discount: 22,
    category: 'majorette',
    image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'),
  },
  {
    id: 4,
    name: 'Tomica Toyota Supra GR',
    price: 299,
    discount: 10,
    category: 'tomica',
    image: cloudFetch('https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400'),
  },
  {
    id: 5,
    name: 'Hot Wheels Tesla Cybertruck',
    price: 399,
    discount: 0,
    category: 'hotwheels',
    image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400'),
  },
  {
    id: 6,
    name: 'Maisto Chevrolet Corvette C8',
    price: 450,
    discount: 15,
    category: 'maisto',
    image: cloudFetch('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400'),
  },
  {
    id: 7,
    name: 'Jada Toys Dodge Charger R/T',
    price: 275,
    discount: 0,
    category: 'jada',
    image: cloudFetch('https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400'),
  },
  {
    id: 8,
    name: 'Auto World Ford GT40 MkII',
    price: 520,
    discount: 8,
    category: 'autoworld',
    image: cloudFetch('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400'),
  },
  {
    id: 9,
    name: 'Hot Wheels BMW M3 GTR',
    price: 189,
    discount: 25,
    category: 'hotwheels',
    image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400'),
  },
  {
    id: 10,
    name: 'Majorette Mercedes AMG GT',
    price: 320,
    discount: 12,
    category: 'majorette',
    image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'),
  },
  {
    id: 11,
    name: 'Matchbox Land Rover Defender',
    price: 229,
    discount: 5,
    category: 'matchbox',
    image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400'),
  },
  {
    id: 12,
    name: 'Greenlight Shelby GT500',
    price: 380,
    discount: 0,
    category: 'greenlight',
    image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400'),
  },
];
