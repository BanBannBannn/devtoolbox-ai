import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read the basic privacy practices for DevToolBox AI and its browser-based developer tools.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Privacy
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
        <p>
          DevToolBox AI is designed to avoid collecting personal information in
          v1. The planned tools should run mostly in your browser and should not
          require login.
        </p>
        <p>
          Do not paste secrets, passwords, private keys, or confidential company
          data into any online tool unless you have confirmed how that tool
          handles the data.
        </p>
        <p>
          Analytics, ads, or affiliate links may be added later. If that
          happens, this policy should be updated to explain what is used and why.
        </p>
      </div>
    </div>
  );
}
