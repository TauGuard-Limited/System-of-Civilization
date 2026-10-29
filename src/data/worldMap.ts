// Simplified world map country paths (Natural Earth-inspired, simplified for web)
// Each country has: id, name, region, and SVG path data (projected equirectangular)

export interface CountryShape {
  id: string;
  name: string;
  region: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania';
  path: string;
  center: [number, number]; // [x, y] in SVG coordinates for label placement
}

// Map is 1000x500 viewBox, equirectangular projection
// Longitude: -180..180 → x: 0..1000
// Latitude: 90..-90 → y: 0..500

export const COUNTRIES: CountryShape[] = [
  // North America
  {
    id: 'CA', name: 'Canada', region: 'americas',
    center: [220, 110],
    path: 'M 130 80 L 180 70 L 230 75 L 280 80 L 320 90 L 340 110 L 330 130 L 310 140 L 280 145 L 250 140 L 220 145 L 190 150 L 160 145 L 140 130 L 130 110 Z',
  },
  {
    id: 'US', name: 'United States', region: 'americas',
    center: [215, 175],
    path: 'M 140 150 L 190 150 L 230 155 L 270 155 L 300 160 L 310 175 L 300 190 L 280 195 L 250 195 L 220 200 L 190 200 L 160 195 L 145 185 L 140 170 Z M 100 130 L 130 125 L 140 140 L 130 155 L 110 150 Z',
  },
  {
    id: 'MX', name: 'Mexico', region: 'americas',
    center: [195, 220],
    path: 'M 160 200 L 200 200 L 230 210 L 240 225 L 235 240 L 220 245 L 200 240 L 185 230 L 170 220 Z',
  },
  // Central/South America
  {
    id: 'BR', name: 'Brazil', region: 'americas',
    center: [320, 310],
    path: 'M 290 270 L 330 265 L 360 280 L 370 310 L 365 340 L 345 360 L 320 365 L 295 355 L 280 330 L 275 300 L 280 280 Z',
  },
  {
    id: 'AR', name: 'Argentina', region: 'americas',
    center: [295, 395],
    path: 'M 280 360 L 305 365 L 315 390 L 310 420 L 300 440 L 285 445 L 275 425 L 270 400 L 272 380 Z',
  },
  {
    id: 'CO', name: 'Colombia', region: 'americas',
    center: [260, 260],
    path: 'M 245 245 L 270 245 L 280 260 L 275 275 L 260 280 L 248 270 Z',
  },
  {
    id: 'CL', name: 'Chile', region: 'americas',
    center: [268, 400],
    path: 'M 265 355 L 275 360 L 278 390 L 275 420 L 270 440 L 263 435 L 260 410 L 262 380 Z',
  },
  // Europe
  {
    id: 'GB', name: 'United Kingdom', region: 'europe',
    center: [478, 130],
    path: 'M 472 120 L 482 118 L 486 128 L 484 140 L 476 142 L 472 132 Z',
  },
  {
    id: 'FR', name: 'France', region: 'europe',
    center: [490, 155],
    path: 'M 480 145 L 500 143 L 505 155 L 502 168 L 490 172 L 480 165 L 478 155 Z',
  },
  {
    id: 'DE', name: 'Germany', region: 'europe',
    center: [508, 138],
    path: 'M 500 128 L 516 126 L 520 138 L 518 150 L 508 152 L 500 145 Z',
  },
  {
    id: 'ES', name: 'Spain', region: 'europe',
    center: [475, 172],
    path: 'M 465 165 L 485 163 L 490 175 L 482 182 L 468 180 L 463 172 Z',
  },
  {
    id: 'IT', name: 'Italy', region: 'europe',
    center: [512, 168],
    path: 'M 508 158 L 518 156 L 522 168 L 518 180 L 512 185 L 508 175 Z',
  },
  {
    id: 'PL', name: 'Poland', region: 'europe',
    center: [528, 132],
    path: 'M 520 124 L 538 122 L 542 134 L 536 142 L 522 140 L 518 132 Z',
  },
  {
    id: 'CZ', name: 'Czech Republic', region: 'europe',
    center: [518, 145],
    path: 'M 510 140 L 526 140 L 528 148 L 520 152 L 510 150 Z',
  },
  {
    id: 'UA', name: 'Ukraine', region: 'europe',
    center: [555, 140],
    path: 'M 540 130 L 570 128 L 578 140 L 572 152 L 555 155 L 542 148 L 538 140 Z',
  },
  {
    id: 'SE', name: 'Sweden', region: 'europe',
    center: [518, 95],
    path: 'M 512 75 L 522 72 L 526 90 L 524 110 L 518 118 L 512 105 L 510 88 Z',
  },
  {
    id: 'NO', name: 'Norway', region: 'europe',
    center: [502, 85],
    path: 'M 495 70 L 510 68 L 512 85 L 508 100 L 500 105 L 495 90 Z',
  },
  {
    id: 'FI', name: 'Finland', region: 'europe',
    center: [540, 85],
    path: 'M 532 70 L 548 68 L 552 85 L 548 100 L 538 102 L 532 90 Z',
  },
  {
    id: 'RO', name: 'Romania', region: 'europe',
    center: [545, 155],
    path: 'M 535 148 L 555 148 L 558 160 L 548 165 L 535 162 Z',
  },
  {
    id: 'GR', name: 'Greece', region: 'europe',
    center: [535, 178],
    path: 'M 528 170 L 542 168 L 545 180 L 538 188 L 528 185 Z',
  },
  // Africa
  {
    id: 'EG', name: 'Egypt', region: 'africa',
    center: [560, 210],
    path: 'M 548 198 L 572 196 L 578 210 L 572 222 L 555 225 L 548 215 Z',
  },
  {
    id: 'NG', name: 'Nigeria', region: 'africa',
    center: [498, 262],
    path: 'M 488 252 L 508 250 L 512 265 L 505 275 L 492 272 Z',
  },
  {
    id: 'ZA', name: 'South Africa', region: 'africa',
    center: [540, 380],
    path: 'M 520 365 L 555 362 L 562 380 L 552 395 L 530 398 L 520 385 Z',
  },
  {
    id: 'KE', name: 'Kenya', region: 'africa',
    center: [575, 280],
    path: 'M 568 270 L 582 268 L 586 282 L 578 290 L 568 285 Z',
  },
  {
    id: 'MA', name: 'Morocco', region: 'africa',
    center: [468, 200],
    path: 'M 458 192 L 478 190 L 482 202 L 475 210 L 460 208 Z',
  },
  {
    id: 'ET', name: 'Ethiopia', region: 'africa',
    center: [582, 260],
    path: 'M 572 250 L 592 248 L 596 262 L 588 272 L 574 268 Z',
  },
  // Middle East
  {
    id: 'TR', name: 'Turkey', region: 'asia',
    center: [565, 170],
    path: 'M 548 162 L 582 160 L 588 172 L 578 180 L 552 178 L 548 170 Z',
  },
  {
    id: 'SA', name: 'Saudi Arabia', region: 'asia',
    center: [595, 220],
    path: 'M 582 208 L 608 205 L 615 220 L 608 235 L 590 232 L 582 220 Z',
  },
  {
    id: 'IR', name: 'Iran', region: 'asia',
    center: [615, 185],
    path: 'M 600 172 L 630 170 L 638 185 L 630 198 L 608 195 L 600 185 Z',
  },
  {
    id: 'IL', name: 'Israel', region: 'asia',
    center: [568, 200],
    path: 'M 565 195 L 572 193 L 574 202 L 568 205 Z',
  },
  // Asia
  {
    id: 'RU', name: 'Russia', region: 'asia',
    center: [700, 95],
    path: 'M 560 70 L 650 60 L 750 65 L 850 75 L 900 90 L 895 115 L 850 125 L 780 128 L 700 125 L 620 120 L 580 115 L 560 100 Z',
  },
  {
    id: 'CN', name: 'China', region: 'asia',
    center: [770, 185],
    path: 'M 720 155 L 790 150 L 830 165 L 835 190 L 815 210 L 780 215 L 745 205 L 725 190 L 720 170 Z',
  },
  {
    id: 'IN', name: 'India', region: 'asia',
    center: [680, 225],
    path: 'M 660 195 L 700 190 L 715 210 L 710 235 L 690 255 L 670 250 L 658 230 L 655 210 Z',
  },
  {
    id: 'JP', name: 'Japan', region: 'asia',
    center: [855, 175],
    path: 'M 848 160 L 862 158 L 868 172 L 862 188 L 852 190 L 846 178 Z',
  },
  {
    id: 'KR', name: 'South Korea', region: 'asia',
    center: [832, 175],
    path: 'M 826 168 L 838 166 L 842 178 L 835 184 L 826 180 Z',
  },
  {
    id: 'ID', name: 'Indonesia', region: 'asia',
    center: [790, 285],
    path: 'M 755 278 L 825 275 L 835 288 L 820 295 L 770 292 L 755 285 Z',
  },
  {
    id: 'TH', name: 'Thailand', region: 'asia',
    center: [745, 235],
    path: 'M 738 220 L 752 218 L 756 235 L 750 250 L 740 248 L 736 235 Z',
  },
  {
    id: 'VN', name: 'Vietnam', region: 'asia',
    center: [762, 235],
    path: 'M 756 218 L 768 216 L 772 235 L 768 252 L 760 248 L 756 232 Z',
  },
  {
    id: 'PK', name: 'Pakistan', region: 'asia',
    center: [648, 200],
    path: 'M 635 188 L 662 185 L 668 200 L 660 212 L 640 210 L 635 200 Z',
  },
  {
    id: 'KZ', name: 'Kazakhstan', region: 'asia',
    center: [640, 135],
    path: 'M 610 120 L 670 118 L 680 135 L 670 150 L 625 148 L 610 138 Z',
  },
  {
    id: 'MY', name: 'Malaysia', region: 'asia',
    center: [755, 268],
    path: 'M 745 262 L 765 260 L 770 270 L 760 275 L 745 272 Z',
  },
  // Oceania
  {
    id: 'AU', name: 'Australia', region: 'oceania',
    center: [820, 365],
    path: 'M 775 340 L 855 335 L 875 355 L 868 380 L 835 395 L 795 390 L 775 370 Z',
  },
  {
    id: 'NZ', name: 'New Zealand', region: 'oceania',
    center: [905, 400],
    path: 'M 895 385 L 912 382 L 918 398 L 910 412 L 898 408 L 893 395 Z',
  },
];

// Map from country id to display name used in the app
export const COUNTRY_NAME_TO_ID: Record<string, string> = {
  'Global': 'GLOBAL',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Ukraine': 'UA',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Australia': 'AU',
  'Canada': 'CA',
};

export const COUNTRY_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_ID).map(([k, v]) => [v, k])
);
