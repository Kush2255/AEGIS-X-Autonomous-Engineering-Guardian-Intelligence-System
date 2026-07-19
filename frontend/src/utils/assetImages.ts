/**
 * PRAHARI AI – Infrastructure Image Resolver
 *
 * Maps every asset infrastructure type to a relevant Unsplash photo
 * using the free Unsplash Source API (no API key required).
 *
 * Each URL is deterministically seeded per-asset so the same asset
 * always resolves to the same photo across page refreshes.
 *
 * Format: https://source.unsplash.com/{W}x{H}/?{keywords}&sig={seed}
 * The `sig` (signature) parameter makes Unsplash pin a specific photo.
 */

/** Map from asset infrastructure type → Unsplash keyword tags */
const TYPE_KEYWORDS: Record<string, string> = {
  // Civil / Transport
  Bridge:               'bridge,india,infrastructure',
  Bridges:              'bridge,india,infrastructure',
  Flyover:              'flyover,overpass,highway,india',
  Road:                 'road,highway,asphalt,india',
  Roads:                'road,highway,india,construction',
  'State Highway':      'highway,road,india,rural',
  Railway:              'railway,train,track,india',
  'Railway Infrastructure': 'railway,track,station,india',
  Metro:                'metro,subway,train,urban,india',

  // Government / Public Buildings
  'Government Building': 'government,building,architecture,india',
  School:               'school,education,building,india',
  University:           'university,college,campus,india',
  Hospital:             'hospital,medical,building,india',

  // Water & Utilities
  Dam:                  'dam,reservoir,water,india',
  Reservoir:            'reservoir,lake,water,india',
  'Water Utility':      'water,utility,pipeline,india',
  'Water Utilities':    'water,treatment,plant,india',
  'Drainage System':    'drainage,canal,water,urban,india',
  Pipeline:             'pipeline,water,infrastructure',

  // Smart City / Telecom / Power
  'Smart City Asset':   'smart,city,urban,technology,india',
  'Public Utility':     'electricity,power,grid,india',
  Telecom:              'tower,antenna,communication,india',

  // Misc
  Tunnel:               'tunnel,underground,india',
  Airport:              'airport,terminal,india',
};

/** Fallback keywords when type is not explicitly mapped */
const FALLBACK_KEYWORDS = 'infrastructure,engineering,india,construction';

/**
 * Derive a numeric seed from an asset ID string for deterministic Unsplash photos.
 * Same asset ID → same `sig` → same Unsplash photo every time.
 */
function deriveSignature(assetId: string): number {
  let hash = 0;
  for (let i = 0; i < assetId.length; i++) {
    const char = assetId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns an Unsplash source URL for a given infrastructure type + asset ID.
 *
 * @param assetType  - The infrastructure type string (e.g. "Bridge", "Road", "Hospital")
 * @param assetId    - The unique asset ID used to seed the photo selection
 * @param width      - Desired image width in pixels (default 600)
 * @param height     - Desired image height in pixels (default 400)
 */
export function getAssetImageUrl(
  assetType: string,
  assetId: string,
  width = 600,
  height = 400,
): string {
  const keywords = TYPE_KEYWORDS[assetType] ?? FALLBACK_KEYWORDS;
  const sig = deriveSignature(assetId);
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords)}&sig=${sig}`;
}

/**
 * A smaller thumbnail variant (160x120) for table rows.
 */
export function getAssetThumbnailUrl(assetType: string, assetId: string): string {
  return getAssetImageUrl(assetType, assetId, 160, 120);
}
