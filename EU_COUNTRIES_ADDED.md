# EU Countries Added - Complete List

## Overview
The application now supports **all 27 EU member states** plus additional European countries and major global nations. The country selector is organized into logical groups for easy navigation.

## EU Member States (27 countries)

All EU member states are now available in the country selector:

1. **Austria** (040)
2. **Belgium** (056)
3. **Bulgaria** (100)
4. **Croatia** (191)
5. **Cyprus** (196)
6. **Czech Republic** (203)
7. **Denmark** (208)
8. **Estonia** (233)
9. **Finland** (246)
10. **France** (250)
11. **Germany** (276)
12. **Greece** (300)
13. **Hungary** (348)
14. **Ireland** (372)
15. **Italy** (380)
16. **Latvia** (428)
17. **Lithuania** (440)
18. **Luxembourg** (442)
19. **Malta** (470)
20. **Netherlands** (528)
21. **Poland** (616)
22. **Portugal** (620)
23. **Romania** (642)
24. **Slovakia** (703)
25. **Slovenia** (705)
26. **Spain** (724)
27. **Sweden** (752)

## Other European Countries (14 countries)

Additional European nations for comprehensive coverage:

- **United Kingdom** (826)
- **Switzerland** (756)
- **Norway** (578)
- **Iceland** (352)
- **Ukraine** (804)
- **Serbia** (688)
- **Albania** (008)
- **North Macedonia** (807)
- **Montenegro** (499)
- **Bosnia and Herzegovina** (070)
- **Moldova** (498)
- **Belarus** (112)
- **Russia** (643)
- **Turkey** (792)

## Americas (5 countries)

- **United States** (840)
- **Canada** (124)
- **Mexico** (484)
- **Brazil** (076)
- **Argentina** (032)

## Asia-Pacific (6 countries)

- **Japan** (392)
- **China** (156)
- **India** (356)
- **South Korea** (410)
- **Indonesia** (360)
- **Australia** (036)

## Middle East & Africa (6 countries)

- **Saudi Arabia** (682)
- **Israel** (376)
- **Egypt** (818)
- **Nigeria** (566)
- **Kenya** (404)
- **South Africa** (710)

## Total Coverage

**58 countries** across all major regions:
- 27 EU member states
- 14 other European countries
- 5 American countries
- 6 Asia-Pacific countries
- 6 Middle East & African countries

## Implementation Details

### Files Modified

1. **src/data/countries.ts**
   - Added all EU countries to `APP_COUNTRY_TO_CODE` mapping
   - Added corresponding ISO 3166-1 numeric codes
   - Organized by region for clarity

2. **src/App.tsx**
   - Updated country selector dropdown
   - Organized into `<optgroup>` sections:
     - EU Member States
     - Other European Countries
     - Americas
     - Asia-Pacific
     - Middle East & Africa

3. **src/components/Settings.tsx**
   - Updated country list for custom feed configuration
   - Maintains consistency with main selector

### ISO Code Mapping

Each country is mapped to its ISO 3166-1 numeric code, which corresponds to the Natural Earth TopoJSON data used by the world map:

```typescript
export const APP_COUNTRY_TO_CODE: Record<string, string> = {
  'Austria': '040',
  'Belgium': '056',
  'Bulgaria': '100',
  // ... all 58 countries
};
```

### World Map Integration

The world map automatically displays data for any country that:
1. Has RSS feeds configured in Live Ingestion
2. Has collected κ(t) measurements
3. Matches an ISO code in the mapping

Countries without data appear in gray on the map.

## Usage

### Selecting a Country

1. Use the dropdown in the top-right header
2. Choose from organized groups (EU, Europe, Americas, etc.)
3. All views automatically filter to show data for that country

### Configuring Country-Specific Feeds

1. Go to **Settings & API**
2. Add custom RSS feeds
3. Assign each feed to a specific country
4. Data from that feed will be attributed to the selected country

### Viewing Country Data

- **Live Ingestion**: Shows articles from feeds configured for the active country
- **Coherence Engine**: Displays κ(t) measurements for the active country
- **Narrative Dynamics**: Analyzes topics from the active country's articles
- **Homeostasis Analyzer**: Classifies the active country's state
- **World Map**: Highlights the active country with real-time κ(t) data
- **Reports**: Exports data filtered by the active country

## Benefits

1. **Comprehensive EU Coverage**: All 27 member states supported
2. **Regional Organization**: Easy navigation through grouped countries
3. **Granular Analysis**: Compare coherence across individual EU nations
4. **Cross-Border Studies**: Analyze narrative flow between neighboring countries
5. **Policy Research**: Study coherence patterns in specific political regions
6. **Media Analysis**: Compare how different countries' media covers similar topics

## Example Use Cases

### EU Policy Research
Monitor coherence across EU member states during major policy debates (e.g., climate policy, migration, economic reform).

### Regional Comparison
Compare narrative coherence between Western Europe (Germany, France, Netherlands) and Eastern Europe (Poland, Czech Republic, Hungary).

### Crisis Response Analysis
Track how quickly different EU countries synchronize their narratives during crises (pandemics, conflicts, economic shocks).

### Media Landscape Study
Analyze coherence patterns in countries with different media systems (public broadcasting vs. commercial media dominance).

### Cross-Border Narrative Flow
Study how narratives propagate between neighboring countries (e.g., Germany-Austria, France-Belgium, Poland-Germany).

## Technical Notes

- All country codes use ISO 3166-1 numeric standard
- Map data from Natural Earth (110m resolution)
- Country boundaries rendered via react-simple-maps
- Real-time κ(t) calculation per country
- Persistent storage in localStorage
- Export includes country metadata in reports

## Future Enhancements

Potential additions:
- Sub-national regions (US states, German Länder, etc.)
- City-level analysis for major metropolitan areas
- Language-based grouping (e.g., all German-speaking regions)
- Economic bloc grouping (EU, NATO, G7, etc.)
- Custom country groupings for specific research projects
