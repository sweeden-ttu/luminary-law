import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Message, Attachment } from '../types';
import { geminiService, blobToBase64 } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  userRole: UserRole;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello. I am Law Luminary. I am set to **${userRole}** mode.\n\nHow can I assist you with research, drafting, or case analysis today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat if role changes significantly (optional, keeping history for now)
  useEffect(() => {
     setMessages(prev => [
         ...prev,
         {
             id: Date.now().toString(),
             role: 'model',
             text: `*System Note: Context switched to ${userRole}. Adjusting response style.*`,
             timestamp: new Date()
         }
     ]);
  }, [userRole]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await blobToBase64(file);
        let type: 'image' | 'audio' | 'pdf' = 'image';
        if (file.type.startsWith('audio')) type = 'audio';
        else if (file.type === 'application/pdf') type = 'pdf';

        newAttachments.push({
          type,
          url: URL.createObjectURL(file), // For preview
          base64Data: base64,
          mimeType: file.type
        });
      } catch (err) {
        console.error("File upload failed", err);
      }
    }
    setAttachments([...attachments, ...newAttachments]);
    // Clear input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
      attachments: [...attachments],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      // Pass the entire history plus the new message context
      const responseText = await geminiService.generateResponse(
        [...messages, userMsg],
        userRole,
        userMsg.text,
        userMsg.attachments
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error processing your request. Please check your network or API key.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-legal-700 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              {/* Attachments in Message History */}
              {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                      {msg.attachments.map((att, idx) => (
                          <div key={idx} className="bg-black/20 rounded p-1">
                              {att.type === 'image' && <img src={att.url} alt="attachment" className="h-20 w-auto rounded" />}
                              {att.type === 'audio' && <div className="flex items-center gap-1 text-xs p-2">🎤 Audio Clip</div>}
                              {att.type === 'pdf' && <div className="flex items-center gap-1 text-xs p-2">📄 PDF Doc</div>}
                          </div>
                      ))}
                  </div>
              )}

              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none prose-slate">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              )}
              <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.role === 'model' ? 'Law Luminary AI' : userRole} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 rounded-bl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-gray-500 ml-2 font-medium">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
            <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                {attachments.map((att, idx) => (
                    <div key={idx} className="relative group bg-white border border-gray-300 rounded-lg p-1 shadow-sm shrink-0">
                         {att.type === 'image' ? (
                            <img src={att.url} className="h-16 w-16 object-cover rounded" alt="preview" />
                         ) : (
                             <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded text-xl">
                                 {att.type === 'audio' ? '🎤' : '📄'}
                             </div>
                         )}
                        <button 
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="flex items-end gap-2">
           <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*,audio/*,.pdf"
              onChange={handleFileUpload}
            />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-legal-600 hover:bg-legal-100 rounded-lg transition-colors"
            title="Attach Document or Audio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>
          
          <div className="flex-1 bg-white border border-gray-300 rounded-lg focus-within:border-legal-500 focus-within:ring-1 focus-within:ring-legal-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Draft a demand letter, analyze a case, or ask for research..."
              className="w-full p-3 max-h-32 min-h-[50px] bg-transparent border-none focus:ring-0 resize-none text-sm"
              rows={1}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className={`p-3 rounded-lg shadow-sm transition-all flex items-center justify-center ${
              loading || (!input.trim() && attachments.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-legal-700 text-white hover:bg-legal-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400">
                 Law Luminary can make mistakes. Verify citations with an attorney.
                 {userRole === UserRole.ATTORNEY ? ' Search enabled (Simulated).' : ''}
             </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
