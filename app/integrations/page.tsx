import Image from "next/image";
import Link from "next/link";
import {
  PublicBackground,
  PublicFooter,
  PublicHeader,
  cn,
  darkHeroSurfaceClass,
  darkInsetPanelClass,
  darkMutedTextClass,
  darkPanelClass,
  darkPrimaryButtonClass,
  darkSectionEyebrowClass,
  darkSecondaryButtonClass,
} from "../components/stackaura-ui";
import CodeTabs from "./code-tabs";

const supportedRails = [
  {
    name: "Paystack",
    src: "/providers/paystack-wordmark-dark.svg",
    width: 148,
    height: 30,
    description: "Card payments through the same Stackaura routing, webhook, and recovery layer.",
  },
  {
    name: "Ozow",
    src: "/providers/ozow-wordmark-dark.svg",
    width: 132,
    height: 38,
    description: "Bank redirect and EFT coverage without rebuilding rail-specific checkout flows.",
  },
  {
    name: "Yoco",
    src: "/providers/yoco-wordmark-dark.svg",
    width: 108,
    height: 28,
    description: "Merchant-facing card acceptance inside one orchestration surface and API model.",
  },
] as const;

const howItWorks = [
  {
    step: "01",
    title: "Integrate once",
    description:
      "Connect your product to Stackaura instead of wiring each gateway’s auth, payment creation, and webhook model separately.",
  },
  {
    step: "02",
    title: "Configure routing",
    description:
      "Choose smart routing and keep fallback enabled so traffic can move when a provider path degrades.",
  },
  {
    step: "03",
    title: "Stackaura handles execution",
    description:
      "Payments run through connected rails while routing, recovery, and operational visibility stay centralized.",
  },
] as const;

const directVsStackaura = {
  without: [
    "Separate Paystack, Ozow, and Yoco integrations",
    "No shared fallback or failover posture",
    "Duplicated webhook and status logic",
    "More gateway-specific code to maintain",
  ],
  with: [
    "One API across supported payment rails",
    "Smart routing and fallback in one layer",
    "Cleaner payment execution and recovery",
    "Operational visibility from one control plane",
  ],
} as const;

export default function IntegrationsPage() {
  const sectionClass = "mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-10";

  return (
    <PublicBackground className="bg-[#06111f] text-white">
      <PublicHeader />

      <div className="relative pb-20">
        <section className={cn(sectionClass, "pt-16 sm:pt-20")}>
          <div
            className={cn(
              darkHeroSurfaceClass,
              "backdrop-blur-none px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
            )}
          >
            <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="max-w-3xl">
                <div className={darkSectionEyebrowClass}>Integrations</div>
                <h1 className="mt-5 text-[42px] font-semibold leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl lg:text-[72px]">
                  One integration. Multiple payment rails.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#d3def0] sm:text-[21px] sm:leading-8">
                  Use one unified API for Paystack, Ozow, and Yoco, keep smart routing and fallback
                  in one place, and stop duplicating provider logic across your product.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup" className={cn(darkPrimaryButtonClass, "rounded-2xl px-6 py-3.5")}>
                    Start integrating
                  </Link>
                  <Link href="/docs" className={cn(darkSecondaryButtonClass, "rounded-2xl px-6 py-3.5 backdrop-blur-none")}>
                    View docs
                  </Link>
                </div>

                <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d3def0]">
                  Handle multiple payment providers with one API
                </div>
              </div>

              <div className={cn(darkPanelClass, "backdrop-blur-none p-5 sm:p-6")}>
                <div className="grid gap-4">
                  <div className={cn(darkInsetPanelClass, "backdrop-blur-none p-4")}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8dd8ff]">
                      Why Stackaura
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">
                      Replace direct provider plumbing with one payment orchestration layer.
                    </div>
                    <p className={cn("mt-3 text-sm", darkMutedTextClass)}>
                      Routing, fallback handling, gateway selection, and operational visibility stay
                      consistent even as your rail mix changes.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {supportedRails.map((rail) => (
                      <div key={rail.name} className={cn(darkInsetPanelClass, "backdrop-blur-none p-4")}>
                        <Image
                          src={rail.src}
                          alt={rail.name}
                          width={rail.width}
                          height={rail.height}
                          className="h-[20px] w-auto object-contain"
                        />
                        <div className="mt-4 text-sm font-semibold text-white">{rail.name}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8dd8ff]">
                          Connected via Stackaura
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(sectionClass, "py-16 sm:py-20")}>
          <div className={darkSectionEyebrowClass}>Supported payment rails</div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {supportedRails.map((rail) => (
              <article key={rail.name} className={cn(darkPanelClass, "backdrop-blur-none p-6")}>
                <Image
                  src={rail.src}
                  alt={rail.name}
                  width={rail.width}
                  height={rail.height}
                  className="h-[22px] w-auto object-contain opacity-80 transition-opacity duration-200 ease-out hover:opacity-100 motion-reduce:transition-none"
                />
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">{rail.name}</h2>
                <p className={cn("mt-3 text-base leading-7", darkMutedTextClass)}>{rail.description}</p>
                <div className="mt-5 text-xs uppercase tracking-[0.16em] text-[#8b9cb3]">
                  Connected via Stackaura
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={cn(sectionClass, "py-16 sm:py-20")}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cn(darkPanelClass, "backdrop-blur-none p-6 sm:p-8")}>
              <div className={darkSectionEyebrowClass}>Without Stackaura</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                More direct integrations. More duplicated logic.
              </h2>
              <div className="mt-6 grid gap-3">
                {directVsStackaura.without.map((item) => (
                  <div key={item} className={cn(darkInsetPanelClass, "backdrop-blur-none px-4 py-3 text-sm text-[#d3def0]")}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={cn(darkPanelClass, "backdrop-blur-none p-6 sm:p-8")}>
              <div className={darkSectionEyebrowClass}>With Stackaura</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                One API. Smart routing. Automatic failover.
              </h2>
              <div className="mt-6 grid gap-3">
                {directVsStackaura.with.map((item) => (
                  <div key={item} className={cn(darkInsetPanelClass, "backdrop-blur-none px-4 py-3 text-sm text-[#d3def0]")}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={cn(sectionClass, "py-16 sm:py-20")}>
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className={cn(darkPanelClass, "backdrop-blur-none p-6 sm:p-8")}>
              <div className={darkSectionEyebrowClass}>How Stackaura works</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Build once, then let Stackaura handle the rails underneath.
              </h2>
              <div className="mt-6 grid gap-4">
                <div className={cn(darkInsetPanelClass, "backdrop-blur-none p-5")}>
                  <div className="grid gap-4 md:grid-cols-[0.9fr_auto_1.1fr] md:items-center">
                    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#8dd8ff]">Your app</div>
                      <div className="mt-2 text-lg font-semibold text-white">Single integration</div>
                    </div>

                    <div className="text-center text-xl text-[#8dd8ff]">→</div>

                    <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(130,226,255,0.10),rgba(76,109,255,0.12))] px-4 py-5 text-center">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#8dd8ff]">Stackaura API</div>
                      <div className="mt-2 text-lg font-semibold text-white">Routing + execution layer</div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-center text-xl text-[#8dd8ff]">↓</div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {supportedRails.map((rail) => (
                      <div key={rail.name} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                        <div className="text-sm font-semibold text-white">{rail.name}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-center text-xl text-[#8dd8ff]">↓</div>

                  <div className="rounded-[20px] border border-emerald-400/18 bg-emerald-400/8 px-4 py-4 text-center">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-emerald-200">
                      Automatic fallback
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">
                      Recovery logic stays inside one orchestration layer
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {howItWorks.map((step) => (
                <div key={step.step} className={cn(darkPanelClass, "backdrop-blur-none p-5 sm:p-6")}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8dd8ff]">
                    {step.step}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{step.title}</div>
                  <p className={cn("mt-2 text-sm", darkMutedTextClass)}>{step.description}</p>
                </div>
              ))}

              <div className={cn(darkInsetPanelClass, "backdrop-blur-none p-5")}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8dd8ff]">
                  Execution result
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Provider choice stays flexible while your API surface stays stable.
                </div>
                <p className={cn("mt-2 text-sm", darkMutedTextClass)}>
                  Your team keeps one integration contract while Stackaura handles payment routing,
                  failover posture, and gateway execution underneath.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(sectionClass, "py-16 sm:py-20")}>
          <div className={cn(darkPanelClass, "backdrop-blur-none p-6 sm:p-8")}>
            <div className={darkSectionEyebrowClass}>Developer example</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Create a payment once and keep routing + fallback in the request.
            </h2>
            <p className={cn("mt-4 text-base leading-7", darkMutedTextClass)}>
              The routing object stays explicit, <code className="rounded bg-white/6 px-1.5 py-0.5 text-[#8dd8ff]">fallback: true</code> stays in one place, and your product doesn&apos;t need provider-specific branching for every rail.
            </p>

            <div className="mt-6">
              <CodeTabs />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d3def0]">
                Sandbox / test mode supported
              </div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d3def0]">
                Routing object included
              </div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d3def0]">
                Automatic fallback supported
              </div>
            </div>
          </div>
        </section>

        <section className={cn(sectionClass, "pt-16 sm:pt-20")}>
          <div className={cn(darkHeroSurfaceClass, "backdrop-blur-none p-6 sm:p-8 lg:p-10")}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className={darkSectionEyebrowClass}>Final CTA</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  Start building on Stackaura today
                </h2>
                <p className={cn("mt-5 text-lg leading-8 text-[#d3def0]")}>
                  Keep your integration surface stable while Stackaura handles routing, fallback,
                  and multi-rail execution underneath.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className={cn(darkPrimaryButtonClass, "rounded-2xl px-6 py-3.5")}>
                  Start integrating
                </Link>
                <Link href="/dashboard" className={cn(darkSecondaryButtonClass, "rounded-2xl px-6 py-3.5 backdrop-blur-none")}>
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </PublicBackground>
  );
}
