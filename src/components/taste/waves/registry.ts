// Wave styles for the homepage hero sea. Contract: ./WAVES.md
// Add a style: create ./<Name>.astro, import it here, add one entry. The id is the URL slug
// (/taste/waves/<id>) and the value BoatHero's `sea` prop takes.
import WaveBackground from '../../WaveBackground.astro'
import OceanSwell from './OceanSwell.astro'
import SwellLines from './SwellLines.astro'
import StormChop from './StormChop.astro'
import Caustics from './Caustics.astro'
import GlassWater from './GlassWater.astro'
import MoonlitSea from './MoonlitSea.astro'
import MeshSea from './MeshSea.astro'
import MeshGrid from './MeshGrid.astro'
import MeshHalftone from './MeshHalftone.astro'
import Halftone from './Halftone.astro'
import AsciiOcean from './AsciiOcean.astro'
import AsciiTokens from './AsciiTokens.astro'
import Oscilloscope from './Oscilloscope.astro'
import ContourFlow from './ContourFlow.astro'

import MarkSwell from './MarkSwell.astro'
import MarkPond from './MarkPond.astro'
import MarkInterference from './MarkInterference.astro'
import MarkTide from './MarkTide.astro'
import MarkDepth from './MarkDepth.astro'
import FlowField from './FlowField.astro'
import LiquidChrome from './LiquidChrome.astro'
import InkWater from './InkWater.astro'
import AuroraSea from './AuroraSea.astro'
import CodeSea from './CodeSea.astro'
export type WaveGroup = 'Live' | 'Realistic' | 'Digital' | 'Logomark' | 'Experimental'

export interface WaveStyle {
  /** Label on the viewer button */
  name: string
  group: WaveGroup
  /** An Astro component whose root is .wave-background (see WAVES.md) */
  component: any
  /** One or two sentences shown under the viewer bar */
  note: string
}

/** Viewer order of the groups */
export const waveGroups: WaveGroup[] = ['Live', 'Realistic', 'Digital', 'Logomark', 'Experimental']

export const waveStyles: Record<string, WaveStyle> = {
  current: {
    name: 'Current (live)',
    group: 'Live',
    component: WaveBackground,
    note: 'The live WaveBackground: three scrolling SVG swells, stars, grid and particles.',
  },
  'ocean-swell': {
    name: 'Ocean swell',
    group: 'Realistic',
    component: OceanSwell,
    note: 'Canvas Gerstner swells in three depth layers, darker with depth, foam catching light on the crests.',
  },
  'mesh-sea': {
    name: 'Mesh sea',
    group: 'Digital',
    component: MeshSea,
    note: 'A perspective wireframe ocean: a world-space vertex grid displaced by layered swells, fading into fog at the horizon, with the surface row and two rows behind it picked out in white.',
  },
  'moonlit-sea': {
    name: 'Moonlit sea',
    group: 'Realistic',
    component: MoonlitSea,
    note: 'WebGL night sea in perspective: a moon glitter path of thousands of tiny glints twinkling toward you, the boat on the moonlit rim of the near swell.',
  },
  'mark-swell': { name: 'Mark swell', group: 'Logomark', component: MarkSwell, note: 'Travelling swells through a grid of whole Buoy marks: marks grow and brighten on the crests, settle in the troughs; the front row is the water the boat rides.' },
  'mark-pond': { name: 'Mark pond', group: 'Logomark', component: MarkPond, note: 'Rings of marks spread from where the boat lands and from its wake, like drops in a pond.' },
  'mark-interference': { name: 'Mark interference', group: 'Logomark', component: MarkInterference, note: 'Three drifting ripple sources whose rings cross; marks swell where crests meet and fade where they cancel.' },
  'mark-tide': { name: 'Mark tide', group: 'Logomark', component: MarkTide, note: 'Rows of marks follow a leaning tide wave, each row a beat later and a step behind; the front row is the shoreline the boat rides.' },
  'mark-depth': { name: 'Mark depth', group: 'Logomark', component: MarkDepth, note: 'A perspective field of marks to a horizon, smaller and fainter with distance, bobbing like buoys scattered across an ocean.' },
  'flow-field': { name: 'Flow field', group: 'Experimental', component: FlowField, note: 'Thousands of fine particles stream along a curl-noise field; the water line is where the stream runs densest.' },
  'liquid-chrome': { name: 'Liquid chrome', group: 'Experimental', component: LiquidChrome, note: 'WebGL liquid metal with a rolled lip, reflecting the deep ground, a bright horizon strip and a small warm light.' },
  'ink-water': { name: 'Ink water', group: 'Experimental', component: InkWater, note: 'Domain-warped ink plumes drift slowly under a soft water line (WebGL).' },
  'aurora-sea': { name: 'Aurora sea', group: 'Experimental', component: AuroraSea, note: 'Gradient-mesh ribbons of blue and teal light shift under a crisp water line, like aurora reflected on the sea (WebGL).' },
  'code-sea': { name: 'Code sea', group: 'Experimental', component: CodeSea, note: 'Rows of real design-system code ride the swell; hardcoded values resolve into tokens as the boat passes.' },
  'mesh-grid': {
    name: 'Mesh grid',
    group: 'Digital',
    component: MeshGrid,
    note: 'The same perspective wireframe with no highlight lines, only the grid; the boat rides its front row.',
  },
  'mesh-halftone': {
    name: 'Mesh halftone',
    group: 'Digital',
    component: MeshHalftone,
    note: 'The perspective ocean mesh printed as halftone dots at its vertices: crests print bigger, dots shrink and fade toward the horizon.',
  },
  halftone: {
    name: 'Halftone',
    group: 'Digital',
    component: Halftone,
    note: 'The sea as a printed dot screen: dot size follows the swell height, fine toward the horizon, a crisp-edged body under the line the boat rides.',
  },
  'ascii-ocean': {
    name: 'ASCII ocean',
    group: 'Digital',
    component: AsciiOcean,
    note: 'The sea as a grid of JetBrains Mono characters whose density follows the swell; the top glyph of each column sits at the exact surface.',
  },
  'ascii-tokens': {
    name: 'ASCII tokens',
    group: 'Digital',
    component: AsciiTokens,
    note: 'Whole letters of real design tokens draw the sea in three layers: back waves, a compact band the boat rides, and sparse front waves.',
  },
  oscilloscope: {
    name: 'Oscilloscope',
    group: 'Digital',
    component: Oscilloscope,
    note: 'Stacked waveform traces packed toward the horizon, carrier packets running through them; the front trace is the surface.',
  },
  'contour-flow': {
    name: 'Contour flow',
    group: 'Digital',
    component: ContourFlow,
    note: 'A live depth chart: marching-squares isolines of a moving height field under the surface line, one stroke weight.',
  },
  'glass-water': {
    name: 'Glass water',
    group: 'Realistic',
    component: GlassWater,
    note: 'WebGL glassy water seen close: long slow swells bend the reflected sky gradient (fresnel), with soft refracted light under the near swell.',
  },
  'caustics': {
    name: 'Caustics',
    group: 'Realistic',
    component: Caustics,
    note: 'WebGL view down through clear water: caustic light crawls over a deep seabed and refracts with the swell; the surface is a soft bright line the boat rides.',
  },
  'storm-chop': {
    name: 'Storm chop',
    group: 'Realistic',
    component: StormChop,
    note: 'Canvas wind-driven sea: short steep waves in three depth layers, spray tearing off the crests and foam streaks dragged across the water.',
  },
  'swell-lines': {
    name: 'Swell lines',
    group: 'Realistic',
    component: SwellLines,
    note: 'Canvas engraving of the sea: fine parallel contour strokes of one weight follow the swells in perspective, crowding at the horizon, nearer lines hiding farther ones like an etching.',
  },
}
