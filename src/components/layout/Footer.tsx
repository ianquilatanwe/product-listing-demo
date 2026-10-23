const LINK = "underline hover:text-brand";

/** Credits for the design and data, plus the author link. */
export function Footer() {
  return (
    <footer className="gradient-lilac mt-20 px-4 py-16 text-center text-sm text-ink sm:mt-28">
      <p className="text-2xl font-extrabold italic text-ink-strong">FashionHub</p>
      <p className="mt-4">
        Design:{" "}
        <a className={LINK} href="https://www.figma.com/community/file/1206898292713093171/single-product-product-list-page">
          Single Product &amp; Product List Page
        </a>{" "}
        by Kirit Goti (
        <a className={LINK} href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </a>
        ) · Data:{" "}
        <a className={LINK} href="https://dummyjson.com">
          DummyJSON
        </a>
      </p>
      <p className="mt-2">
        Built by{" "}
        <a className={LINK} href="https://github.com/ianquilatanwe">
          Ian Quilatan
        </a>
      </p>
    </footer>
  );
}
