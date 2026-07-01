/**
 * Zoom-out sections that appear after Pluto in the scroll.
 * These are NOT planets — they drive the camera to different scale levels.
 */
export const zoomOutSections = [
  {
    id: 'solar-overview',
    name: 'Solar System',
    kicker: 'Top View',
    description: 'Rising above the ecliptic plane. The asteroid belt between Mars and Jupiter becomes visible, along with the Kuiper Belt beyond Neptune.',
    uiColor: 'white',
    zoomLevel: 1,
    cameraPos: { x: 0, y: 400, z: 50 },   // High above, looking down
    cameraLook: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'stellar-neighborhood',
    name: 'Stellar Neighborhood',
    kicker: 'Nearby Stars',
    description: 'Zooming out further reveals the closest star systems to our Sun — Alpha Centauri, Sirius, Barnard\'s Star, and others within ~10 light-years.',
    uiColor: 'cyan',
    zoomLevel: 2,
    cameraPos: { x: 0, y: 600, z: 400 },
    cameraLook: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'milkyway',
    name: 'The Milky Way',
    kicker: 'Our Galaxy',
    description: 'Our galaxy — a barred spiral 100,000 light-years across, containing 200–400 billion stars. Our solar system is located in the Orion Arm, about two-thirds from the center.',
    uiColor: 'yellow',
    zoomLevel: 3,
    cameraPos: { x: -1252, y: 12000, z: 425 },
    cameraLook: { x: -1252, y: 0, z: -1575 },
  },
  {
    id: 'local-group',
    name: 'The Local Group',
    kicker: 'Neighboring Galaxies',
    description: 'Our galactic neighborhood, consisting of the Milky Way, the massive Andromeda Galaxy, the Triangulum Galaxy, and over 50 dwarf galaxies bound by gravity.',
    uiColor: 'purple',
    zoomLevel: 4,
    cameraPos: { x: 1800, y: 32000, z: 15000 },
    cameraLook: { x: 1800, y: 0, z: 2400 },
  },
  {
    id: 'superclusters',
    name: 'The Superclusters',
    kicker: 'Virgo & Laniakea',
    description: 'A colossal cosmic web spanning 520 million light-years. The Virgo Supercluster is anchored by the Titan Black Hole M87*, while gravitational currents pull everything toward the Great Attractor.',
    uiColor: 'cyan',
    zoomLevel: 5,
    cameraPos: { x: 100000, y: 550000, z: 300000 },
    cameraLook: { x: 200000, y: 0, z: 100000 },
  },
  {
    id: 'multiverse-inner',
    name: 'The Multiverse',
    kicker: 'Approaching Home',
    description: 'Diving deep into the cosmic foam. Countless distinct universes drift past us as we navigate the crackling dark energy toward our own home bubble.',
    uiColor: 'magenta',
    zoomLevel: 6,
    cameraPos: { x: 1000000, y: 1500000, z: 1000000 },
    cameraLook: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'multiverse',
    name: 'The Multiverse',
    kicker: 'The Bulk',
    description: 'Our entire universe is but one of countless cosmic bubbles floating in a higher-dimensional void. Each bubble represents a complete universe with unique physical constants, pushed apart by crackling dark energy.',
    uiColor: 'magenta',
    zoomLevel: 6,
    cameraPos: { x: 5000000, y: 9000000, z: 5000000 },
    cameraLook: { x: 0, y: 0, z: 0 },
  }
];
