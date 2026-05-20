export type CodeDemoLessonId =
  | "use-state-counter"
  | "props-example"
  | "conditional-rendering"
  | "list-rendering"
  | "client-vs-server-component"
  | "page-tsx-route"
  | "layout-tsx-wrapper"
  | "route-handler-get-response"
  | "environment-variable-safety";

export type PreviewType = "live" | "simulated";

export type LivePreviewId =
  | "counter"
  | "props-card"
  | "conditional-toggle"
  | "tool-list";

export type CodeDemoLesson = {
  id: CodeDemoLessonId;
  title: string;
  difficulty: "Beginner" | "Beginner+" | "Intermediate";
  concept: string;
  code: string;
  correctCode: string;
  brokenCode?: string;
  withoutCode?: string;
  correctOutput: string;
  brokenOutput: string;
  simulatedError?: string;
  explanation: string;
  commonMistake: string;
  changeExplanation: string;
  whyItWorks: string;
  whyItBreaks: string;
  mentalModel: string;
  previewType: PreviewType;
  livePreviewId?: LivePreviewId;
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
    correctCode: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    brokenCode: `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    correctOutput:
      "The counter renders in the browser. Clicking the button increases the number.",
    brokenOutput:
      "Next.js treats the file as a Server Component, so hooks and click handlers are not allowed.",
    simulatedError:
      "Simulated error: useState only works in Client Components. Add the \"use client\" directive at the top of the file.",
    explanation:
      "useState stores a value that can change after the page loads. Clicking the button updates count and React redraws the button text.",
    commonMistake:
      "Forgetting the \"use client\" directive when using useState in the App Router.",
    changeExplanation:
      "Changing the initial value in useState changes the first number users see. Changing count + 1 changes how much each click adds.",
    whyItWorks:
      "\"use client\" tells Next.js this component runs in the browser, where React can keep state and listen for clicks.",
    whyItBreaks:
      "Without \"use client\", the component is server-rendered by default. Server Components cannot use browser-only hooks or event handlers.",
    mentalModel:
      "Server Components prepare UI. Client Components can remember things and react to user actions.",
    previewType: "live",
    livePreviewId: "counter",
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
    correctCode: `type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}

export default function Page() {
  return <Greeting name="Ada" />;
}`,
    brokenCode: `function Greeting() {
  return <p>Hello, name!</p>;
}

export default function Page() {
  return <Greeting />;
}`,
    correctOutput: "The page renders: Hello, Ada!",
    brokenOutput:
      "The component has no passed-in name value, so it cannot render a personalized greeting.",
    simulatedError:
      "Simulated output: Hello, name! The component prints literal text because no name prop was passed in.",
    explanation:
      "The parent Page component passes a fixed name prop to Greeting. Greeting reads that prop and renders it in the message.",
    commonMistake:
      "Treating props like global variables instead of values passed into a component.",
    changeExplanation:
      "Changing name=\"Ada\" to another value changes the rendered greeting while keeping the component reusable.",
    whyItWorks:
      "The parent gives the child a named input, and the child reads that input from its function parameters.",
    whyItBreaks:
      "Without a prop, the child has no reliable value to display and the component stops being reusable.",
    mentalModel:
      "Props are like labeled arguments you hand to a component when you render it.",
    previewType: "live",
    livePreviewId: "props-card",
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
    correctCode: `type StatusMessageProps = {
  isLoggedIn: boolean;
};

function StatusMessage({ isLoggedIn }: StatusMessageProps) {
  if (isLoggedIn) {
    return <p>Welcome back.</p>;
  }

  return <p>Please sign in.</p>;
}`,
    brokenCode: `function StatusMessage() {
  return (
    <>
      <p>Welcome back.</p>
      <p>Please sign in.</p>
    </>
  );
}`,
    correctOutput:
      "The user sees one message: either Welcome back. or Please sign in.",
    brokenOutput:
      "The user sees both states at once, which makes the interface confusing.",
    simulatedError:
      "Simulated broken output: Welcome back. and Please sign in. appear together.",
    explanation:
      "The component checks isLoggedIn and returns one of two predefined UI states.",
    commonMistake:
      "Trying to show both branches at once instead of returning the UI that matches the current condition.",
    changeExplanation:
      "Changing isLoggedIn from false to true switches the message from the signed-out state to the welcome state.",
    whyItWorks:
      "The condition acts like a fork in the road, so React receives only the UI that matches the current state.",
    whyItBreaks:
      "Without the condition, React has no rule for choosing and renders conflicting messages.",
    mentalModel:
      "Conditional rendering is a question: if this is true, show A; otherwise, show B.",
    previewType: "live",
    livePreviewId: "conditional-toggle",
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
    correctCode: `const tools = ["JSON Formatter", "README Generator", "Git Helper"];

export function ToolList() {
  return (
    <ul>
      {tools.map((tool) => (
        <li key={tool}>{tool}</li>
      ))}
    </ul>
  );
}`,
    brokenCode: `const tools = ["JSON Formatter", "README Generator", "Git Helper"];

export function ToolList() {
  return (
    <ul>
      {tools.map((tool) => (
        <li>{tool}</li>
      ))}
    </ul>
  );
}`,
    correctOutput: "The page renders one clean list item for each tool.",
    brokenOutput:
      "The list may render, but React cannot reliably track each item without a key.",
    simulatedError:
      'Simulated warning: Each child in a list should have a unique "key" prop.',
    explanation:
      "map turns each item in the tools array into an li element. The key helps React track each item.",
    commonMistake:
      "Forgetting a stable key or using an unstable value when rendering lists.",
    changeExplanation:
      "Adding another string to the tools array adds another list item to the preview.",
    whyItWorks:
      "map transforms data into repeated UI, and key gives each repeated element a stable identity.",
    whyItBreaks:
      "Without mapping to elements, React does not get the structure you intend for each item.",
    mentalModel:
      "A list is data plus a template for one row. map applies the template to every item.",
    previewType: "live",
    livePreviewId: "tool-list",
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
    correctCode: `// Server Component for static content
export default function Page() {
  return <h1>Fast static content</h1>;
}

// Separate Client Component for interactivity
"use client";

import { useState } from "react";

export function Toggle() {
  const [enabled, setEnabled] = useState(false);
  return <button onClick={() => setEnabled(!enabled)}>Toggle</button>;
}`,
    brokenCode: `import { useState } from "react";

export default function Page() {
  const [enabled, setEnabled] = useState(false);
  return <button onClick={() => setEnabled(!enabled)}>Toggle</button>;
}`,
    correctOutput:
      "Static page content can stay server-rendered while the toggle lives in a Client Component.",
    brokenOutput:
      "The page tries to use browser interactivity in a Server Component.",
    simulatedError:
      "Simulated error: Hooks and event handlers need a Client Component boundary.",
    explanation:
      "In the App Router, components are Server Components unless marked with \"use client\". Hooks and browser events belong in Client Components.",
    commonMistake:
      "Adding useState or onClick to a Server Component without moving that interactive part into a Client Component.",
    changeExplanation:
      "Moving the interactive button into a Client Component keeps the static page server-rendered while allowing browser interaction.",
    whyItWorks:
      "The static part and interactive part have clear jobs, so each runs in the right environment.",
    whyItBreaks:
      "The server cannot attach browser click behavior or keep browser state for a user session.",
    mentalModel:
      "Use Server Components for prepared content and Client Components for browser behavior.",
    previewType: "simulated",
  },
  {
    id: "page-tsx-route",
    title: "page.tsx creates a route",
    difficulty: "Beginner",
    concept: "A page.tsx file makes a route render UI in the App Router.",
    code: `// app/about/page.tsx
export default function AboutPage() {
  return <h1>About</h1>;
}`,
    correctCode: `// app/about/page.tsx
export default function AboutPage() {
  return <h1>About</h1>;
}`,
    withoutCode: `// app/about/
// No page.tsx file here`,
    correctOutput: "Visiting /about renders the About page.",
    brokenOutput:
      "The /about segment has no page component to render as a route.",
    simulatedError:
      "Simulated output: /about has no page UI because app/about/page.tsx is missing.",
    explanation:
      "In the App Router, a folder becomes a URL segment, but page.tsx is the file that gives that segment visible page UI.",
    commonMistake:
      "Creating a folder for a route but forgetting to add page.tsx inside it.",
    changeExplanation:
      "Changing the JSX returned from page.tsx changes what users see at that route.",
    whyItWorks:
      "Next.js recognizes page.tsx as the special file for route UI.",
    whyItBreaks:
      "Without page.tsx, the folder can organize files, but it does not create a page by itself.",
    mentalModel:
      "Folder path decides the URL. page.tsx decides what appears at that URL.",
    previewType: "simulated",
  },
  {
    id: "layout-tsx-wrapper",
    title: "layout.tsx wraps child pages",
    difficulty: "Beginner+",
    concept: "A layout.tsx file creates shared UI around nested routes.",
    code: `// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>Dashboard nav</nav>
      {children}
    </section>
  );
}`,
    correctCode: `// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>Dashboard nav</nav>
      {children}
    </section>
  );
}`,
    withoutCode: `// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <h1>Settings</h1>;
}`,
    correctOutput:
      "Dashboard child pages render inside the shared dashboard navigation.",
    brokenOutput:
      "The Settings page still renders, but without the shared dashboard shell.",
    simulatedError:
      "Simulated output: Settings renders without Dashboard nav because app/dashboard/layout.tsx is missing.",
    explanation:
      "layout.tsx wraps every child page below its folder, which is useful for shared navigation and structure.",
    commonMistake:
      "Repeating the same navigation in every page instead of placing it once in layout.tsx.",
    changeExplanation:
      "Changing layout.tsx changes the shared wrapper for all child pages in that segment.",
    whyItWorks:
      "Next.js passes the active child page as children into the layout component.",
    whyItBreaks:
      "Without layout.tsx, each page renders alone and has no shared parent shell from that segment.",
    mentalModel:
      "A layout is a frame. Child pages are the picture placed inside the frame.",
    previewType: "simulated",
  },
  {
    id: "route-handler-get-response",
    title: "Route Handler GET response",
    difficulty: "Beginner+",
    concept: "Route Handlers return API-style responses from app route.ts files.",
    code: `// app/api/health/route.ts
export async function GET() {
  return Response.json({
    ok: true,
    service: "DevToolBox AI"
  });
}`,
    correctCode: `// app/api/health/route.ts
export async function GET() {
  return Response.json({
    ok: true,
    service: "DevToolBox AI"
  });
}`,
    withoutCode: `// app/api/health/
// No route.ts file here`,
    correctOutput: "A GET request to /api/health returns JSON.",
    brokenOutput: "There is no API endpoint for /api/health.",
    simulatedError:
      "Simulated error: /api/health does not match a Route Handler because route.ts is missing.",
    explanation:
      "A GET export in route.ts handles GET requests and returns a JSON response. This lesson only simulates the response preview.",
    commonMistake:
      "Expecting a Route Handler to render page UI. Use page.tsx for UI and route.ts for request handlers.",
    changeExplanation:
      "Changing the object passed to Response.json changes the JSON body clients receive.",
    whyItWorks:
      "Next.js recognizes route.ts as the special file for HTTP method handlers like GET.",
    whyItBreaks:
      "Without route.ts, the app folder does not define an API-style handler for that path.",
    mentalModel:
      "page.tsx answers with UI. route.ts answers with data or another HTTP response.",
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
    correctCode: `// Server-only secret:
const apiKey = process.env.OPENROUTER_API_KEY;

// Browser-safe public value:
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;`,
    brokenCode: `// Unsafe: this exposes the key to browser bundles
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;`,
    correctOutput:
      "The public site URL can appear in the browser. The private API key stays on the server.",
    brokenOutput:
      "A secret with NEXT_PUBLIC_ can become visible to anyone using the browser.",
    simulatedError:
      "Simulated risk: the private key is bundled into client-side JavaScript and can be inspected in the browser.",
    explanation:
      "Variables prefixed with NEXT_PUBLIC_ are bundled for browser use. Secret keys should not use that prefix and should only be read on the server.",
    commonMistake:
      "Putting a private API key in a NEXT_PUBLIC_* variable, which exposes it to browser code.",
    changeExplanation:
      "Changing whether NEXT_PUBLIC_SITE_URL is set changes the safe public label. The private API key should never be displayed.",
    whyItWorks:
      "Server-only variables stay outside browser bundles, while explicitly public variables are safe to show.",
    whyItBreaks:
      "The NEXT_PUBLIC_ prefix is a promise that a value may be sent to the browser, so secrets must not use it.",
    mentalModel:
      "If the browser needs it, it can be public. If it is a secret, keep it server-only.",
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
