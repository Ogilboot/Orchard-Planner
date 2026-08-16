"use client";

import { useEffect } from "react";
import { markAllMessagesRead } from "@/lib/actions/messages";

export default function MarkMessagesRead() {
  useEffect(() => {
    markAllMessagesRead();
  }, []);

  return null;
}
