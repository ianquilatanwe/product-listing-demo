import Image from "next/image";

/** The design's promo banner; "Buy Now" calls onBuy. */
export function Banner({ onBuy }: { onBuy: () => void }) {
  return (
    <section className="gradient-lilac relative mt-6 flex min-h-[287px] items-center rounded-[18px] p-6 sm:mt-12 sm:px-[55px]">
      <div className="relative z-10 max-w-[377px]">
        <h1 className="text-[26px] font-bold text-brand sm:text-[34px]">Grab Upto 50% Off On Selected Headphone</h1>
        <button
          onClick={onBuy}
          className="mt-6 h-[49px] w-[136px] rounded-full bg-brand font-semibold text-white motion-safe:transition hover:bg-brand-hover hover:shadow-lg active:scale-95 sm:mt-11"
        >
          Buy Now
        </button>
      </div>
      {/* Same crop as the Figma frame: a 294×324 window onto a wider photo,
          37px taller than the banner so the head pops out of the top. */}
      <div className="absolute bottom-0 right-0 hidden h-[324px] w-[294px] overflow-hidden md:block lg:right-[176px]">
        <Image
          src="/hero.png"
          alt=""
          width={1200}
          height={675}
          priority
          className="absolute left-[-53.05%] top-[-13.45%] h-[113.45%] w-[221.81%] max-w-none"
        />
      </div>
    </section>
  );
}
