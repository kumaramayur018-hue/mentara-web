import React, { useState } from 'react';
import { ChatHistory } from './ChatHistory';
import { EnhancedChatInterface } from './chat/EnhancedChatInterface';
import { BackToHomeIcon } from './BackToHome';

interface AIChatbotWrapperProps {
  onBack?: () => void;
}

export function AIChatbotWrapper({ onBack }: AIChatbotWrapperProps) {
  const [currentView, setCurrentView] = useState<'history' | 'chat'>('history');
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentView('chat');
  };

  const handleNewChat = async () => {
    const newConvId = `conv_${Date.now()}`;
    setActiveConversationId(newConvId);
    setCurrentView('chat');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
  };

  const handleConversationChange = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  if (currentView === 'history') {
    return (
      <ChatHistory
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onBack={onBack}
      />
    );
  }

  return (
    <EnhancedChatInterface
      conversationId={activeConversationId}
      onBack={handleBackToHistory}
      onConversationChange={handleConversationChange}
    />
  );
}