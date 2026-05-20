import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { NextjsFileTreeVisualizerTool } from "./nextjs-file-tree-visualizer-tool";

const dynamicRouteExamples = `app/blog/[slug]/page.tsx
app/docs/[category]/[article]/page.tsx
app/products/[id]/loading.tsx`;

export const metadata = createMetadata({
  title: "Next.js File Tree Visualizer",
  description:
    "Visualize how Next.js App Router paths map to app directory files for pages, layouts, loading UI, error UI, and route handlers.",
  path: "/tools/nextjs-file-tree-visualizer",
});

export default function NextjsFileTreeVisualizerPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Educational developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Next.js File Tree Visualizer
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Learn how App Router routes map to files in the Next.js{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-base">
            app
          </code>{" "}
          directory. Enter a route path, choose a route type, and see the file
          tree, explanation, and preview without creating or running code.
        </p>
      </div>

      <div className="mt-10">
        <NextjsFileTreeVisualizerTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-app-router">
            <h2
              id="what-is-app-router"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What is the Next.js App Router?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The App Router is Next.js routing based on folders and special
              files inside the <code>app</code> directory. Each folder segment
              becomes part of the URL, and files like <code>page.tsx</code>,{" "}
              <code>layout.tsx</code>, and <code>route.ts</code> tell Next.js
              what to render or how to respond.
            </p>
          </section>

          <section aria-labelledby="how-routes-map">
            <h2
              id="how-routes-map"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How routes map to files
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A URL like <code>/dashboard/settings</code> maps to folders under{" "}
              <code>app/dashboard/settings</code>. Add <code>page.tsx</code> in
              that folder to render the page, or add another special file to
              change behavior for that route segment.
            </p>
          </section>

          <section aria-labelledby="page-tsx">
            <h2
              id="page-tsx"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What page.tsx does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              <code>page.tsx</code> defines the UI for a route. For example,{" "}
              <code>app/about/page.tsx</code> renders the <code>/about</code>{" "}
              page, while <code>app/blog/[slug]/page.tsx</code> renders a
              dynamic blog detail route.
            </p>
          </section>

          <section aria-labelledby="layout-tsx">
            <h2
              id="layout-tsx"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What layout.tsx does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              <code>layout.tsx</code> wraps child routes in a shared shell. It
              is commonly used for navigation, sidebars, persistent page
              structure, and shared styling across a group of nested routes.
            </p>
          </section>

          <section aria-labelledby="route-ts">
            <h2
              id="route-ts"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What route.ts does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              <code>route.ts</code> creates a Route Handler. Route Handlers are
              used for API-style endpoints, such as{" "}
              <code>app/api/health/route.ts</code> for <code>/api/health</code>.
              This visualizer only explains the file path; it never creates a
              backend route for you.
            </p>
          </section>

          <section aria-labelledby="dynamic-routes">
            <h2
              id="dynamic-routes"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Dynamic route examples
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Square brackets define dynamic segments. A folder named{" "}
              <code>[slug]</code> can match many URL values, such as{" "}
              <code>/blog/hello-world</code> or <code>/blog/nextjs-routing</code>.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{dynamicRouteExamples}</code>
            </pre>
          </section>

          <section aria-labelledby="faq">
            <h2
              id="faq"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              FAQ
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this tool create files in my project?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It only generates educational text in your browser. It
                  does not access your file system, write files, or execute code.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can I use it for API routes?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. Choose API Route Handler to see how a path like{" "}
                  <code>/api/health</code> maps to{" "}
                  <code>app/api/health/route.ts</code>.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Why does the route need to start with a slash?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  The slash makes the input look like a real URL path and keeps
                  the generated file tree predictable.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="related-tools"
          className="h-fit rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2
            id="related-tools"
            className="text-lg font-semibold tracking-tight text-slate-950"
          >
            Related tools
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li>
              <Link
                href="/tools/ai-coding-prompt-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                AI Coding Prompt Generator
              </Link>
              <p className="text-slate-600">Draft clearer coding prompts.</p>
            </li>
            <li>
              <Link
                href="/tools/readme-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Create project documentation.</p>
            </li>
            <li>
              <Link
                href="/tools/git-command-helper"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Git Command Helper
              </Link>
              <p className="text-slate-600">Review common Git commands.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
