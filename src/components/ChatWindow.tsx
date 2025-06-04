import { useState } from "react";
import clsx from "clsx";

type Props = {
  onSend: (msg: string) => void;
  className?: string;
};

export default function ChatWindow({ onSend, className }: Props) {
  const [input, setInput] = useState("");
  
  return (
    <div className={clsx("flex flex-col fixed bottom-0 left-0 w-full z-50 bg-white border-t", className)}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4"/>
      
      {/* Caption bar */}
      <div className="h-16 flex items-center justify-center px-4 bg-white text-black font-medium">
        {/* Caption text will be animated here */}
      </div>
      
      {/* Sticky composer */}
      <form 
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim()) return;
          onSend(input.trim());
          setInput("");
        }}
        className="flex gap-3 p-4 bg-white w-full box-border"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Ask Anything"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-semibold transition-colors">
          Send
        </button>
      </form>
    </div>
  );
}