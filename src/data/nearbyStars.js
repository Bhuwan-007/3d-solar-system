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
