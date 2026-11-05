"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { site } from "@/content/site";
import { MenuIcon } from "@/components/ui/icons";
import { SiteImage } from "@/components/ui/site-image";
import { SmartLink } from "@/components/ui/smart-link";
import { Symbiote } from "@/components/ui/symbiote";

const { nav, meta } = site;

/**
 * Fixed top navigation (SPEC.md §2.1). Fades and slides out as the page scrolls
 * from 200px to 400px. It comes back while anything inside it has keyboard focus.
 */
export function Nav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [200, 400], [1, 0]);
  const y = useTransform(scrollY, [200, 400], [0, -100]);
  const pointerEvents = useTransform(opacity, (o) => (o < 0.05 ? "none" : "auto"));

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="fixed inset-x-0 top-0 z-[999] border-b border-gray-100 bg-white/80 backdrop-blur-md focus-within:!pointer-events-auto focus-within:![transform:none] focus-within:!opacity-100"
    >
      <header className="w-full">
        <div className="flex h-20 items-center justify-between px-6 short:h-14 lg:px-12">
          <SmartLink href="/" aria-label={`${meta.name}, ${nav.homeLabel}`} className="group flex items-center gap-2">
            <SiteImage
              src={meta.avatar.src}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="text-xl font-bold tracking-tighter text-black">{meta.shortName}</span>
          </SmartLink>

          <nav aria-label={nav.landmarkLabel} className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    external={link.external}
                    className="text-nav font-medium text-gray-600 transition-colors hover:text-black"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <SmartLink
              href={nav.cta.href}
              external={nav.cta.external}
              className="group/goo relative isolate rounded-full bg-black px-7 py-2.5 text-nav font-bold text-white transition-all hover:bg-gray-800 active:scale-95 data-goo-caught:scale-[1.04] data-goo-caught:active:scale-[0.99]"
            >
              <Symbiote shape="rect" reach={150} thickness={8.5} />
              <span className="relative transition-colors group-data-goo-caught/goo:text-accent">{nav.cta.label}</span>
            </SmartLink>
            <MobileMenu />
          </div>
        </div>
      </header>
    </motion.div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close after navigating (adjusting state during render instead of in an effect).
  if (open && openedOn !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative lg:hidden">
      <button
        type="button"
        aria-label={nav.menuLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((value) => !value);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <ul
        id={menuId}
        hidden={!open}
        className="absolute right-0 top-full z-[1] mt-3 w-52 rounded-2xl border border-gray-100 bg-white p-2 text-sm text-gray-600 shadow-2xl"
      >
        {nav.links.map((link) => (
          <li key={link.href}>
            <SmartLink
              href={link.href}
              external={link.external}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-1.5 transition-colors hover:bg-black/5 hover:text-black"
            >
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
