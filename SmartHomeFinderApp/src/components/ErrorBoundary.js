import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // In production, send to an error-reporting service (e.g. Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1>Something went wrong</h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            Please try refreshing the page. If the problem persists, contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              background: "var(--primary-color, #265B3D)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
