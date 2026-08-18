"use client";

import { useRef } from "react";

type Props = {
  message: string;
  className?: string;
  children: React.ReactNode;
};

export default function ConfirmSubmit({ message, className, children }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}