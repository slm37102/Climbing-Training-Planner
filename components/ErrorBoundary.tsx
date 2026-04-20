import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-stone-800 border border-stone-700 rounded-lg p-6 text-center">
            <h1 className="text-xl font-semibold text-amber-500 mb-2">Something went wrong</h1>
            <p className="text-sm text-stone-300 mb-4">
              An unexpected error occurred while loading this page. Please try reloading the app.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-stone-400 mb-4 font-mono break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-stone-900 font-medium px-4 py-2 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
