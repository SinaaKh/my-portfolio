import Link from "next/link";
import type { ComponentProps } from "react";

type SmartLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  external?: boolean;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** next/link for internal routes, a plain anchor for external, mailto and tel links. */
export function SmartLink({ href, external, ...rest }: SmartLinkProps) {
  if (external || isExternal(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
  }
  if (/^(mailto|tel):/.test(href)) {
    return <a href={href} {...rest} />;
  }
  return <Link href={href} {...rest} />;
}
