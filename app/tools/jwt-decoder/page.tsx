import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { JwtDecoderTool } from "./jwt-decoder-tool";

const commonClaims = `{
  "sub": "1234567890",
  "name": "Ban",
  "iat": 1699990000,
  "exp": 1700000000
}`;

export const metadata = createMetadata({
  title: "JWT Decoder",
  description:
    "Decode JWT header and payload data in your browser without verifying the signature.",
  path: "/tools/jwt-decoder",
});

export default function JwtDecoderPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          JWT Decoder
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Decode a JSON Web Token to inspect its header, payload, signature
          segment, and common timestamp claims. This tool decodes only and does
          not verify whether a token is trusted.
        </p>
      </div>

      <div className="mt-10">
        <JwtDecoderTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-jwt">
            <h2
              id="what-is-jwt"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What a JWT is
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A JSON Web Token, or JWT, is a compact token format often used to
              carry claims between systems. It usually contains three Base64URL
              encoded parts separated by dots: a header, a payload, and a
              signature.
            </p>
          </section>

          <section aria-labelledby="jwt-parts">
            <h2
              id="jwt-parts"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Header, payload, and signature
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>
                The header describes token metadata, commonly the signing
                algorithm and token type.
              </li>
              <li>
                The payload contains claims such as subject, issuer, audience,
                expiration, and custom application data.
              </li>
              <li>
                The signature is used by trusted systems to check whether the
                token was signed with the expected secret or key.
              </li>
            </ul>
          </section>

          <section aria-labelledby="decode-vs-verify">
            <h2
              id="decode-vs-verify"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Decode vs verify
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Decoding only converts Base64URL text into readable JSON. It does
              not prove the token is authentic, unmodified, unexpired, or safe
              to trust. Verification requires checking the signature and claims
              with the correct secret, public key, issuer, audience, and
              expiration rules.
            </p>
          </section>

          <section aria-labelledby="common-claims">
            <h2
              id="common-claims"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common JWT claims
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Common registered claims include `sub` for subject, `iss` for
              issuer, `aud` for audience, `iat` for issued at, `nbf` for not
              before, and `exp` for expiration. Timestamp claims are usually
              Unix seconds.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{commonClaims}</code>
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
                  Does this tool verify JWT signatures?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It only decodes the header and payload into readable JSON.
                  Use your authentication library or backend verification flow
                  to decide whether a token is valid.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Is my token sent to a server?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Decoding runs in your browser with local JavaScript. The
                  page does not add a backend or external API call.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can I use this to create or sign JWTs?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. This is only a decoder for inspection and debugging. It
                  does not generate, sign, refresh, or validate tokens.
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
                href="/tools/json-formatter"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                JSON Formatter
              </Link>
              <p className="text-slate-600">Format decoded JSON payloads.</p>
            </li>
            <li>
              <Link
                href="/tools/uuid-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                UUID Generator
              </Link>
              <p className="text-slate-600">Create IDs for test data.</p>
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
