# Interactive World Map — Implementation Summary

## What Was Added

A new **World Map** component that displays real-time symbolic coherence scores (κ(t)) for each country on an interactive SVG map.

## Key Features

### 1. Interactive SVG World Map
- **40+ countries** rendered as simplified SVG paths
- **No external dependencies** — fully self-contained
- **Hover tooltips** showing country details
- **Click to select** — updates global country context
- **Color-coded** by coherence status:
  - 🔵 **Blue** = Hypo-coherence (κ < 0.05)
  - 🟢 **Green** = Homeostasis (0.05 ≤ κ ≤ 0.35)
  - 🔴 **Red** = Hyper-coherence (κ > 0.35)
  - ⚫ **Gray** = No data

### 2. Real-Time Metrics Per Country
Each country displays:
- **κ(t) score** — current coherence value
- **Entropy H*** — narrative diversity
- **Total articles** — number of ingested items
- **Trend indicator** — ↑ up, ↓ down, → stable
- **Status** — homeostasis / hypo / hyper
- **Last updated** — timestamp of latest data

### 3. Global Statistics Bar
Top-level metrics across all countries:
- Global average κ(t)
- Active countries count
- Homeostasis / Hypo / Hyper counts
- Total articles ingested

### 4. Country Details Panel
When a country is selected:
- Shows detailed κ(t), entropy, articles, snapshots
- "Back to Global" button to reset
- Empty state if no data available

### 5. Integration with Existing System
- **Reads from** `kappaHistory` (global context)
- **Updates** `activeCountry` when clicked
- **Country-scoped** — only shows data for selected country
- **Live updates** — reflects new data from Live Ingestion

## How It Works

### Data Flow
```
Live Ingestion → κ(t) snapshots → Global Context → World Map
                                      ↓
                              Filtered by country
                                      ↓
                          Aggregated metrics per country
```

### Color Scale Algorithm
```typescript
if (κ < κ_min) {
  // Blue gradient: intensity based on distance from threshold
  color = interpolate(blue, darkBlue, intensity)
} else if (κ > κ_max) {
  // Red gradient: intensity based on excess
  color = interpolate(red, darkRed, intensity)
} else {
  // Green gradient: normalized within range
  color = interpolate(green, darkGreen, normalized)
}
```

### Trend Calculation
Compares recent 3 snapshots vs older 3 snapshots:
- `recentAvg - olderAvg > 0.01` → ↑ up
- `recentAvg - olderAvg < -0.01` → ↓ down
- Otherwise → → stable

## Usage

### Step 1: Collect Data
Go to **Live Ingestion**, select feeds, click "Fetch Live Data Now". Each fetch creates a κ(t) snapshot tagged with the active country.

### Step 2: View Map
Navigate to **World Map** in the sidebar. Countries with data will be colored. Hover to see details.

### Step 3: Explore
- **Hover** any country to see κ(t), entropy, articles, status
- **Click** a country to select it (updates top-right selector)
- **Switch country** via top-right dropdown or map click
- **View details** in the panel below the map

### Step 4: Analyze
- Compare coherence across regions
- Identify hypo-coherent areas (fragmentation)
- Spot hyper-coherent zones (synchronization)
- Track trends over time

## Technical Implementation

### Files Created
- `src/components/WorldMap.tsx` — Main component (350+ lines)
- `src/data/worldMap.ts` — Country SVG paths and metadata

### Files Modified
- `src/App.tsx` — Added WorldMap to navigation and routing
- `src/components/Dashboard.tsx` — Added "Open Map" CTA button

### Dependencies
- **None** — Uses only React, Tailwind CSS, and Lucide icons
- **No external map libraries** — Pure SVG rendering

### Performance
- **Instant load** — No external data files or tiles
- **Efficient rendering** — useMemo for metric calculations
- **Smooth interactions** — CSS transitions for hover effects
- **Responsive** — Scales to any viewport size

## Data Requirements

For countries to appear on the map:
1. **Live Ingestion must be run** with feeds from that country
2. **Country selector** must match the feed's country tag
3. **At least 2 articles** needed for κ(t) calculation
4. **Snapshots accumulate** — more fetches = richer data

### Custom Feeds
Add country-specific feeds in **Settings & API**:
- Assign each feed to a country
- Feeds appear in Live Ingestion when that country is selected
- Data populates the map for that country

## Visual Design

### Map Layout
- **1000×500 viewBox** — equirectangular projection
- **Simplified paths** — recognizable but not geographically precise
- **Grid lines** — subtle reference lines for orientation
- **Pulse animation** — active countries have animated dots

### Tooltip Design
- **Positioned** near cursor (with boundary detection)
- **Dark theme** — matches app aesthetic
- **Compact layout** — 4 key metrics + timestamp
- **Color-coded status** — matches country fill color

### Legend
- **4 color categories** with thresholds
- **Centered below map** — always visible
- **Clear labels** — hypo / homeostasis / hyper / no data

## Integration Points

### With Live Ingestion
- Reads `kappaHistory` from global context
- Each snapshot includes `country` field
- Map aggregates by country automatically

### With Reports
- Same data source (`kappaHistory`)
- Reports can export map data per country
- Consistent country naming across views

### With Settings
- Custom feeds tagged with country
- Country selector syncs across all views
- Thresholds are global (not per-country yet)

## Future Enhancements

Potential additions:
- **Zoom/pan** — mouse wheel zoom, drag to pan
- **Time slider** — animate κ(t) evolution over time
- **Comparison mode** — side-by-side country comparison
- **Heat map overlay** — intensity gradient instead of discrete colors
- **Region grouping** — aggregate by continent/region
- **Export map** — screenshot or SVG export
- **Per-country thresholds** — calibrate κ_min/κ_max per country

## Limitations

- **Simplified geography** — paths are approximate, not survey-grade
- **No zoom/pan** — fixed viewport (could be added)
- **Jaccard proxy** — coherence values are lower than with real embeddings
- **Country bias** — only countries with configured feeds appear
- **Static thresholds** — κ_min=0.05, κ_max=0.35 are global defaults

## Design Principles Preserved

✓ **Diagnostic, not doctrinal** — Shows patterns, not judgments  
✓ **Transparent methodology** — Legend explains color scale  
✓ **Country-scoped** — Respects geopolitical boundaries  
✓ **Non-coercive** — Informational only, no enforcement  
✓ **Provenance preserved** — Each metric traceable to sources  

---

**Status**: Fully functional, ready for demonstration  
**Next**: Connect to real embedding models for accurate κ(t) values
