import React from 'react';

type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: unknown): State { return { hasError: true, error }; }
  componentDidCatch(error: unknown) { console.error(error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 p-4 border rounded bg-red-50 text-red-800">
          <div className="font-semibold mb-1">Something went wrong.</div>
          <div className="text-sm opacity-80">Check console for details.</div>
        </div>
      );
    }
    return this.props.children;
  }
}
