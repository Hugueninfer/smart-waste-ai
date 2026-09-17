# Smart Waste AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished bilingual waste-classification SPA with image upload, webcam analysis, Teachable Machine integration, mock inference, persistent history, and analytics.

**Architecture:** A React Router SPA uses focused services for model inference and LocalStorage, lightweight contexts for language and history, and route-level pages composed from small UI components. TensorFlow details remain behind `modelService`; stable English class IDs are stored while presentation copy is localized.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, TensorFlow.js, `@teachablemachine/image`, React Router, Lucide React, Recharts, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-17-smart-waste-ai-design.md`

## Global Constraints

- Use React + TypeScript + Vite; do not use Next.js or add a backend.
- Support exactly six canonical classes: `Cardboard`, `Glass`, `Metal`, `Paper`, `Plastic`, and `Trash`.
- Load the real model from `/model/model.json` and `/model/metadata.json` and cache one initialization promise.
- Read mock behavior from `VITE_USE_MOCK_MODEL`; the documented development default is `true`.
- Start in English and provide a persistent EN/PT selector; never translate persisted canonical class IDs.
- Persist classification metadata only; never place image data or object URLs in LocalStorage.
- Stop every webcam MediaStream track on stop, mode change, route change, and unmount.
- Treat probabilities at least 85% as High, 65–84.999% as Medium, and below 65% as Low/inconclusive.
- State that disposal rules vary by municipality wherever disposal guidance is shown.
- Do not use native `alert()` or `confirm()`.
- Preserve keyboard access, visible focus, reduced-motion behavior, and responsive operation.

## File Map

```text
.env.example                              Mock model switch
README.md                                 Setup, model export, privacy, and scripts
package.json                              Scripts and dependencies
vite.config.ts                            React, Tailwind, and Vitest configuration
src/app.css                               Design tokens, global styles, utilities
src/types/waste.ts                        Canonical class and localized waste types
src/types/prediction.ts                   Prediction and model state types
src/types/classification.ts               Stored classification types
src/data/wasteInformation.ts              Localized material metadata
src/i18n/translations.ts                  Localized interface strings
src/contexts/LanguageContext.tsx          Persistent language state
src/services/storageService.ts            Validated LocalStorage boundary
src/contexts/HistoryContext.tsx           Shared classification history
src/services/modelService.ts              Mock/real model singleton and inference
src/hooks/useModel.ts                     Model lifecycle exposed to React
src/hooks/useWebcam.ts                    Camera lifecycle and error mapping
src/utils/confidence.ts                   Confidence tiers and formatting
src/utils/date.ts                         Locale-aware timestamps
src/components/common/*                   Status, dialog, empty-state primitives
src/components/layout/*                   Responsive shell and navigation
src/components/scanner/*                  Upload and camera controls
src/components/predictions/*              Result and material details
src/components/dashboard/*                Metrics, chart, and recent scans
src/pages/Dashboard.tsx                   Analytics route
src/pages/Scanner.tsx                     Classification route
src/pages/History.tsx                     Persistent records route
src/pages/About.tsx                       Product/model/privacy route
src/App.tsx                               Providers and route definitions
src/main.tsx                              Browser entry point
src/test/*                                Test setup and browser fixtures
```

---

### Task 1: Bootstrap the Tested Application Shell

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `.gitignore`, `.env.example`
- Create: `src/main.tsx`, `src/App.tsx`, `src/app.css`, `src/test/setup.ts`, `src/App.test.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `App(): JSX.Element`, npm scripts `dev`, `build`, `lint`, `test`, and `test:run`.

- [ ] **Step 1: Scaffold Vite and install dependencies**

Run:

```bash
npm create vite@latest . -- --template react-ts
npm install react-router-dom lucide-react recharts @tensorflow/tfjs @teachablemachine/image
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint
```

Expected: dependencies install successfully while the committed `docs/` directory remains intact.

- [ ] **Step 2: Configure test and styling plugins**

Replace `vite.config.ts` with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
})
```

Set `.env.example` to `VITE_USE_MOCK_MODEL=true`. Add `test` and `test:run` scripts using `vitest` and `vitest run`. In `src/test/setup.ts`, import `@testing-library/jest-dom/vitest` and provide `matchMedia`, `ResizeObserver`, and `URL.createObjectURL` test doubles.

- [ ] **Step 3: Write the failing shell test**

```tsx
import { render, screen } from "@testing-library/react"
import App from "./App"

it("renders the Smart Waste AI shell", () => {
  render(<App />)
  expect(screen.getByRole("heading", { name: /smart waste ai/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run the test and confirm the expected failure**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL because the branded shell is not implemented.

- [ ] **Step 5: Implement the minimal branded shell and global tokens**

Make `App.tsx` render a `Smart Waste AI` heading. In `app.css`, import Tailwind and define petroleum, lime, cream, cyan, and muted tokens plus body, focus-visible, dot-grid, and reduced-motion rules. Use local/system fallbacks initially so font loading never blocks the UI.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/App.test.tsx && npm run build`

Expected: PASS and a successful production build.

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html .gitignore .env.example src
git commit -m "chore: bootstrap Smart Waste AI frontend"
```

### Task 2: Define Domain Types, Waste Data, Confidence, and Localization

**Files:**
- Create: `src/types/waste.ts`, `src/types/prediction.ts`, `src/types/classification.ts`
- Create: `src/data/wasteInformation.ts`, `src/i18n/translations.ts`
- Create: `src/utils/confidence.ts`, `src/utils/date.ts`
- Test: `src/utils/confidence.test.ts`, `src/data/wasteInformation.test.ts`

**Interfaces:**
- Consumes: none.
- Produces: `WASTE_CLASSES`, `WasteClass`, `Prediction`, `Classification`, `ModelStatus`, `wasteInformation`, `getConfidenceTier(probability)`, `formatPercent(probability)`, `formatDate(timestamp, language)`.

- [ ] **Step 1: Write boundary and completeness tests**

```ts
import { describe, expect, it } from "vitest"
import { getConfidenceTier } from "./confidence"

describe("getConfidenceTier", () => {
  it.each([[0.85, "high"], [0.8499, "medium"], [0.65, "medium"], [0.6499, "low"]] as const)(
    "maps %s to %s", (value, tier) => expect(getConfidenceTier(value)).toBe(tier),
  )
})
```

Test that `wasteInformation` has exactly six keys and that each key has English and Portuguese `name`, `description`, `disposalInstructions`, and non-empty `examples`.

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm run test:run -- src/utils/confidence.test.ts src/data/wasteInformation.test.ts`

Expected: FAIL because domain modules do not exist.

- [ ] **Step 3: Implement stable domain contracts**

```ts
export const WASTE_CLASSES = ["Cardboard", "Glass", "Metal", "Paper", "Plastic", "Trash"] as const
export type WasteClass = (typeof WASTE_CLASSES)[number]
export type Language = "en" | "pt"
export type ModelStatus = "idle" | "loading" | "ready" | "error"
export interface Prediction { className: WasteClass; probability: number }
export interface Classification {
  id: string
  predictedClass: WasteClass
  confidence: number
  predictions: Prediction[]
  source: "upload" | "webcam"
  timestamp: string
}
```

Create localized waste entries using the examples from the brief. Mark Cardboard, Glass, Metal, Paper, and Plastic recyclable; mark Trash non-recyclable. Each disposal instruction must include the municipality-policy caveat in both languages.

- [ ] **Step 4: Implement interface translations and formatters**

Create a typed `translations` object covering navigation, model status, dashboard, scanner, results, history, about, actions, errors, accessibility labels, and empty states. Implement date formatting with `en-US` or `pt-BR` and percentage formatting with two decimals.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/utils/confidence.test.ts src/data/wasteInformation.test.ts && npm run build`

```bash
git add src/types src/data src/i18n src/utils
git commit -m "feat: define waste domain and bilingual copy"
```

### Task 3: Add Safe Persistence and Shared Contexts

**Files:**
- Create: `src/services/storageService.ts`
- Create: `src/contexts/LanguageContext.tsx`, `src/contexts/HistoryContext.tsx`
- Create: `src/hooks/useClassificationHistory.ts`
- Test: `src/services/storageService.test.ts`, `src/contexts/LanguageContext.test.tsx`

**Interfaces:**
- Consumes: `Language`, `Classification`, `WASTE_CLASSES`.
- Produces: `readHistory(): Classification[]`, `writeHistory(items): void`, `clearHistory(): void`, `readLanguage(): Language`, `writeLanguage(language): void`, `useLanguage()`, `useClassificationHistory()`.

- [ ] **Step 1: Write failing persistence tests**

Test empty storage, malformed JSON, structurally invalid records, successful round-trip, history clearing, default English, and persisted Portuguese. Include an assertion that no stored JSON contains `image`, `dataUrl`, or `blob:`.

```ts
it("falls back to an empty history for malformed data", () => {
  localStorage.setItem("smart-waste-ai:history:v1", "{")
  expect(readHistory()).toEqual([])
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm run test:run -- src/services/storageService.test.ts`

Expected: FAIL because the storage boundary is absent.

- [ ] **Step 3: Implement validated storage**

Use the exact keys `smart-waste-ai:history:v1` and `smart-waste-ai:language:v1`. Validate every classification field, canonical class, probability range, source, and timestamp before accepting stored records. Catch browser storage errors so unavailable storage cannot crash rendering.

- [ ] **Step 4: Write context behavior tests**

Render a consumer under `LanguageProvider`; assert initial `EN`, click the exposed toggle, assert `PT`, and verify `smart-waste-ai:language:v1` equals `pt`.

- [ ] **Step 5: Implement contexts with stable operations**

`LanguageProvider` exposes `{ language, setLanguage, t }`, where `t(key)` reads typed translation keys. `HistoryProvider` exposes newest-first `history`, `addClassification`, and `clearHistory`. `useClassificationHistory` throws a descriptive error outside its provider.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/services/storageService.test.ts src/contexts/LanguageContext.test.tsx`

```bash
git add src/services/storageService.ts src/contexts src/hooks/useClassificationHistory.ts
git commit -m "feat: persist language and classification history"
```

### Task 4: Implement the Model Service and React Lifecycle

**Files:**
- Create: `src/services/modelService.ts`, `src/hooks/useModel.ts`
- Create: `src/vite-env.d.ts`
- Test: `src/services/modelService.test.ts`, `src/hooks/useModel.test.tsx`

**Interfaces:**
- Consumes: `Prediction`, `WasteClass`, `WASTE_CLASSES`, `ModelStatus`.
- Produces: `loadModel(): Promise<void>`, `predict(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Prediction[]>`, `resetModel(): void`, `useModel(): { status, error, classify, retry }`.

- [ ] **Step 1: Write failing normalization and singleton tests**

Mock `@teachablemachine/image`. Assert two concurrent `loadModel()` calls invoke `tmImage.load("/model/model.json", "/model/metadata.json")` once. Assert raw duplicate/unknown/out-of-range values become exactly six canonical, clamped, descending predictions.

- [ ] **Step 2: Run the service tests and confirm failure**

Run: `npm run test:run -- src/services/modelService.test.ts`

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement real and mock adapters**

Maintain module-level `modelPromise` and `model`. Real loading calls the Teachable Machine loader with the exact public URLs. Mock loading resolves without network access. Mock prediction picks one leading class between 0.68 and 0.96, distributes the remainder across the other five classes, normalizes the sum, and sorts descending.

On load failure, reject with a user-safe `ModelLoadError`; `resetModel()` clears both cached fields only for explicit retry. `predict()` rejects if called before successful loading and wraps inference failures as `PredictionError`.

- [ ] **Step 4: Write the hook lifecycle test**

Render `useModel` with `renderHook`; assert `loading` then `ready`, call `classify`, and assert descending predictions. Mock a load rejection, assert `error`, call `retry`, and assert a new load attempt.

- [ ] **Step 5: Implement `useModel` with unmount protection**

Initialize once in an effect, ignore async completions after unmount, expose a memoized `classify`, and make `retry` call `resetModel()` before beginning a fresh load.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/services/modelService.test.ts src/hooks/useModel.test.tsx`

```bash
git add src/services/modelService.ts src/hooks/useModel.ts src/vite-env.d.ts
git commit -m "feat: add singleton Teachable Machine service"
```

### Task 5: Build the Responsive Application Layout

**Files:**
- Create: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/layout/LanguageSwitcher.tsx`
- Create: `src/components/common/ModelStatusBadge.tsx`
- Modify: `src/App.tsx`, `src/app.css`
- Test: `src/components/layout/AppLayout.test.tsx`

**Interfaces:**
- Consumes: `useLanguage()`, `ModelStatus`, React Router navigation.
- Produces: shared responsive shell with `<Outlet />` and navigation to `/`, `/scanner`, `/history`, `/about`.

- [ ] **Step 1: Write the failing navigation test**

Render `AppLayout` in `MemoryRouter` with a child route. Assert accessible Dashboard, Scanner, History, About links; current-page state; EN/PT switcher; and model status text.

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm run test:run -- src/components/layout/AppLayout.test.tsx`

Expected: FAIL because layout components are missing.

- [ ] **Step 3: Implement the editorial shell**

Create a petroleum sidebar with lime active states, condensed uppercase section labels, a dot-grid accent, branded recycling mark, and model badge. Add a compact mobile header plus bottom navigation with the same routes. Use Lucide icons with text labels, not icon-only primary navigation.

- [ ] **Step 4: Wire providers and placeholder routes**

Wrap the router with `LanguageProvider` and `HistoryProvider`. Use a temporary page component that renders the localized route title for all four routes. Reserve main-content space so later pages do not alter the shell.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/components/layout/AppLayout.test.tsx && npm run build`

```bash
git add src/App.tsx src/app.css src/components/layout src/components/common/ModelStatusBadge.tsx
git commit -m "feat: add responsive bilingual application shell"
```

### Task 6: Implement Webcam Resource Management

**Files:**
- Create: `src/hooks/useWebcam.ts`
- Test: `src/hooks/useWebcam.test.tsx`

**Interfaces:**
- Consumes: browser `navigator.mediaDevices.getUserMedia`.
- Produces: `useWebcam(): { videoRef, status, error, start, stop, getVideoElement }`, where status is `idle | requesting | active | error`.

- [ ] **Step 1: Write failing lifecycle tests**

Mock a stream with two track objects. Assert `start()` requests `{ video: { facingMode: "environment" }, audio: false }`, assigns `srcObject`, and reaches `active`. Assert `stop()` calls `stop()` once on both tracks and clears `srcObject`. Assert unmount performs the same cleanup.

- [ ] **Step 2: Add permission and device error tests**

Reject `getUserMedia` with `NotAllowedError` and `NotFoundError`; assert stable error codes `permission-denied` and `camera-not-found`. A generic rejection maps to `camera-unavailable`.

- [ ] **Step 3: Run and confirm failure**

Run: `npm run test:run -- src/hooks/useWebcam.test.tsx`

Expected: FAIL because the hook is absent.

- [ ] **Step 4: Implement idempotent cleanup**

Store the stream in a ref, stop any previous stream before a new request, guard state updates after unmount, call `video.play()` after assignment, and make repeated `stop()` calls safe.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/hooks/useWebcam.test.tsx`

```bash
git add src/hooks/useWebcam.ts src/hooks/useWebcam.test.tsx
git commit -m "feat: manage webcam lifecycle safely"
```

### Task 7: Build Upload, Camera, and Scanner Orchestration

**Files:**
- Create: `src/components/scanner/ScannerModeTabs.tsx`, `src/components/scanner/ImageDropzone.tsx`, `src/components/scanner/CameraPanel.tsx`
- Create: `src/pages/Scanner.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/Scanner.test.tsx`

**Interfaces:**
- Consumes: `useModel()`, `useWebcam()`, `useClassificationHistory()`, accepted MIME types, normalized `Prediction[]`.
- Produces: complete source-selection flow and a `Classification` record after successful inference.

- [ ] **Step 1: Write failing upload-flow tests**

Upload a PNG with Testing Library. Mock an image load event and `classify`. Assert preview creation, automatic classify call, disabled controls during work, and one history record with `source: "upload"`. Upload `text/plain` and assert a localized inline type error without classification.

- [ ] **Step 2: Write failing camera-flow tests**

Select Use Camera, start the camera, click Analyze, and assert classification uses the video element and stores `source: "webcam"`. Click Stop Camera and assert hook cleanup. Switch back to Upload and assert cleanup again.

- [ ] **Step 3: Run and confirm failure**

Run: `npm run test:run -- src/pages/Scanner.test.tsx`

Expected: FAIL because scanner UI is absent.

- [ ] **Step 4: Implement dropzone and preview lifecycle**

Accept `image/jpeg,image/png,image/webp`. Support click, keyboard, drag-enter/leave, and drop. Create one object URL, revoke the prior URL on replacement, and revoke the current URL on unmount. Trigger classification only after the preview image has loaded successfully.

- [ ] **Step 5: Implement camera controls and page orchestration**

Use segmented mode tabs. Display camera permission progress and mapped errors. Create records with `crypto.randomUUID()` or a timestamp/random fallback and `new Date().toISOString()`. Keep the latest predictions and preview in page state; replace them only when a new classification starts successfully.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/pages/Scanner.test.tsx && npm run build`

```bash
git add src/components/scanner src/pages/Scanner.tsx src/App.tsx
git commit -m "feat: add upload and webcam scanner flows"
```

### Task 8: Present AI Results and Material Guidance

**Files:**
- Create: `src/components/predictions/AnalysisResult.tsx`, `src/components/predictions/ProbabilityList.tsx`, `src/components/predictions/MaterialInformation.tsx`
- Modify: `src/pages/Scanner.tsx`, `src/app.css`
- Test: `src/components/predictions/AnalysisResult.test.tsx`

**Interfaces:**
- Consumes: sorted `Prediction[]`, `wasteInformation`, `getConfidenceTier`, `useLanguage()`.
- Produces: high/medium result cards and low-confidence inconclusive guidance.

- [ ] **Step 1: Write confidence-presentation tests**

For `Plastic: 0.9643`, assert Plastic, `96.43%`, High confidence, Recyclable, and six descending progress rows. For `Glass: 0.64`, assert “Unable to classify confidently” and all three photo suggestions; assert the component does not label Glass as a definitive result heading.

- [ ] **Step 2: Run and confirm failure**

Run: `npm run test:run -- src/components/predictions/AnalysisResult.test.tsx`

Expected: FAIL because result components are missing.

- [ ] **Step 3: Implement accessible probability and result cards**

Use semantic labels and CSS progress tracks with `aria-valuenow`. Apply tier-specific color and copy. Add a large editorial percentage, recycling mark, and short transition that is disabled under reduced motion.

- [ ] **Step 4: Implement localized material details**

Show translated material name, Yes/No recyclability, description, bullet examples, recommended disposal, and the municipal-policy note. Use canonical `WasteClass` to index data so switching languages updates existing results immediately.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/components/predictions/AnalysisResult.test.tsx src/pages/Scanner.test.tsx`

```bash
git add src/components/predictions src/pages/Scanner.tsx src/app.css
git commit -m "feat: show confidence-aware AI analysis"
```

### Task 9: Build Dashboard Analytics

**Files:**
- Create: `src/components/dashboard/MetricCard.tsx`, `src/components/dashboard/MaterialChart.tsx`, `src/components/dashboard/RecentScans.tsx`
- Create: `src/pages/Dashboard.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `Classification[]`, `wasteInformation`, Recharts, localized formatters.
- Produces: totals, average confidence, most detected material, recyclable count, six-class chart data, and recent records.

- [ ] **Step 1: Write failing aggregate tests**

Seed Plastic 90%, Plastic 80%, and Trash 70%. Assert Total Scans 3, Average Confidence 80.00%, Most Detected Material Plastic, and Recyclable Items 2. Assert chart input contains all six classes even when four counts are zero.

- [ ] **Step 2: Add the empty-state test**

With empty history, assert a designed message and a link to `/scanner`; assert no misleading NaN or undefined metric appears.

- [ ] **Step 3: Run and confirm failure**

Run: `npm run test:run -- src/pages/Dashboard.test.tsx`

Expected: FAIL because the dashboard is absent.

- [ ] **Step 4: Implement memoized analytics and visual hierarchy**

Compute aggregates with `useMemo`. Use four editorial metric cards with oversized numbers, a responsive Recharts bar chart, and five newest records. Use stable category colors and an accessible textual summary adjacent to the chart.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/pages/Dashboard.test.tsx && npm run build`

```bash
git add src/components/dashboard src/pages/Dashboard.tsx src/App.tsx
git commit -m "feat: add classification analytics dashboard"
```

### Task 10: Build History and Accessible Confirmation Dialog

**Files:**
- Create: `src/components/common/ConfirmDialog.tsx`, `src/components/common/EmptyState.tsx`
- Create: `src/pages/History.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/History.test.tsx`, `src/components/common/ConfirmDialog.test.tsx`

**Interfaces:**
- Consumes: `useClassificationHistory()`, `formatDate`, `formatPercent`, `useLanguage()`.
- Produces: responsive history presentation and confirmed clearing.

- [ ] **Step 1: Write failing history tests**

Seed two records and assert newest-first Material, Confidence, Source, and Date values. Test both Upload and Webcam localization. At a narrow viewport, assert the same information remains available without depending on table headers.

- [ ] **Step 2: Write dialog behavior tests**

Click Clear History; assert the dialog opens and history remains. Press Escape and assert it closes. Reopen, confirm, and assert records disappear. Verify focus enters the dialog and returns to the trigger on cancellation.

- [ ] **Step 3: Run and confirm failure**

Run: `npm run test:run -- src/pages/History.test.tsx src/components/common/ConfirmDialog.test.tsx`

Expected: FAIL because the page and dialog are absent.

- [ ] **Step 4: Implement history and modal semantics**

Use a desktop table and CSS-driven stacked mobile layout. Implement `role="dialog"`, `aria-modal="true"`, labelled title/description, initial focus, Tab containment, Escape close, backdrop close, and focus restoration. Style confirmation as destructive without using browser dialogs.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/pages/History.test.tsx src/components/common/ConfirmDialog.test.tsx`

```bash
git add src/components/common src/pages/History.tsx src/App.tsx
git commit -m "feat: add persistent classification history"
```

### Task 11: Complete About, Model Status, and Error Recovery

**Files:**
- Create: `src/pages/About.tsx`, `src/components/common/ModelUnavailable.tsx`, `src/components/common/LoadingSkeleton.tsx`
- Modify: `src/App.tsx`, `src/components/layout/AppLayout.tsx`, `src/pages/Scanner.tsx`
- Test: `src/pages/About.test.tsx`, `src/components/common/ModelUnavailable.test.tsx`

**Interfaces:**
- Consumes: model `status`, `error`, and `retry`; localization; six waste classes.
- Produces: complete About content and recoverable loading/unavailable UI.

- [ ] **Step 1: Write failing About and error-state tests**

Assert About explains local processing, no image persistence, six supported classes, Teachable Machine, confidence limitations, and municipality-specific disposal rules in both languages. For a model error, assert the exact `public/model/` location and a retry action.

- [ ] **Step 2: Run and confirm failure**

Run: `npm run test:run -- src/pages/About.test.tsx src/components/common/ModelUnavailable.test.tsx`

Expected: FAIL because final informational states are absent.

- [ ] **Step 3: Implement final informational and recovery states**

Add editorial About sections, six class tiles, privacy explanation, and limitations. Connect the global badge and Scanner state to the same model lifecycle. During loading, reserve result-panel dimensions with a labelled skeleton. During error, disable analysis actions but keep navigation and existing history available.

- [ ] **Step 4: Verify and commit**

Run: `npm run test:run -- src/pages/About.test.tsx src/components/common/ModelUnavailable.test.tsx && npm run build`

```bash
git add src/pages/About.tsx src/components/common src/components/layout/AppLayout.tsx src/pages/Scanner.tsx src/App.tsx
git commit -m "feat: add model recovery and product guidance"
```

### Task 12: Documentation, Full Verification, and Responsive Visual QA

**Files:**
- Create: `README.md`, `public/model/.gitkeep`
- Modify: any source or test file only when verification exposes a specific defect

**Interfaces:**
- Consumes: the completed application and all npm scripts.
- Produces: documented setup and verified release candidate.

- [ ] **Step 1: Write the operational README**

Document prerequisites, `npm install`, `npm run dev`, tests, lint, build, `VITE_USE_MOCK_MODEL`, and how to copy Teachable Machine's `model.json`, `metadata.json`, and weights binary into `public/model/`. Explain that images remain in browser memory, history metadata stays in LocalStorage, mock predictions are synthetic, and disposal rules vary by municipality.

- [ ] **Step 2: Run the complete automated suite**

Run:

```bash
npm run lint
npm run test:run
npm run build
```

Expected: all commands exit 0 with no unhandled errors or TypeScript failures.

- [ ] **Step 3: Exercise mock-mode flows in a browser**

Start `npm run dev -- --host 127.0.0.1`. Verify at 1440×900 and 390×844: all routes, navigation, EN/PT switching, valid/invalid upload, automatic analysis, confidence result, dashboard update, history clearing/cancel, About content, keyboard focus, and no horizontal overflow.

- [ ] **Step 4: Exercise unavailable-model behavior**

Run with `VITE_USE_MOCK_MODEL=false` while `public/model/` contains only `.gitkeep`. Verify the app remains navigable, shows Model unavailable, explains `public/model/`, offers retry, and produces no uncaught render failure.

- [ ] **Step 5: Exercise camera cleanup**

Grant camera permission, start preview, then test Stop Camera, switching to Upload, navigating away, and unmount via refresh. Verify the browser camera indicator turns off in every case. Repeat once with permission denied and confirm the localized recovery message.

- [ ] **Step 6: Inspect runtime quality**

Confirm no console errors in normal mock flow, all images/object URLs are released after replacement, reduced-motion disables nonessential transitions, chart labels remain understandable without color alone, and every primary control is keyboard reachable.

- [ ] **Step 7: Commit documentation and verified fixes**

```bash
git add README.md public/model/.gitkeep src package.json package-lock.json
git commit -m "docs: add setup guide and complete release verification"
```

## Completion Gate

Before declaring completion, re-run `npm run lint && npm run test:run && npm run build`, inspect `git status --short`, and report the exact results. Do not claim the webcam path is verified if the environment lacks an accessible camera; report that limitation explicitly while still retaining automated MediaStream cleanup coverage.
