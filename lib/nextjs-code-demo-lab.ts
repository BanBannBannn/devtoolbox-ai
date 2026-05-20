export type CodeDemoLessonId =
  | "use-state-counter"
  | "props-example"
  | "conditional-rendering"
  | "list-rendering"
  | "client-vs-server-component"
  | "route-handler-get-response"
  | "environment-variable-safety";

export type PreviewType = "live" | "simulated";

export type CodeDemoLesson = {
  id: CodeDemoLessonId;
  title: string;
  difficulty: "Beginner" | "Beginner+" | "Intermediate";
  concept: string;
  code: string;
  explanation: string;
  commonMistake: string;
  changeExplanation: string;
  previewType: PreviewType;
};

const lessons: CodeDemoLesson[] = [
  {
    id: "use-state-counter",
    title: "useState Counter",
    difficulty: "Beginner",
    concept: "React state updates inside a Client Component.",
    code: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    explanation:
      "useState stores a value that can change after the page loads. Clicking the button updates count and React redraws the button text.",
    commonMistake:
      "Forgetting the \"use client\" directive when using useState in the App Router.",
    changeExplanation:
      "Changing the initial value in useState changes the first number users see. Changing count + 1 changes how much each click adds.",
    previewType: "live",
  },
  {
    id: "props-example",
    title: "Props Example",
    difficulty: "Beginner",
    concept: "Props pass data from a parent component to a child component.",
    code: `type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}

export default function Page() {
  return <Greeting name="Ada" />;
}`,
    explanation:
      "The parent Page component passes a fixed name prop to Greeting. Greeting reads that prop and renders it in the message.",
    commonMistake:
      "Treating props like global variables instead of values passed into a component.",
    changeExplanation:
      "Changing name=\"Ada\" to another value changes the rendered greeting while keeping the component reusable.",
    previewType: "simulated",
  },
  {
    id: "conditional-rendering",
    title: "Conditional Rendering",
    difficulty: "Beginner",
    concept: "Components can choose which UI to show based on a condition.",
    code: `type StatusMessageProps = {
  isLoggedIn: boolean;
};

function StatusMessage({ isLoggedIn }: StatusMessageProps) {
  if (isLoggedIn) {
    return <p>Welcome back.</p>;
  }

  return <p>Please sign in.</p>;
}`,
    explanation:
      "The component checks isLoggedIn and returns one of two predefined UI states.",
    commonMistake:
      "Trying to show both branches at once instead of returning the UI that matches the current condition.",
    changeExplanation:
      "Changing isLoggedIn from false to true switches the message from the signed-out state to the welcome state.",
    previewType: "live",
  },
  {
    id: "list-rendering",
    title: "List Rendering",
    difficulty: "Beginner",
    concept: "Render repeated UI by mapping over an array.",
    code: `const tools = ["JSON Formatter", "README Generator", "Git Helper"];

export function ToolList() {
  return (
    <ul>
      {tools.map((tool) => (
        <li key={tool}>{tool}</li>
      ))}
    </ul>
  );
}`,
    explanation:
      "map turns each item in the tools array into an li element. The key helps React track each item.",
    commonMistake:
      "Forgetting a stable key or using an unstable value when rendering lists.",
    changeExplanation:
      "Adding another string to the tools array adds another list item to the preview.",
    previewType: "simulated",
  },
  {
    id: "client-vs-server-component",
    title: "Client Component vs Server Component",
    difficulty: "Beginner+",
    concept:
      "Server Components render on the server by default, while Client Components handle browser interactivity.",
    code: `// Server Component by default
export default function Page() {
  return <h1>Fast static content</h1>;
}

// Client Component when interactivity is needed
"use client";

import { useState } from "react";

export function Toggle() {
  const [enabled, setEnabled] = useState(false);
  return <button onClick={() => setEnabled(!enabled)}>Toggle</button>;
}`,
    explanation:
      "In the App Router, components are Server Components unless marked with \"use client\". Hooks and browser events belong in Client Components.",
    commonMistake:
      "Adding useState or onClick to a Server Component without moving that interactive part into a Client Component.",
    changeExplanation:
      "Moving the interactive button into a Client Component keeps the static page server-rendered while allowing browser interaction.",
    previewType: "simulated",
  },
  {
    id: "route-handler-get-response",
    title: "Route Handler GET response",
    difficulty: "Beginner+",
    concept: "Route Handlers return API-style responses from app route.ts files.",
    code: `export async function GET() {
  return Response.json({
    ok: true,
    service: "DevToolBox AI"
  });
}`,
    explanation:
      "A GET export in route.ts handles GET requests and returns a JSON response. This lesson only simulates the response preview.",
    commonMistake:
      "Expecting a Route Handler to render page UI. Use page.tsx for UI and route.ts for request handlers.",
    changeExplanation:
      "Changing the object passed to Response.json changes the JSON body clients receive.",
    previewType: "simulated",
  },
  {
    id: "environment-variable-safety",
    title: "Environment Variable Safety",
    difficulty: "Intermediate",
    concept:
      "NEXT_PUBLIC_* variables can be exposed to the browser; secrets must stay server-side.",
    code: `// Safe to expose in browser code:
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Server-side only. Do not use this in Client Components:
const apiKey = process.env.OPENROUTER_API_KEY;

export function getConfigLabel() {
  return publicSiteUrl ? "Site URL configured" : "Site URL missing";
}`,
    explanation:
      "Variables prefixed with NEXT_PUBLIC_ are bundled for browser use. Secret keys should not use that prefix and should only be read on the server.",
    commonMistake:
      "Putting a private API key in a NEXT_PUBLIC_* variable, which exposes it to browser code.",
    changeExplanation:
      "Changing whether NEXT_PUBLIC_SITE_URL is set changes the safe public label. The private API key should never be displayed.",
    previewType: "simulated",
  },
];

export function getAllCodeDemoLessons(): CodeDemoLesson[] {
  return lessons;
}

export function getCodeDemoLessonById(id: string): CodeDemoLesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getDefaultCodeDemoLesson(): CodeDemoLesson {
  return lessons[0];
}
