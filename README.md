# PPT-Creator — Tesla PPTX Designer Agent

A Nova Sidekick agent that generates Tesla-branded PowerPoint presentations with gradient text fills, dynamic layouts, cinematic backgrounds, and icon cards.

## Quick Start

### 1. Clone this repo
```bash
git clone https://github.com/pgillett2804/PPT-Creator.git
```

### 2. Open as your Nova workspace
Open the cloned `PPT-Creator` folder as your workspace in Nova.

### 3. Install dependencies
Open Sidekick and ask it to run:
```
npm install jszip --prefix C:\Users\YOUR_USERNAME\AppData\Local\Temp\opencode
```

### 4. Set up your template
You need the **Customer Connect.pptx** file on your Desktop. This is used as the base template (themes, slide masters, fonts).

Then ask Sidekick to extract the background images:
> "Run the extract_images.js script to set up background images from Customer Connect.pptx"

### 5. Create a presentation
Just tell Sidekick what you need:
> "Build me a compliance training presentation about [topic]"
> "Create a 20-slide deck covering [subject]"
> "Make a presentation from this document: [attach file]"

Sidekick will use the PPTX Designer agent automatically.

---

## What's Included

| File | Purpose |
|---|---|
| `.opencode/agents/pptx-designer.md` | Agent persona — the full design system, rules, and patterns |
| `.opencode/skills/pptx-builder/build_template.js` | Working build script with all XML helpers and 40-slide example |
| `.opencode/skills/pptx-builder/extract_content.js` | Extracts text + speaker notes from any PPTX |
| `.opencode/skills/pptx-builder/extract_images.js` | Extracts background images from template PPTX |
| `.opencode/skills/pptx-builder/README.md` | Quick reference for colors, fonts, and setup |

---

## Design System

### Fonts
- **Titles**: Universal Sans Display 430
- **Body**: Universal Sans Text

### Color Palette
| Color | Hex | Usage |
|---|---|---|
| Gold gradient | `#B26D15` | Title gradient endpoint |
| Warm gold | `#E2B48D` | Accent callouts |
| Gold accent | `#D8AA6E` | Dividers, sub-heads |
| Fresh green | `#6BCB77` | Positive indicators |
| Coral red | `#E8665D` | Negative indicators |
| Light gray | `#D4D4D4` | Body text |

### Gradient Text (45% alpha)
Titles use radial gradient fills (white → gold) for a dynamic, premium look.

### 5 Layout Types
1. **Statement** — Big centered title for section dividers
2. **Content Left** — Title + body for bullet points and steps
3. **Icon Cards** — Emoji cards in gradient rounded rects
4. **Split Comparison** — Two-column A vs B layouts
5. **Big Number** — Huge stat/number for impact moments

### Scale Contrast Rule
Every slide must have at least a **2.5:1 ratio** between the largest and smallest text. No flat, uniform sizing.

---

## Creating a New Visual Style

You don't need to start from scratch. The framework (XML helpers, layout types, build process) stays the same — only the **style variables** change.

### What to provide:
1. **1-2 reference PPTX files** showing the visual style you want
2. **Topic and content** for the new presentation

### What Sidekick will do:
1. Extract the style DNA from your reference files (fonts, colors, gradients, spacing)
2. Update the design system constants
3. Generate slides using the new style

This takes **minutes, not hours** — the hard part (the build framework) is already done.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "jszip not found" | Run `npm install jszip` in the temp directory |
| "Customer Connect.pptx not found" | Place the template file on your Desktop |
| "EBUSY: file locked" | Close the output file in PowerPoint before rebuilding |
| Fonts look wrong | Install "Universal Sans Display 430" and "Universal Sans Text" on your machine |
| Background images missing | Run `extract_images.js` to populate the cc_images folder |

---

## License
Internal Tesla use only.
