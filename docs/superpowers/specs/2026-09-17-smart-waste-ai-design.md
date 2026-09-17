# Smart Waste AI — Design Specification

## Goal

Build a production-quality, responsive waste-classification SPA using React, TypeScript, Vite, Tailwind CSS, TensorFlow.js, and the Teachable Machine image library. Users can classify an uploaded image or a webcam frame into Cardboard, Glass, Metal, Paper, Plastic, or Trash. This first version is entirely client-side.

The product starts in English and offers a persistent English/Portuguese selector. It remains usable when the trained model files have not yet been supplied by supporting a development mock mode.

## Product Scope

The application has four routes:

- Dashboard: aggregate history metrics, a class distribution chart, and recent scans.
- Scanner: image upload, webcam capture, AI result, probabilities, and disposal guidance.
- History: a persistent table/list of classifications and a custom clear-history confirmation dialog.
- About: product purpose, model explanation, supported categories, privacy, and local-policy caveats.

There is no backend, authentication, cloud persistence, image persistence, or model training workflow in this version.

## Visual Direction

The interface adapts the supplied editorial climate-site reference into an original Smart Waste AI identity. It uses deep near-black petroleum green as the dominant surface, vivid lime green for actions and emphasis, off-white content areas, and limited light-blue and earthy accents for category differentiation.

Display headings use a bold condensed face while body copy and data use a neutral, highly legible sans serif. Modular cards have defined borders, modest corner radii, generous spacing, and strong typographic hierarchy. A subtle dot grid and recycling-inspired radial geometry provide texture without copying the reference's identity or content.

The Dashboard is the most expressive editorial view. Scanner and History retain the same visual language while prioritizing operational clarity. Motion is short and purposeful: card entry, progress changes, tab transitions, and classification feedback. All text and controls meet practical contrast, focus, and responsive-use requirements.

Desktop uses a persistent sidebar. Mobile uses a compact header and accessible navigation panel or bottom navigation, chosen during implementation based on available viewport space. The layout must be fully usable from small mobile screens through wide desktop displays.

## Architecture

The product is a React Router SPA with shared layout components. It uses focused services and hooks rather than a general-purpose state library.

Suggested source structure:

```text
src/
  components/
    common/
    dashboard/
    layout/
    predictions/
    scanner/
  contexts/
  data/
  hooks/
  i18n/
  pages/
  services/
  types/
  utils/
  App.tsx
  main.tsx
```

Responsibilities:

- `modelService` owns model initialization, singleton caching, prediction, mock behavior, normalization, and model-specific errors.
- `storageService` owns safe parsing, validation, reading, writing, and clearing of history and preferences.
- `useModel` exposes `idle`, `loading`, `ready`, and `error` states plus retry and classify operations.
- `useWebcam` owns permission requests, stream lifecycle, frame access, error mapping, and cleanup.
- `useClassificationHistory` provides synchronized history operations to Scanner, Dashboard, and History.
- A lightweight language context provides translated UI strings and persists the EN/PT choice. English is the initial default.
- Waste configuration contains localized descriptions, examples, recyclability, and disposal guidance for all six classes.

React components never depend on TensorFlow.js internals. They consume normalized `Prediction[]` values and service status only.

## Model Integration

The real model loads from:

```text
/model/model.json
/model/metadata.json
```

Exported files are expected at `public/model/`, including the weights binary referenced by `model.json`. `@teachablemachine/image` is responsible for loading and running the image model.

Initialization is represented by one cached promise so concurrent consumers cannot load the model more than once. A failed attempt transitions the UI to `error`; an explicit retry clears the failed cached promise and makes one new attempt.

`VITE_USE_MOCK_MODEL=true` selects a mock implementation that emits all six normalized classes with realistic, variable probabilities summing to approximately 1. `false` selects the real Teachable Machine implementation. `.env.example` documents the setting and defaults the example developer experience to mock mode.

The UI displays Loading, Ready, or Model unavailable. A real-model loading failure does not crash the route; it explains that the exported files belong in `public/model/` and exposes a retry action.

## Scanner Flow

### Upload

The upload surface supports drag-and-drop and file selection for JPG, JPEG, PNG, and WEBP. Client-side validation rejects unsupported or unreadable files with an inline message. A valid file creates an object URL for preview and automatically starts classification. Replaced previews and component unmount revoke their object URLs.

### Webcam

The camera starts only after the user selects Use Camera and grants permission. The UI shows a live video preview, Analyze, and Stop Camera. Analyze classifies the current video frame. Stop Camera, route changes, and component unmount stop every MediaStream track and clear the video element. Permission denial and missing-device errors use distinct, actionable messages.

### Results

Predictions are normalized and sorted from highest to lowest probability. The result card shows the leading class, exact percentage, confidence tier, recyclability, and all six probability bars.

Confidence tiers are:

- High: probability greater than or equal to 85%.
- Medium: probability greater than or equal to 65% and below 85%.
- Low: probability below 65%.

For Low confidence, the UI says it cannot classify confidently and suggests better lighting, a clean background, and centering the object. It does not present the class as definitive. The record is still saved with its leading prediction so analytics remain honest, but history and detail views visually mark it as low-confidence.

The material detail section shows localized name, recyclability, common examples, description, and recommended disposal. Every disposal view states that local recycling rules vary by municipality.

## Persistence and Data Model

Each completed inference stores:

```ts
interface Prediction {
  className: string
  probability: number
}

interface Classification {
  id: string
  predictedClass: string
  confidence: number
  predictions: Prediction[]
  source: "upload" | "webcam"
  timestamp: string
}
```

IDs use `crypto.randomUUID()` with a safe fallback. Timestamps use ISO 8601. Images and object URLs are never persisted. Storage reads tolerate malformed, missing, or outdated data and fall back safely to an empty history.

The language preference and classification history use separate versioned LocalStorage keys. A context/provider synchronizes in-memory state across routes immediately.

## Dashboard and History

Dashboard metrics derive entirely from stored history:

- Total Scans: history length.
- Average Confidence: arithmetic mean of leading confidence values.
- Most Detected Material: highest class count, with a neutral value for no scans.
- Recyclable Items: number of records whose leading material is configured as recyclable.

The Recharts visualization shows counts for all six classes, including zero-count classes. Recent Scans shows the newest records first. With no history, a designed empty state points users to Scanner.

History displays Material, Confidence, Source, and localized Date. Desktop uses a table; narrow screens use equivalent stacked rows/cards without horizontal dependency. Clear History opens an accessible application dialog with cancel and destructive confirmation actions. No native `alert()` or `confirm()` is used.

## Localization

All user-facing interface and material copy is available in English and Brazilian Portuguese. English is used on first launch regardless of browser language. The user can switch with an EN/PT control; the selected language persists locally.

Class identifiers stored in history remain stable English canonical values. Presentation layers translate those identifiers, ensuring language changes do not corrupt analytics or persisted records. Dates use the selected locale.

## Loading, Errors, and Accessibility

Model loading, classification, and camera startup each have distinct progress feedback. Buttons are disabled only when their action would conflict with current work. Skeletons are limited to areas where they prevent disruptive layout shifts.

Error messages are actionable and remain near the affected control. Retry is offered where recovery is possible. Empty states are designed for Dashboard, History, and absent results.

Interactive controls support keyboard operation, visible focus, accessible names, and correct disabled states. Tabs and dialogs use appropriate semantics, focus behavior, Escape handling, and focus restoration. Motion respects `prefers-reduced-motion`.

## Performance and Resource Management

The model is loaded once per application session. Prediction state is localized to the Scanner, while shared providers expose only stable operations and necessary state. Derived dashboard data is memoized where useful.

Object URLs are revoked when replaced or unmounted. Webcam tracks stop on explicit stop, mode changes, route changes, and unmount. Chart and media areas reserve dimensions to minimize layout shift.

## Testing and Verification

The project uses automated tests appropriate to the Vite stack, with browser APIs mocked where needed. Coverage focuses on behavior rather than implementation details:

- Confidence tier boundaries and low-confidence presentation.
- Prediction sorting and normalization.
- Safe storage parsing, persistence, clearing, and language preference.
- Upload validation and automatic analysis.
- Model unavailable and retry states.
- Webcam permission failures and MediaStream cleanup.
- History confirmation dialog.
- Dashboard aggregates and empty states.
- English/Portuguese switching with stable canonical class IDs.

Final verification includes lint, TypeScript checking, test execution, production build, and manual visual inspection at representative desktop and mobile sizes. The README documents installation, development, mock mode, model placement, production build, privacy behavior, and the municipal-policy caveat.

## Success Criteria

The application is complete when all four routes are responsive and navigable; upload and webcam flows work with the mock service; the real model integration is wired to the documented paths; missing model files are handled gracefully; every classification updates persistent history and dashboard analytics; English and Portuguese are complete; camera and preview resources are reliably released; and automated plus build verification passes.
