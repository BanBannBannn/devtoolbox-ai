# QR Code Generator SPEC

## Goal
Build a browser-based QR Code Generator that turns text or URLs into downloadable PNG QR codes.

## URL
`/tools/qr-code-generator`

## User Story
As a developer, creator, or student, I want to generate a QR code from text or a URL, so that I can quickly share links, contact details, demo pages, or short messages.

## Functional Requirements
- User can enter text or a URL.
- User can generate a QR code.
- User can choose QR code size.
- User can choose error correction level.
- User can download the QR code as a PNG.
- User can clear input and generated output.
- Tool runs fully in the browser.
- Tool works well on mobile.

## QR Options
- Size options should be clear and practical for common use.
- Error correction level options should include standard QR levels:
  - Low
  - Medium
  - Quartile
  - High

## SEO/Help Content Requirements
The page should include helpful content for:
- What a QR code is.
- How to generate a QR code.
- QR code size explanation.
- Error correction level explanation.
- Common QR code use cases.
- FAQ.
- Related tools.

## Edge Cases
- Empty input.
- Very long text.
- URL input.
- Plain text input.
- Small QR size.
- Large QR size.
- Different error correction levels.
- Download attempted before QR generation.

## Acceptance Criteria
- User can generate a QR code from text.
- User can generate a QR code from a URL.
- User can change QR size before generating.
- User can choose error correction level before generating.
- User can download generated QR code as PNG.
- Clear action resets input and output.
- Empty input shows a helpful error.
- Page is mobile-friendly.
- No backend, database, AdSense, auth, or external AI API is required.
