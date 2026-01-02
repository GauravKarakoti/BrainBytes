# Material You + Rosé Pine Design Notes

## Palette

| Token | Light (HSL) | Dark (HSL) | Usage |
| --- | --- | --- | --- |
| `primary` | `343 76% 68%` | `343 70% 72%` | CTA buttons, key accents |
| `secondary` | `189 43% 73%` | `189 38% 62%` | Educational highlights, secondary CTAs |
| `highlight` | `35 87% 72%` | `35 74% 60%` | Illustrations, celebratory surfaces |
| `super` | `267 53% 75%` | `267 53% 68%` | Supplemental callouts |
| `surface` | `30 44% 93%` | `247 23% 16%` | Default cards, panels, sheets |
| `surface-variant` | `26 32% 88%` | `248 23% 22%` | Tonal fills, list backgrounds |
| `outline` | `255 18% 45%` | `248 20% 55%` | Borders, separators |

### Elevation helpers

| Utility | Shadow |
| --- | --- |
| `.elevation-1` | `0 1px 2px` + `0 3px 8px` |
| `.elevation-2` | `0 4px 12px` + `0 12px 32px` |
| `.elevation-3` | `0 8px 20px` + `0 20px 46px` |

## Component touchpoints

- Buttons, inputs, pills, checkbox, dialog, drawer, sheet, popover, and separator now follow the Material You radius and tonal surface guidelines.
- Landing hero, header, footer, and feature sections use elevated surfaces, consistent gutters, and Rosé Pine gradients.
- Metrics retain scroll-driven motion while adopting tonal backgrounds and calmer typography.
- Reasons list and course picker use tonal containers with outline emphasis for better hierarchy.

## Dark mode

Dark tokens mirror Rosé Pine Moon values. Verify high-contrast focus rings (`ring-ring` + `ring-offset-surface`) in QA passes across keyboard flows.

## Follow-up

- Audit dashboard/auth flows for leftover legacy greens.
- Consider adding motion-reduced variants for decorative hero illustrations.
