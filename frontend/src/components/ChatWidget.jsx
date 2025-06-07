import React, { useState, useEffect, useRef } from "react";
// AUTHENTICATION DISABLED - Supabase realtime chat functionality disabled
import { getChatMessages, sendChatMessage } from '../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const ChatWidget = ({ appointmentId, currentUser, userRole }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['chatMessages', appointmentId],
    queryFn: () => getChatMessages(appointmentId),
    enabled: !!appointmentId,
    refetchOnWindowFocus: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => sendChatMessage(messageData),
    onSuccess: () => {
      setNewMessage('');
      // Invalidate and refetch messages
      queryClient.invalidateQueries(['chatMessages', appointmentId]);
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    },
  });

  // AUTHENTICATION DISABLED - Supabase Realtime subscription disabled
  // Real-time chat updates will need to be re-implemented with new auth system
  useEffect(() => {
    if (!appointmentId) return;

    // TODO: Re-implement realtime chat subscription when new auth system is ready
    // This should include:
    // - Supabase realtime channel subscription for chat messages
    // - Real-time message updates using postgres_changes
    // - Proper cleanup of subscriptions
    
    // For now, we'll use polling as a fallback (refetch every 5 seconds)
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['chatMessages', appointmentId]);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [appointmentId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      appointment_id: appointmentId,
      sender_id: currentUser.id,
      message: newMessage.trim(),
    };

    sendMessageMutation.mutate(messageData);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (senderId) => {
    return senderId === currentUser?.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Error loading messages: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">
          Appointment Chat
        </h3>
        <div className="text-sm text-gray-600">
          {userRole === 'RECEPTION' ? 'Viewing as Reception' : 'Participant'}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage(message.sender_id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm">{message.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    isOwnMessage(message.sender_id) ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatMessageTime(message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {userRole !== 'RECEPTION' && (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sendMessageMutation.isLoading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendMessageMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendMessageMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Reception View Notice */}
      {userRole === 'RECEPTION' && (
        <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800 rounded-b-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            You are viewing this conversation as reception staff. You cannot send messages.
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;