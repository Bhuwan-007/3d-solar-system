export const distantStarsData = [
  {
      id: 'trappist-1',
      name: 'TRAPPIST-1',
      systemType: 'distant',
      kicker: 'Ultra-cool Red Dwarf',
      description: 'An ultra-cool red dwarf star hosting seven temperate, terrestrial planets.',
      uiColor: 'red',
      r: 10, dist: 1200, orbit: 0, rot: 1/15, angle: 1.2, yOffset: 150,
      atmosphere: 0xaa2211,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'TRAPPIST-1 is about 40 light-years away in the constellation Aquarius.',
        'It hosts the largest group of Earth-sized planets found in a single stellar system.',
        'Three of its planets are firmly located within the habitable zone.'
      ],
      planets: [
        {
          id: 'trappist-1e',
          name: 'TRAPPIST-1e',
          systemType: 'distant',
          kicker: 'Habitable Zone Planet',
          description: 'A rocky, Earth-sized planet located squarely in the habitable zone of TRAPPIST-1.',
          uiColor: 'blue',
          r: 1.5, dist: 15, orbit: 1/6, rot: 1/6,
          atmosphere: 0x336699,
          facts: ['It orbits its star every 6 Earth days.', 'It is one of the most likely candidates for having liquid water on its surface.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.0);
              vec3 color = mix(vec3(0.1, 0.3, 0.6), vec3(0.3, 0.6, 0.8), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.2, 0.5, 0.8) * interaction;
            `
          }
        },
        {
          id: 'trappist-1f',
          name: 'TRAPPIST-1f',
          systemType: 'distant',
          kicker: 'Outer Habitable Zone',
          description: 'A cooler Earth-sized world that may be rich in water or ice.',
          uiColor: 'cyan',
          r: 1.6, dist: 22, orbit: 1/9, rot: 1/9,
          atmosphere: 0x55aabb,
          facts: ['It receives about the same amount of light as Mars does from our Sun.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 4.0);
              vec3 color = mix(vec3(0.3, 0.6, 0.7), vec3(0.7, 0.9, 1.0), smoothstep(0.4, 0.8, n));
              vec3 extra = vec3(0.4, 0.8, 1.0) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 4.0 - time * 0.05);
              vec3 base = mix(vec3(0.4, 0.0, 0.0), vec3(0.8, 0.1, 0.0), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.9, 0.2, 0.0) * interaction * fbm(vWorldPosition * 8.0 + time * 0.5);
              color = base;
          `
      }
  },
  {
      id: 'kepler-186',
      name: 'Kepler-186',
      systemType: 'distant',
      kicker: 'M-type Main Sequence Dwarf',
      description: 'A red dwarf star famous for hosting the first Earth-sized exoplanet discovered in a habitable zone.',
      uiColor: 'orange',
      r: 14, dist: 2100, orbit: 0, rot: 1/25, angle: 3.5, yOffset: -100,
      atmosphere: 0xff6633,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Located ~582 light-years away in the constellation Cygnus.',
        'It is cooler and significantly less luminous than our Sun.',
        'It hosts five known planets.'
      ],
      planets: [
        {
          id: 'kepler-186f',
          name: 'Kepler-186f',
          systemType: 'distant',
          kicker: 'First Habitable Zone Earth-Size',
          description: 'An exoplanet that made history as the first Earth-sized planet found in the habitable zone of another star.',
          uiColor: 'amber',
          r: 1.8, dist: 25, orbit: 1/130, rot: 1/20,
          atmosphere: 0x995533,
          facts: ['It orbits its star every 130 days.', 'It receives about one-third of the light energy that Earth does from the Sun.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.5);
              vec3 color = mix(vec3(0.6, 0.3, 0.2), vec3(0.8, 0.5, 0.3), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.9, 0.6, 0.3) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 2.0 - time * 0.1);
              vec3 base = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.5, 0.1), smoothstep(0.2, 0.8, n));
              vec3 extra = vec3(1.0, 0.6, 0.2) * interaction * fbm(vWorldPosition * 6.0 + time);
              color = base;
          `
      }
  },
  {
      id: 'kepler-452',
      name: 'Kepler-452',
      systemType: 'distant',
      kicker: 'G-type Yellow Dwarf',
      description: 'A star very similar to our Sun, making its planets particularly interesting for habitability.',
      uiColor: 'yellow',
      r: 18, dist: 2800, orbit: 0, rot: 1/28, angle: 5.1, yOffset: 300,
      atmosphere: 0xffeeaa,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Located ~1,800 light-years away in the constellation Cygnus.',
        'It is about 1.5 billion years older than our Sun, giving us a glimpse into our Solar System\'s future.',
        'It is 20% brighter than the Sun.'
      ],
      planets: [
        {
          id: 'kepler-452b',
          name: 'Kepler-452b',
          systemType: 'distant',
          kicker: 'Earth\'s Older Cousin',
          description: 'A super-Earth exoplanet orbiting a Sun-like star in the habitable zone.',
          uiColor: 'green',
          r: 2.2, dist: 35, orbit: 1/385, rot: 1/24,
          atmosphere: 0x77aa88,
          facts: ['Its year is 385 Earth days, very similar to ours.', 'It is a prime candidate for a rocky world with a thick atmosphere.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 2.5);
              vec3 color = mix(vec3(0.2, 0.4, 0.2), vec3(0.5, 0.6, 0.4), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.3, 0.7, 0.5) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 1.5 - time * 0.15);
              vec3 base = mix(vec3(0.9, 0.7, 0.1), vec3(1.0, 0.9, 0.3), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(1.0, 1.0, 0.5) * interaction * fbm(vWorldPosition * 4.0 + time);
              color = base;
          `
      }
  },
  {
      id: '51-pegasi',
      name: '51 Pegasi',
      systemType: 'distant',
      kicker: 'Historic Sun-like Star',
      description: 'The first Sun-like star discovered to have a planet orbiting it.',
      uiColor: 'yellow',
      r: 22, dist: 1600, orbit: 0, rot: 1/20, angle: 2.3, yOffset: 50,
      atmosphere: 0xffffbb,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Located ~50 light-years away in the constellation Pegasus.',
        'The discovery of its planet in 1995 completely changed our understanding of planetary systems.'
      ],
      planets: [
        {
          id: '51-pegasi-b',
          name: '51 Pegasi b (Dimidium)',
          systemType: 'distant',
          kicker: 'First Hot Jupiter',
          description: 'A massive gas giant orbiting blisteringly close to its star, creating a new class of planets called Hot Jupiters.',
          uiColor: 'purple',
          r: 5.0, dist: 12, orbit: 1/4, rot: 1/4,
          atmosphere: 0x8844aa,
          facts: ['It orbits its star in just 4.2 Earth days.', 'Its discovery proved that giant planets can exist incredibly close to their stars.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 1.2 - time * 0.5);
              vec3 color = mix(vec3(0.3, 0.1, 0.4), vec3(0.6, 0.3, 0.7), smoothstep(0.2, 0.8, n));
              vec3 extra = vec3(0.8, 0.4, 0.9) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 2.0 - time * 0.12);
              vec3 base = mix(vec3(0.8, 0.8, 0.3), vec3(1.0, 1.0, 0.6), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(1.0, 1.0, 0.8) * interaction * fbm(vWorldPosition * 3.0 + time);
              color = base;
          `
      }
  },
  {
      id: 'lhs-1140',
      name: 'LHS 1140',
      systemType: 'distant',
      kicker: 'Quiet Red Dwarf',
      description: 'A red dwarf that is much less active than Proxima Centauri, making its planets safer havens.',
      uiColor: 'red',
      r: 11, dist: 2500, orbit: 0, rot: 1/30, angle: 4.8, yOffset: -200,
      atmosphere: 0xbb3322,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Located ~40 light-years away in the constellation Cetus.',
        'Because it emits fewer flares than typical red dwarfs, its planets are excellent targets for atmospheric study.'
      ],
      planets: [
        {
          id: 'lhs-1140b',
          name: 'LHS 1140 b',
          systemType: 'distant',
          kicker: 'Massive Super-Earth',
          description: 'A dense, rocky Super-Earth located squarely in the habitable zone.',
          uiColor: 'gray',
          r: 2.0, dist: 18, orbit: 1/24, rot: 1/24,
          atmosphere: 0x666666,
          facts: ['It has a mass about 6.6 times that of Earth.', 'It might be an ocean world with a thick atmosphere.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.0);
              vec3 color = mix(vec3(0.4, 0.4, 0.5), vec3(0.6, 0.6, 0.7), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.5, 0.6, 0.8) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 3.5 - time * 0.08);
              vec3 base = mix(vec3(0.5, 0.1, 0.1), vec3(0.8, 0.2, 0.1), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.9, 0.3, 0.1) * interaction * fbm(vWorldPosition * 7.0 + time);
              color = base;
          `
      }
  }
];
