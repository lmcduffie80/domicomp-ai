"use client";

import { Component, type ReactNode } from "react";
import { PricingTable } from "@clerk/nextjs";

type BoundaryState = { hasError: boolean };

class PricingBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Checkout will appear here after Pro and Team plans are created in the Clerk Dashboard (Billing).
        </p>
      );
    }
    return this.props.children;
  }
}

export function PricingCheckout() {
  return (
    <PricingBoundary>
      <PricingTable />
    </PricingBoundary>
  );
}
