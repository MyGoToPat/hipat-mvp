import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import HamburgerMenu from "./components/HamburgerMenu";

const avatarGlow = {
  width: 200,
  height: 200,
  borderRadius: "50%",
  background: "radial-gradient(circle, #3b82f6 40%, #8b5cf6 80%, transparent 100%)",
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  margin: "auto",
  filter: "blur(12px)",
  opacity: 0.8,
  zIndex: 1
};
const avatarCircle = {
  width: 160,
  height: 160,
  borderRadius: "50%",
  background: "#222C3A",
  border: "5px solid #3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  zIndex: 2
};
const dot = {
  width: 20, height: 20,
  background: "#dbeafe",
  borderRadius: "50%",
  margin: "0 8px",
  display: "inline-block"
};

function PatAvatar() {
  return (
    <div style={{ margin: "48px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <div style={avatarGlow}></div>
        <div style={avatarCircle}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <span style={dot} />
            <span style={dot} />
            <span style={dot} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    "Tell me what you ate",
    "Tell me about your workout",
    "Ask me anything",
    "Make me better"
  ];
  const buttonStyle = {
    border: "2px solid #fff",
    color: "#fff",
    background: "transparent",
    borderRadius: 40,
    padding: "12px 40px",
    fontSize: 20,
    fontWeight: 500,
    margin: "8px 0",
    cursor: "pointer"
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
      {actions.map((txt, i) => (
        <button key={txt} style={buttonStyle}>
          {txt}
        </button>
      ))}
    </div>
  );
}

function ChatInputBar() {
  return (
    <div style={{
      position: "fixed", left: 0, bottom: 0, width: "100%", background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 24px", borderTopLeftRadius: 18, borderTopRightRadius: 18,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.15)"
    }}>
      <input
        style={{
          flex: 1, padding: "16px", fontSize: 18, borderRadius: 16, border: "1.5px solid #ddd",
          background: "#f6f6f6", marginRight: 18
        }}
        placeholder="Ask Anything"
      />
      <button style={{
        background: "#2563eb", color: "#fff", padding: "14px 38px", border: "none",
        borderRadius: 10, fontSize: 18, fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.13)", cursor: "pointer"
      }}>
        Send
      </button>
    </div>
  );
}

interface AppProps { children?: ReactNode }

export default function App({ children }: AppProps) {
  return (
    <div style={{
      minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", position: "relative"
    }}>
      <HamburgerMenu />
      <PatAvatar />
      <QuickActions />
      <div style={{
        flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", paddingBottom: 120
      }}>
        <h1 style={{
          fontSize: 44, fontWeight: 700, letterSpacing: 1, margin: "32px 0 0 0", textAlign: "center"
        }}>
          HOME CONTENT TEST
        </h1>
        {children || <Outlet />}
      </div>
      <ChatInputBar />
    </div>
  );
}