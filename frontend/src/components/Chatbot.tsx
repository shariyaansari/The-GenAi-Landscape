"use client";

import { useState, useEffect, useRef, FormEvent, MouseEvent } from "react";
import { MessageSquare, Send, X, Expand, Minimize } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Define the structure of a message object for TypeScript
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot = () => {
  // ... All state and functions are unchanged ...
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! How can I help you find the right AI tool? You can now move and expand this window.", sender: "bot" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const chatbotRef = useRef<null | HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id !== "chatbot-header") return;
    setIsDragging(true);
    setDragStart({ x: e.pageX - position.x, y: e.pageY - position.y });
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.pageX - dragStart.x, y: e.pageY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isExpanded]);

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const botResponse: Message = { text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorResponse: Message = {
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50"
        aria-label="Open chatbot"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  // Define the classes for the two states
  const defaultClasses = "bottom-6 right-6 w-full max-w-sm h-[60vh]";
  const expandedClasses = "inset-0 m-auto w-[80vw] h-[80vh] max-w-4xl";
  
  // Apply transform style only when not expanded
  const chatbotStyle = isExpanded
    ? {}
    : { transform: `translate(${position.x}px, ${position.y}px)` };

  return (
    <div
      ref={chatbotRef}
      style={chatbotStyle}
      // These classes control the smooth animation. When the width/height classes change,
      // `transition-all` ensures the change is animated over 300ms.
      className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 
                 transition-all duration-300 ease-in-out
                 ${isExpanded ? expandedClasses : defaultClasses}`}
    >
      <div
        id="chatbot-header"
        onMouseDown={handleMouseDown}
        className={`p-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center shrink-0 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <h3 className="font-semibold pointer-events-none">AI Tool Finder</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:opacity-75"
          >
            {isExpanded ? <Minimize size={18} /> : <Expand size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-75">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* This is the message list area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-3 py-2 max-w-xs break-words ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 prose prose-sm prose-p:my-2 prose-headings:my-2 dark:prose-invert"
              }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 max-w-xs bg-gray-200 dark:bg-gray-700">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* This is the message input form at the bottom */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t dark:border-gray-700 flex items-center shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., create a logo..."
          className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;