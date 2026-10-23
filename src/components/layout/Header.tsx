import Image from "next/image";

/** Logo, static design nav, cart button with live count, bell and profile. */
export function Header({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const items = `${cartCount} ${cartCount === 1 ? "item" : "items"}`;
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 xl:px-20">
        <div className="flex items-center gap-[60px]">
          <p className="text-[26px] font-extrabold italic text-ink-strong sm:text-[32.8px]">FashionHub</p>
          {/* Static nav from the design: no pages behind these in the demo. */}
          <nav aria-label="Main" className="hidden gap-[50px] font-medium text-ink lg:flex">
            <span>Category</span>
            <span>Brand</span>
            <span>Contact</span>
            <span>FAQ&rsquo;s</span>
          </nav>
        </div>
        <div className="flex items-center gap-[17px]">
          <button
            onClick={onOpenCart}
            aria-label={`Open cart, ${items}`}
            className="relative grid size-[50px] place-items-center rounded-full bg-[#f5f1ee] motion-safe:transition hover:bg-[#ece3db] active:scale-95"
          >
            <Image src="/bag.svg" alt="" width={21} height={21} />
            {cartCount > 0 && (
              <span
                key={cartCount}
                aria-hidden
                className="absolute -top-[3px] left-[32px] grid h-5 min-w-5 place-items-center rounded-full border-[1.5px] border-white bg-ink px-1 text-[11px] font-semibold text-white motion-safe:animate-[pop_0.35s_ease-out]"
              >
                {cartCount}
              </span>
            )}
          </button>
          <span className="sr-only" role="status">
            {items} in cart
          </span>
          <div className="relative hidden size-[50px] place-items-center rounded-full bg-[#eeeff8] sm:grid">
            <Image src="/bell.svg" alt="" width={20} height={20} />
            <span className="absolute left-[29px] top-[2px] size-[10px] rounded-full border-[1.5px] border-white bg-danger" />
          </div>
          <div className="flex items-center gap-[14px]">
            <Image src="/avatar.png" alt="" width={50} height={50} className="size-[50px] rounded-full object-cover" />
            <div className="hidden flex-col gap-[7px] md:flex">
              <p className="text-xs font-medium text-muted">Good Morning!</p>
              <p className="font-semibold text-ink">Scarlet Johnson</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
