export const nearbyStarsData = [
  {
      id: 'alpha-centauri',
      name: 'Alpha Centauri',
      kicker: 'Binary Star System',
      description: 'The closest star system to the Solar System, consisting of three stars: Alpha Centauri A, B, and Proxima.',
      uiColor: 'yellow',
      r: 12, dist: 350, orbit: 0, rot: 1/20, angle: 0.8, yOffset: 15,
      atmosphere: 0xffee88,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Alpha Centauri A is a yellow star very similar to our Sun.',
        'It is located 4.37 light-years away from Earth.',
        'The system is the brightest star in the southern constellation of Centaurus.',
      ],
      planets: [
        {
          id: 'alpha-centauri-b',
          name: 'Alpha Centauri B',
          kicker: 'Binary Companion',
          description: 'The slightly smaller and cooler companion star, locked in a dance with Alpha Centauri A.',
          uiColor: 'orange',
          r: 6, dist: 30, orbit: 1/80, rot: 1/30,
          atmosphere: 0xffaa44,
          facts: ['Orbiting at roughly the distance of Uranus from the Sun.', 'It is an orange K-type main-sequence star.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.0);
              vec3 base = mix(vec3(0.8, 0.4, 0.0), vec3(1.0, 0.6, 0.1), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.9, 0.5, 0.0) * interaction * fbm(vWorldPosition * 5.0 + time);
              color = base * 1.2;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 2.0 - time * 0.1);
              float n2 = fbm(vWorldPosition * 5.0 + time * 0.15);
              vec3 base = mix(vec3(0.9, 0.7, 0.1), vec3(1.0, 0.9, 0.4), smoothstep(0.3, 0.7, n));
              vec3 color = mix(base, vec3(1.0, 1.0, 0.7), smoothstep(0.6, 0.9, n2));
              vec3 extra = vec3(1.0, 0.9, 0.5) * interaction * fbm(vWorldPosition * 4.0 + time * 1.5);
              float edge = 1.0 - max(dot(vWorldNormal, vec3(0.0, 0.0, 1.0)), 0.0);
              extra += vec3(1.0, 0.8, 0.3) * pow(edge, 3.0);
              color = color * 1.5;
          `
      }
  },
  {
      id: 'barnards-star',
      name: 'Barnard\'s Star',
      kicker: 'Red Dwarf',
      description: 'A very low-mass red dwarf star with the highest known proper motion of any star.',
      uiColor: 'red',
      r: 6, dist: 420, orbit: 0, rot: 1/130, angle: 2.1, yOffset: -20,
      atmosphere: 0xff5533,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Barnard\'s Star is about 5.96 light-years away.',
        'It is moving across the night sky faster than any other star.',
        'At 10 billion years old, it is significantly older than the Sun.',
      ],
      planets: [
        {
          id: 'barnard-b',
          name: 'Barnard\'s Star b',
          kicker: 'Super-Earth Candidate',
          description: 'A candidate exoplanet that is a cold super-Earth, orbiting close to the snow line of its host star.',
          uiColor: 'gray',
          r: 1.8, dist: 12, orbit: 1/233, rot: 1/1.5,
          atmosphere: 0x445566,
          facts: ['Estimated to have a mass about 3.2 times that of Earth.', 'Its surface temperature is thought to be around -170°C.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 4.0);
              vec3 color = mix(vec3(0.3, 0.3, 0.35), vec3(0.5, 0.5, 0.55), smoothstep(0.2, 0.8, n));
              vec3 extra = vec3(0.2, 0.4, 0.6) * interaction * fbm(vWorldPosition * 10.0 + time);
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 3.0 - time * 0.05);
              vec3 base = mix(vec3(0.5, 0.1, 0.0), vec3(0.8, 0.3, 0.1), smoothstep(0.2, 0.8, n));
              // Flare activity for active state
              float flares = fbm(vWorldPosition * 8.0 + time * (0.5 + interaction * 2.0));
              vec3 extra = vec3(1.0, 0.4, 0.1) * (interaction * 1.5) * smoothstep(0.5, 0.9, flares);
              vec3 color = base;
          `
      }
  },
  {
      id: 'sirius',
      name: 'Sirius',
      kicker: 'The Dog Star',
      description: 'The brightest star in Earth\'s night sky, actually a binary star system containing a massive main-sequence star and a faint white dwarf.',
      uiColor: 'cyan',
      r: 15, dist: 550, orbit: 0, rot: 1/5, angle: 4.2, yOffset: 10,
      atmosphere: 0x88ccff,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Sirius is twice as massive as the Sun and 25 times more luminous.',
        'It is 8.6 light-years away, making it one of our closest neighbors.',
        'The companion star, Sirius B, is a white dwarf the size of Earth but with the mass of the Sun.',
      ],
      planets: [
        {
          id: 'sirius-b',
          name: 'Sirius B',
          kicker: 'White Dwarf',
          description: 'A faint but incredibly dense white dwarf companion to the brilliant Sirius A.',
          uiColor: 'white',
          r: 2, dist: 40, orbit: 1/150, rot: 1/0.5,
          atmosphere: 0xeeeeff,
          facts: ['Sirius B was the first white dwarf to be discovered.', 'It packs the mass of our Sun into a volume roughly the size of Earth.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 10.0 - time * 0.5);
              vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 1.0, 1.0), smoothstep(0.2, 0.8, n));
              vec3 extra = vec3(0.5, 0.7, 1.0) * interaction * 1.5;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 2.5 - time * 0.3);
              vec3 base = mix(vec3(0.6, 0.8, 1.0), vec3(0.9, 0.95, 1.0), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.7, 0.9, 1.0) * interaction * fbm(vWorldPosition * 6.0 + time * 2.0);
              float edge = 1.0 - max(dot(vWorldNormal, vec3(0.0, 0.0, 1.0)), 0.0);
              extra += vec3(0.5, 0.8, 1.0) * pow(edge, 2.5);
              vec3 color = base * 1.8;
          `
      }
  },
  {
      id: 'proxima-centauri',
      name: 'Proxima Centauri',
      kicker: 'Closest Star',
      description: 'A small, low-mass star located 4.2465 light-years away from the Sun in the southern constellation of Centaurus.',
      uiColor: 'orange',
      r: 4, dist: 330, orbit: 0, rot: 1/83, angle: 0.6, yOffset: 5,
      atmosphere: 0xff6644,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Proxima Centauri is the absolute closest star to our Solar System.',
        'It is a flare star, meaning it can undergo sudden dramatic increases in brightness.',
        'It hosts at least two confirmed exoplanets, including Proxima b in the habitable zone.',
      ],
      planets: [
        {
          id: 'proxima-d',
          name: 'Proxima d',
          kicker: 'Sub-Earth',
          description: 'A very light and hot sub-Earth orbiting extremely close to Proxima Centauri.',
          uiColor: 'red',
          r: 0.8, dist: 5, orbit: 1/5, rot: 1/5,
          atmosphere: 0x884422,
          facts: ['Discovered in 2022.', 'It orbits its star every 5.1 Earth days.', 'One of the lightest exoplanets ever detected.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 6.0);
              vec3 color = mix(vec3(0.5, 0.2, 0.1), vec3(0.7, 0.3, 0.2), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.8, 0.4, 0.1) * interaction;
            `
          }
        },
        {
          id: 'proxima-b',
          name: 'Proxima b',
          kicker: 'Habitable Zone Planet',
          description: 'An Earth-sized exoplanet orbiting within the habitable zone of Proxima Centauri.',
          uiColor: 'orange',
          r: 1.2, dist: 9, orbit: 1/11, rot: 1/11, // Tidally locked
          atmosphere: 0xaa7744,
          facts: ['Discovered in 2016.', 'It orbits its star every 11.2 Earth days.', 'Likely tidally locked, meaning one side always faces the star.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 5.0);
              vec3 color = mix(vec3(0.4, 0.2, 0.1), vec3(0.6, 0.3, 0.2), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.8, 0.5, 0.2) * interaction;
            `
          }
        },
        {
          id: 'proxima-c',
          name: 'Proxima c',
          kicker: 'Super-Earth Candidate',
          description: 'A much colder and larger candidate planet orbiting far from the star.',
          uiColor: 'blue',
          r: 1.6, dist: 16, orbit: 1/1900, rot: 1/2,
          atmosphere: 0x446688,
          facts: ['Discovered in 2020.', 'It takes about 5.2 Earth years to complete one orbit.', 'It is too cold for liquid water.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 4.0);
              vec3 color = mix(vec3(0.2, 0.3, 0.5), vec3(0.4, 0.5, 0.7), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.3, 0.5, 0.8) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 4.0 - time * 0.08);
              vec3 base = mix(vec3(0.6, 0.2, 0.1), vec3(0.9, 0.4, 0.2), smoothstep(0.2, 0.8, n));
              float flare = fbm(vWorldPosition * 10.0 + time * (1.0 + interaction * 4.0));
              vec3 extra = vec3(1.0, 0.5, 0.2) * interaction * 2.5 * smoothstep(0.6, 0.95, flare);
              vec3 color = base;
          `
      }
  },
  {
      id: 'vega',
      name: 'Vega',
      kicker: 'Sapphire Star',
      description: 'A bright bluish-white star, fifth-brightest in the night sky, and extensively studied by astronomers.',
      uiColor: 'cyan',
      r: 14, dist: 600, orbit: 0, rot: 1/0.5, angle: 5.5, yOffset: -15,
      atmosphere: 0xaaddff,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Vega is spinning so fast (once every 12.5 hours) that it is bulging at the equator.',
        'It was the first star other than the Sun to be photographed.',
        'It will be the North Star again in about 12,000 years due to precession.',
      ],
      planets: [
        {
          id: 'vega-disk',
          name: 'Debris Disk',
          kicker: 'Protoplanetary Dust',
          description: 'Vega is surrounded by a massive disk of dust and debris, where new planets may be forming.',
          uiColor: 'gray',
          r: 3, dist: 25, orbit: 1/50, rot: 1/5,
          atmosphere: 0x555555,
          rings: { inner: 4, outer: 12, color: 0x9999aa },
          facts: ['The debris disk was discovered by the IRAS satellite in 1983.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.0);
              vec3 color = mix(vec3(0.2, 0.2, 0.2), vec3(0.4, 0.4, 0.4), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.4, 0.5, 0.6) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              // Extremely fast rotation visualized by horizontal bands
              float bands = sin(vWorldPosition.y * 4.0 + time * 5.0) * 0.1;
              float n = fbm(vWorldPosition * 2.0 + vec3(0.0, bands, time * 0.4));
              vec3 base = mix(vec3(0.7, 0.85, 1.0), vec3(0.95, 0.98, 1.0), smoothstep(0.2, 0.8, n));
              vec3 extra = vec3(0.6, 0.8, 1.0) * interaction * fbm(vWorldPosition * 5.0 + time * 3.0);
              vec3 color = base * 1.6;
          `
      }
  },
  {
      id: 'tau-ceti',
      name: 'Tau Ceti',
      kicker: 'Sun-like Star',
      description: 'A single star in the constellation Cetus that is spectrally similar to the Sun, though somewhat less massive.',
      uiColor: 'yellow',
      r: 10, dist: 480, orbit: 0, rot: 1/34, angle: 3.4, yOffset: 25,
      atmosphere: 0xffdd77,
      dayLength: '—',
      yearLength: '—',
      facts: [
        'Tau Ceti is ~11.9 light-years from Earth.',
        'It is known for having a massive disk of debris and dust around it.',
        'It hosts several candidate exoplanets, some potentially in the habitable zone.',
      ],
      planets: [
        {
          id: 'tau-ceti-g',
          name: 'Tau Ceti g',
          kicker: 'Super-Earth Candidate',
          description: 'A super-Earth candidate orbiting very close to Tau Ceti.',
          uiColor: 'red',
          r: 1.3, dist: 8, orbit: 1/20, rot: 1/5,
          atmosphere: 0x884433,
          facts: ['It orbits the star in just 20 Earth days.', 'Surface temperatures are likely scorching.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.0);
              vec3 color = mix(vec3(0.5, 0.2, 0.1), vec3(0.7, 0.3, 0.2), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.8, 0.4, 0.2) * interaction;
            `
          }
        },
        {
          id: 'tau-ceti-h',
          name: 'Tau Ceti h',
          kicker: 'Super-Earth Candidate',
          description: 'A super-Earth candidate orbiting within the inner regions of the system.',
          uiColor: 'orange',
          r: 1.4, dist: 11, orbit: 1/49, rot: 1/2,
          atmosphere: 0x995533,
          facts: ['It has an orbital period of about 49 Earth days.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 3.5);
              vec3 color = mix(vec3(0.4, 0.3, 0.2), vec3(0.6, 0.4, 0.3), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.7, 0.5, 0.3) * interaction;
            `
          }
        },
        {
          id: 'tau-ceti-e',
          name: 'Tau Ceti e',
          kicker: 'Habitable Zone Super-Earth',
          description: 'A rocky super-Earth candidate orbiting within the inner edge of Tau Ceti\'s habitable zone.',
          uiColor: 'amber',
          r: 1.5, dist: 15, orbit: 1/162, rot: 1/1.2,
          atmosphere: 0xcc9966,
          facts: ['It receives about 60% more sunlight than Earth.', 'The system is constantly bombarded by asteroids from a massive debris disk.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 4.0);
              vec3 color = mix(vec3(0.5, 0.4, 0.2), vec3(0.8, 0.6, 0.3), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.9, 0.7, 0.4) * interaction;
            `
          }
        },
        {
          id: 'tau-ceti-f',
          name: 'Tau Ceti f',
          kicker: 'Outer Habitable Zone',
          description: 'A super-Earth orbiting near the outer edge of Tau Ceti\'s habitable zone.',
          uiColor: 'cyan',
          r: 1.6, dist: 22, orbit: 1/636, rot: 1/0.8,
          atmosphere: 0x5588aa,
          facts: ['It takes about 1.7 Earth years to complete an orbit.', 'It likely has a thick atmosphere or global ocean.'],
          shader: {
            fragmentCore: `
              float n = fbm(vWorldPosition * 4.5);
              vec3 color = mix(vec3(0.3, 0.4, 0.5), vec3(0.4, 0.6, 0.7), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(0.5, 0.7, 0.8) * interaction;
            `
          }
        }
      ],
      shader: {
          fragmentCore: `
              float n = fbm(vWorldPosition * 2.2 - time * 0.1);
              vec3 base = mix(vec3(0.8, 0.6, 0.1), vec3(1.0, 0.8, 0.3), smoothstep(0.3, 0.7, n));
              vec3 extra = vec3(1.0, 0.8, 0.4) * interaction * fbm(vWorldPosition * 5.0 + time * 1.2);
              float edge = 1.0 - max(dot(vWorldNormal, vec3(0.0, 0.0, 1.0)), 0.0);
              extra += vec3(0.9, 0.7, 0.2) * pow(edge, 3.0);
              vec3 color = base * 1.4;
          `
      }
  }
];
