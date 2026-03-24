import Image from "next/image";
import { Plus } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Upload PDF",
    description: "Add your book file",
  },
  {
    number: "2",
    title: "AI Processing",
    description: "We analyze the content",
  },
  {
    number: "3",
    title: "Voice Chat",
    description: "Discuss with AI",
  },
];

export default function HeroSection() {
  return (
    <section className="wrapper pt-8 pb-12 mb-10 md:mb-16 md:pt-10">
      <div className="rounded-[14px] bg-[#f2dfb8] px-5 py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-[305px]">
            <h1 className="font-serif text-[2rem] font-semibold tracking-[-0.03em] text-[#1d1a17] md:text-[2.25rem]">
              Your Library
            </h1>
            <p className="mt-4 max-w-[280px] text-sm leading-6 text-[#5e5954] md:text-[15px]">
              Convert your books into interactive AI conversations. Listen, learn, and
              discuss your favorite reads.
            </p>

            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-3 font-serif text-lg font-semibold text-[#2a2724] shadow-[0_6px_20px_rgba(78,61,40,0.08)] transition-colors hover:bg-[#fbfaf7]"
            >
              <Plus className="size-4 stroke-[2.25]" />
              Add new book
            </button>
          </div>

          <div className="flex justify-center lg:flex-1">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books, globe, and reading lamp illustration"
              width={489}
              height={347}
              priority
              className="h-auto w-full max-w-[340px] object-contain md:max-w-[390px]"
            />
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[250px] rounded-[10px] bg-white p-4 shadow-[0_8px_24px_rgba(78,61,40,0.08)]">
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#d6d6d6] text-sm font-medium text-[#5c5c5c]">
                      {step.number}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-5 text-[#2a2724]">
                        {step.title}
                      </p>
                      <p className="text-xs leading-5 text-[#77716a]">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
