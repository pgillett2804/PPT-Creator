# PPTX Builder Skill

Build Tesla-branded PowerPoint presentations from raw OOXML.

## When to use
When the user asks to create, redesign, or generate a PowerPoint presentation.

## Prerequisites
- Node.js available (check `where.exe node`)
- `jszip` npm package installed in working directory
- Customer Connect PPTX template at: `C:\Users\pgillett\OneDrive - Tesla\Desktop\Customer Connect.pptx`
- Background images extracted to: `C:\Users\pgillett\AppData\Local\Temp\opencode\cc_images\`

## Setup (if prerequisites missing)
```powershell
# Install jszip
npm install jszip --prefix C:\Users\pgillett\AppData\Local\Temp\opencode

# Extract background images (run extract_images.js from cc_images setup)
```

## Reference implementation
`build_template.js` in this directory contains the complete working build script with:
- All XML helper functions (gradTb, tb, iconCard, divLine, etc.)
- All background layer functions (bgLeft, bgCenter, BG_BLACK, BG_IMG, etc.)
- All 5 layout types (Statement, Content Left, Icon Cards, Split, Big Number)
- Full slide assembly and packaging logic

## How to create a new presentation
1. Read the agent instructions at `.opencode/agents/pptx-designer.md`
2. Copy `build_template.js` as a starting point
3. Replace the slide content (s1-s40 functions) with new content
4. Adjust number of slides, layout types, and background image assignments
5. Run with `node build_script.js` from the working directory

## Key XML patterns
All XML patterns are documented in the agent file. The most important ones:
- **RADIAL gradient text fill** — for titles (white 45% → gold)
- **LEFT_GRAD overlay** — signature Customer Connect left fade
- **BOTTOM_GRAD overlay** — for centered content slides
- **ACCENT_BAR** — right-edge vertical glowing bar
- **iconCard** — rounded rect with emoji + label

## Color palette
| Hex | Role |
|---|---|
| `#B26D15` | Gold gradient endpoint |
| `#E2B48D` | Warm gold accents |
| `#D8AA6E` | Gold dividers/sub-heads |
| `#6BCB77` | Fresh green (positive) |
| `#E8665D` | Coral red (negative) |
| `#D4D4D4` | Light gray body text |
