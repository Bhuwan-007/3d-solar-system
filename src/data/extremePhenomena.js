// Data file for extreme cosmic phenomena in the Local Group

export const extremePhenomenaData = {
  blackHoles: [
    {
      id: 'sagittarius-a-star',
      name: 'Sagittarius A*',
      kicker: 'Supermassive Black Hole',
      description: 'The supermassive black hole at the galactic center of the Milky Way. It has a mass of about 4 million times that of our Sun.',
      uiColor: 'orange',
      // Placed exactly at the origin (center of the Milky Way)
      position: { x: 0, y: 0, z: 0 },
      radius: 400, // Size of the event horizon / distortion sphere
      accretionRadius: 800,
      mass: 4.0, // Multiplier for gravitational lensing strength
    },
    {
      id: 'andromeda-core-bh',
      name: 'Andromeda Core BH',
      kicker: 'Supermassive Black Hole',
      description: 'The supermassive black hole at the center of the Andromeda Galaxy. It is vastly more massive than Sagittarius A*, packing the mass of 140 million suns.',
      uiColor: 'red',
      // Andromeda is at angle 0.8, dist 11000
      position: { 
        x: Math.cos(0.8) * 11000, 
        y: 1500, 
        z: Math.sin(0.8) * 11000 
      },
      radius: 600,
      accretionRadius: 1200,
      mass: 8.0,
    },
    {
      id: 'm87-titan',
      name: 'M87* (The Titan)',
      systemType: 'blackhole',
      kicker: 'Ultramassive Black Hole',
      description: 'The ultramassive black hole at the center of the Virgo A galaxy. It contains the mass of 6.5 billion suns and powers a relativistic jet of plasma that extends 5,000 light-years into space.',
      uiColor: 'yellow',
      // M87 is the anchor of Virgo Supercluster
      position: { 
        x: 300000, 
        y: 20000, 
        z: 0 // angle 0
      },
      radius: 12000,
      accretionRadius: 36000,
      spinSpeed: 0.2,
      hasJet: true // We will build a volume shader for this jet
    }
  ],
  // Dark matter web nodes connect various galaxies
  darkMatterNodes: [
    // Milky Way Core
    { x: 0, y: 0, z: 0 },
    // Andromeda Core
    { x: Math.cos(0.5) * 12000, y: 1500, z: Math.sin(0.5) * 12000 },
    // Triangulum Core (angle 1.0, dist 12500, yOffset -500)
    { x: Math.cos(1.0) * 12500, y: -500, z: Math.sin(1.0) * 12500 },
    // Large Magellanic Cloud (angle 3.5, dist 6500, yOffset -2200)
    { x: Math.cos(3.5) * 6500, y: -2200, z: Math.sin(3.5) * 6500 },
    // Random space hubs for the web to branch through
    { x: 5000, y: 3000, z: 6000 },
    { x: 8000, y: -1000, z: 3000 },
    { x: 2000, y: 4000, z: 9000 },
    { x: 10000, y: 2000, z: 1000 },
    { x: -2000, y: -3000, z: 4000 }
  ]
};
