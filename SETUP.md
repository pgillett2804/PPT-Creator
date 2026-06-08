# How to Use the PPTX Designer

## What is this?
A tool that turns raw learning content into polished Tesla-branded training presentations. You give it content, it gives you a finished PowerPoint.

It works through **Nova Sidekick** — the AI chat assistant inside Nova.

---

## First-Time Setup (5 minutes)

### 1. Install Git
- Download from https://git-scm.com/download/win
- Install with default settings
- You only need to do this once

### 2. Clone the project
- Open **PowerShell** (search for it in Windows Start)
- Type this and press Enter:
```
git clone https://github.com/pgillett2804/PPT-Creator.git
```
- This creates a folder called `PPT-Creator` in your current directory
- Note where it saved (usually `C:\Users\YOURNAME\PPT-Creator`)

### 3. Open in Nova
- Open the **Nova** desktop app
- Change your workspace to the `PPT-Creator` folder you just cloned
- You should see `.opencode` folder in the file list

### 4. Install the required package
- Click on **Sidekick** in the left menu
- Type: `Please install jszip for me`
- Sidekick will handle the installation

### 5. Get the image gallery
- Ask your L&D team lead for the **MASTER SWORD GALLERY** folder
- Copy the gallery images into: `C:\Users\YOURNAME\AppData\Local\Temp\opencode\gallery\`
- These are the Tesla photos used as slide backgrounds

**Setup is done. You won't need to do this again.**

---

## How to Create a Presentation

### Open Sidekick
In Nova, click **Sidekick** on the left sidebar. This opens the AI chat.

### Tell it what you want
Just type naturally. Examples:

> "Build me a 45-slide training presentation about onboarding new sales advisors"

> "Take this learning plan and turn it into an engaging presentation: C:\Users\me\Desktop\my-content.pptx"

> "Create a compliance training deck covering data protection. Include quizzes, scenarios, and a legal dictionary."

> "Convert this plain text into a training presentation:
> Topic: Vehicle Handover Process
> Section 1: Pre-delivery checks
> Section 2: Customer walkthrough
> Section 3: App setup and handover
> Section 4: Post-delivery follow-up"

### Get your file
Sidekick will generate the PowerPoint and save it to your Desktop. Open it in PowerPoint and review.

### Refine if needed
You can ask Sidekick to make changes:

> "Make slide 5 a discussion question instead"

> "Add more quiz slides at the end"

> "Change the section dividers to use different images"

Or just edit directly in PowerPoint — the file is a normal .pptx.

---

## What's Inside Your Presentations

### 65 slide types including:
- **Title covers** — with gradient text and Tesla imagery
- **Section dividers** — with giant numbers (MASTER SWORD style)
- **Content slides** — dark backgrounds with text and rounded images
- **White slides** — clean backgrounds for data, tables, activities
- **Big stats** — enormous numbers for impact
- **Quizzes** — multiple choice and true/false
- **Scenarios** — customer situation cards with discussion questions
- **Activities** — pair work, group exercises, role plays, polls
- **Key takeaways** — highlight the main message
- **Closing** — Q&A, thank you, next steps, feedback

### Design features:
- **8 gradient text colors** that rotate across slides (gold, teal, rose, blue, plum, sage, copper, sand)
- **Progressive green charge bar** on the right edge — starts empty, fills to 100% by the last slide
- **Universal Sans font family** (Tesla corporate fonts)
- **Muted color palette** — no harsh primary colors
- **Rounded corner images** from the Tesla gallery
- **VARK learning model** — visual, auditory, read/write, and kinesthetic slides balanced throughout

---

## Tips for Best Results

1. **Give detailed content** — the more you provide, the better the output
2. **Mention the audience** — "for new hires" vs "for experienced advisors" changes the approach
3. **Specify slide count** — "make it 50 slides" helps set the right density
4. **Request specific elements** — "include 3 scenarios and a legal dictionary" 
5. **Provide a source file** — if you have an existing PPT or Word doc, give the file path

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Sidekick doesn't know about the template | Make sure your Nova workspace is set to the `PPT-Creator` folder |
| "jszip not found" error | Ask Sidekick to install it: "Please install jszip" |
| Images missing from slides | Copy the gallery images to the temp folder (see setup step 5) |
| File won't save | Close the previous version in PowerPoint first |
| Fonts look wrong | Install Universal Sans fonts on your machine (ask L&D for the font files) |

---

## Getting Updates
When the template or agent is updated, pull the latest version:
```
cd PPT-Creator
git pull
```

---

## Questions?
Contact the L&D team or raise an issue on the GitHub repo.
