// app/chat/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const ChatPage = () => {
  const [messages, setMessages] = useState<{ user: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Temporarily disable scrolling on the body and html elements
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Clean up the overflow styles when the component unmounts
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", content: input }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: "AuraBot", content: data.reply },
        ]);
      } else {
        console.error("Chatbot API error:", data.error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: "Chatbot", content: `Error: ${data.error}` },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "Chatbot", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl h-[100vh] flex items-end justify-center bg-black-1">
      <section className="flex flex-col items-center w-full bg-black-2 rounded-t-lg shadow-xl h-full p-6">
        <h1 className="text-4xl font-bold mb-4 text-purple-1 text-center">Chat with AuraBot</h1>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto w-full p-4 bg-black-1 rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user === "You" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs md:max-w-sm lg:max-w-md break-words ${
                  msg.user === "You"
                    ? "bg-purple-1 text-white-1 self-end"
                    : "bg-black-5 text-white-2"
                }`}
              >
                <strong className="block font-semibold">{msg.user}:</strong> {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center justify-center">
              <Loader size={24} className="animate-spin text-purple-1" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input Area at the Bottom */}
        <div className="w-full flex gap-4 p-4 bg-black-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg p-3 border-none bg-black-5 text-white-1 focus:border-purple-1 focus:ring-offset-purple-1"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-1 text-white-1 font-semibold px-6 py-3 rounded-lg hover:bg-purple-2 transition-colors duration-200"
          >
            {loading ? "Loading..." : "Send"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
