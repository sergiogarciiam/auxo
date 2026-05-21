import { Component, type ErrorInfo, type ReactNode } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: "#fff",
          }}
        >
          <Text
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            💪
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#000",
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Auxo encountered an unexpected error. Please restart the app or try
            again.
          </Text>

          {this.state.error && (
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                marginBottom: 24,
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
              }}
              numberOfLines={5}
            >
              {this.state.error.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={this.handleReset}
            style={{
              backgroundColor: "#2E90FA",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Try Again
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 12,
              color: "#999",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            If the problem persists, report the issue in Settings.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
