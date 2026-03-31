"use client";

import { useState } from "react";
import {
  cn,
  darkCompactGhostButtonClass,
  darkCompactPrimaryButtonClass,
  darkInsetPanelClass,
} from "../components/stackaura-ui";

const highlightTokens = new Set(["routing", "fallback", "true", "True"]);

const codeExamples = {
  node: `const payment = await stackaura.payments.create({
  amountCents: 129900,
  currency: "ZAR",
  reference: "ORD-40291",
  customer: {
    email: "merchant@example.com"
  },
  routing: {
    mode: "smart",
    fallback: true
  }
});`,
  python: `payment = stackaura.payments.create(
    amount_cents=129900,
    currency="ZAR",
    reference="ORD-40291",
    customer={"email": "merchant@example.com"},
    routing={
        "mode": "smart",
        "fallback": True,
    },
)`,
  php: `$payment = $stackaura->payments->create([
    'amountCents' => 129900,
    'currency' => 'ZAR',
    'reference' => 'ORD-40291',
    'customer' => [
        'email' => 'merchant@example.com',
    ],
    'routing' => [
        'mode' => 'smart',
        'fallback' => true,
    ],
]);`,
} as const;

type CodeTab = keyof typeof codeExamples;

const tabLabels: Record<CodeTab, string> = {
  node: "Node.js",
  python: "Python",
  php: "PHP",
};

function renderHighlightedLine(line: string) {
  const segments = line.split(/(routing|fallback|true|True)/g);

  return segments.map((segment, index) => {
    if (highlightTokens.has(segment)) {
      return (
        <span key={`${segment}-${index}`} className="font-medium text-[#8dd8ff]">
          {segment}
        </span>
      );
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
}

export default function CodeTabs() {
  const [activeTab, setActiveTab] = useState<CodeTab>("node");

  return (
    <div className={cn(darkInsetPanelClass, "backdrop-blur-none p-5")}>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(codeExamples) as CodeTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              activeTab === tab ? darkCompactPrimaryButtonClass : darkCompactGhostButtonClass,
              "min-h-[38px] rounded-xl px-3 py-2 backdrop-blur-none"
            )}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8dd8ff]">
        Single API call
      </div>

      <pre className="mt-3 overflow-x-auto rounded-[20px] border border-white/10 bg-[#020b16] p-5 text-sm leading-7 text-[#d6e3f0]">
        <code>
          {codeExamples[activeTab].split("\n").map((line, index) => (
            <div key={`${activeTab}-${index}`} className="whitespace-pre">
              {renderHighlightedLine(line)}
            </div>
          ))}
        </code>
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#d3def0]">
          routing object included
        </div>
        <div className="inline-flex rounded-full border border-[#8dd8ff]/20 bg-[#8dd8ff]/8 px-3 py-1.5 text-xs text-[#8dd8ff]">
          fallback: true
        </div>
      </div>
    </div>
  );
}
