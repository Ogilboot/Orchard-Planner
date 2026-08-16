"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={
        active
          ? "text-green-800 underline decoration-2 underline-offset-4"
          : "text-gray-600 hover:text-green-800"
      }
    >
      {children}
    </Link>
  );
}
