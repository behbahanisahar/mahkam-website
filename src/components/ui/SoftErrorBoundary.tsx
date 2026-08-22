"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Optional UI when the child tree fails (default: render nothing). */
  fallback?: ReactNode;
};

type State = { hasError: boolean };

/**
 * Catches render errors in non-critical client chrome (toasts, widgets)
 * so a single broken island does not take down the whole page.
 */
export class SoftErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SoftErrorBoundary]", error, info.componentStack);
    if (typeof window !== "undefined") {
      void fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: "error",
          source: "client",
          statusCode: 500,
          message: error.message || "SoftErrorBoundary caught render error",
          path: window.location.pathname,
          meta: { soft: true, stack: info.componentStack?.slice(0, 500) },
        }),
        keepalive: true,
      }).catch(() => {});
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
