# QR Code Generator Test Cases

## TC-001: Generate QR code from text
Input:
- Text: `Hello from DevToolBox AI`
- Size: `256`
- Error correction: `Medium`

Expected:
- QR code is generated.
- Output is visible.
- No error is shown.

## TC-002: Generate QR code from URL
Input:
- Text: `https://example.com`
- Size: `256`
- Error correction: `Medium`

Expected:
- QR code is generated.
- Output is visible.
- No error is shown.

## TC-003: Change QR size
Input:
- Text: `https://example.com`
- Size: `512`

Expected:
- Generated QR code uses the selected size.

## TC-004: Choose error correction level
Input:
- Text: `https://example.com`
- Error correction: `High`

Expected:
- QR generation uses the selected error correction level.

## TC-005: Download QR code as PNG
Input:
- Generated QR code.

Expected:
- User can download a PNG file.

## TC-006: Clear input and output
Input:
- Generated QR code and non-empty text input.

Expected:
- Clear action removes input.
- Clear action removes generated QR output.
- Status or error messages are reset.

## TC-007: Empty input
Input:
- Text: empty

Expected:
- QR code is not generated.
- Helpful error message is shown.

## TC-008: Mobile layout
Input:
- Use the page on a small viewport.

Expected:
- Input, options, buttons, output, and help content remain readable and usable.
