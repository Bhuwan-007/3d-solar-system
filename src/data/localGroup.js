export const localGroupData = [
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    systemType: 'galaxy',
    kicker: 'M31 • Largest in the Local Group',
    description: 'A massive barred spiral galaxy located approximately 2.5 million light-years from Earth. It contains roughly one trillion stars and is on a collision course with the Milky Way.',
    uiColor: 'blue',
    // Top-Right of the screen (Cinematic Diagonal)
    angle: 0.8, dist: 11000, yOffset: 1500,
    r: 1500,
    isGalaxy: true,
    facts: [
      'It is the largest galaxy in the Local Group, containing an estimated one trillion stars.',
      'Andromeda is approaching the Milky Way at 110 kilometers per second and will collide with it in 4.5 billion years.',
      'It possesses a massive double-nucleus at its center, likely from a past merger with another galaxy.',
      'Despite having more stars, recent studies suggest Andromeda may actually be less massive than the Milky Way due to less dark matter.'
    ],
  },
  {
    id: 'triangulum',
    name: 'Triangulum Galaxy',
    systemType: 'galaxy',
    kicker: 'M33',
    description: 'The third-largest member of the Local Group, located about 2.73 million light-years away. It is a smaller spiral galaxy that may be gravitationally bound to Andromeda.',
    uiColor: 'teal',
    // Middle distance between Milky Way and Andromeda
    angle: 1.2, dist: 7000, yOffset: -500,
    r: 900,
    isGalaxy: true,
    facts: [
      'It contains about 40 billion stars, significantly fewer than the Milky Way or Andromeda.',
      'Triangulum is sometimes considered a satellite of the Andromeda Galaxy.',
      'It is home to NGC 604, one of the largest stellar nurseries in the Local Group.'
    ],
  },
  {
    id: 'large-magellanic',
    name: 'Large Magellanic Cloud',
    systemType: 'galaxy',
    kicker: 'Dwarf Satellite',
    description: 'A satellite dwarf galaxy of the Milky Way. It appears as an irregular cloud of glowing stars and gas in the southern hemisphere sky.',
    uiColor: 'pink',
    // Bottom-left, safely orbiting far outside the Milky Way's 2000 radius
    angle: 4.2, dist: 6500, yOffset: -800,
    r: 600,
    isGalaxy: true,
    facts: [
      'It is located about 163,000 light-years away, making it one of our closest galactic neighbors.',
      'It contains the Tarantula Nebula, the most active star-forming region in the Local Group.',
      'The LMC is predicted to collide with the Milky Way in approximately 2.4 billion years.'
    ],
  },
  {
    id: 'small-magellanic',
    name: 'Small Magellanic Cloud',
    systemType: 'galaxy',
    kicker: 'Dwarf Satellite',
    description: 'A dwarf irregular galaxy near the Milky Way, containing several hundred million stars.',
    uiColor: 'yellow',
    // Bottom, safely orbiting far outside
    angle: 3.6, dist: 7500, yOffset: -1500,
    r: 450,
    isGalaxy: true,
    facts: [
      'Located about 200,000 light-years away, slightly farther than the Large Magellanic Cloud.',
      'It is connected to the LMC by a bridge of gas known as the Magellanic Bridge.',
      'It has a very low metallicity, meaning it is poor in elements heavier than helium.'
    ],
  },
  {
    id: 'pa-99-n2',
    name: 'PA-99-N2 b',
    systemType: 'exoplanet',
    kicker: 'Extragalactic Exoplanet Candidate',
    description: 'The first ever exoplanet candidate discovered outside the Milky Way galaxy, located in the Andromeda Galaxy.',
    uiColor: 'magenta',
    // Just below Andromeda
    angle: 0.76, dist: 11500, yOffset: 1300,
    r: 300,
    planets: [
      {
        id: 'pa-99-n2-planet',
        name: 'PA-99-N2 b',
        kicker: 'Extragalactic Discovery',
        description: 'Discovered via microlensing, this candidate planet orbits a star in the Andromeda Galaxy, millions of light-years away. If confirmed, it is the most distant exoplanet known.',
        radius: 12,
        dist: 0,
        speed: 0,
        color: 'magenta',
        facts: [
          'It is located 2.5 million light-years from Earth.',
          'Discovered using pixel-lensing, observing the magnification of a background star.',
          'It orbits a red giant star in the Andromeda Galaxy.',
          'Its mass is estimated to be roughly 6 times that of Jupiter.'
        ]
      }
    ],
  }
];
