import PatAvatar from "../components/PatAvatar";
import QuickSuggestionChips from "../components/QuickSuggestionChips";
import ChatWindow from "../components/ChatWindow";
import { useState } from "react";

export default function Home() {
  const [hasChatted, setHasChatted] = useState(false);

  const quick = [
    { label: "Tell me what you ate",       onClick: () => send("Tell me what you ate") },
    { label: "Tell me about your workout", onClick: () => send("Tell me about my workout") },
    { label: "Ask me anything",            onClick: () => send("Ask me anything") },
    { label: "Make me better",             onClick: () => send("Make me better") }
  ];

  function send(msg: string) {
    setHasChatted(true);
    /* TODO: wire into existing send-message logic */
    console.log("[send]", msg);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <div className="flex-1 flex flex-col items-center pt-12 px-4">
        <PatAvatar size={128} />
        <QuickSuggestionChips replies={quick} hide={hasChatted} />
        <div className="w-full max-w-3xl flex-1 mt-8">
          <ChatWindow onSend={send} className="h-full" />
        </div>
      </div>
    </div>
  );
}