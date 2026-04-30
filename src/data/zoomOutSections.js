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
    cameraPos: { x: 500, y: 3500, z: 2000 },  // Perspective from above and side
    cameraLook: { x: 0, y: 0, z: 0 },
  },
];
