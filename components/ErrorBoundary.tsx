"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div className="text-2xl" style={{ color: "var(--red)" }}>⚠</div>
          <div className="text-sm prompt" style={{ color: "var(--red)" }}>something went wrong</div>
          <div className="text-xs text-center" style={{ color: "var(--text-muted)", maxWidth: 400 }}>
            {this.state.message}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="px-4 py-2 text-xs"
            style={{ border: "1px solid var(--border-bright)", color: "var(--text-secondary)", borderRadius: 2 }}
          >
            try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
