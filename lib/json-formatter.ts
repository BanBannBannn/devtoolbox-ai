export type FormatJsonResult =
  | {
      success: true;
      output: string;
    }
  | {
      success: false;
      error: string;
    };

export function formatJson(input: string): FormatJsonResult {
  const trimmedInput = input.trim();

  if (trimmedInput.length === 0) {
    return {
      success: false,
      error: "Please enter JSON to format.",
    };
  }

  try {
    const parsedJson = JSON.parse(trimmedInput);

    return {
      success: true,
      output: JSON.stringify(parsedJson, null, 2),
    };
  } catch {
    return {
      success: false,
      error: "Invalid JSON. Please check the syntax and try again.",
    };
  }
}
