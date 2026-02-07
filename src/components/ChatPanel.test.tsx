import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from './ChatPanel';

// API mock
vi.mock('../api', () => ({
  API_BASE: 'http://localhost:3000',
  fetchConversation: vi.fn().mockResolvedValue({ 
    conversationId: 'conv-1', 
    messages: [] 
  }),
  fetchOnlineUsers: vi.fn().mockResolvedValue({ onlineUserIds: [] }),
  sendMessage: vi.fn().mockResolvedValue({
    serverMsgId: 'msg-1',
    conversationId: 'conv-1',
    fromUserId: 'user-1',
    fromUsername: 'testuser',
    toUserId: 'user-2',
    content: 'Test message',
    sentAt: new Date().toISOString()
  })
}));

describe('ChatPanel', () => {
  const mockProps: ChatPanelProps = {
    accessToken: 'fake-token',
    currentUser: { id: 'user-1', username: 'testuser', roles: ['buyer'] },
    isAuthenticated: true,
    selectedItem: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays a message prompting to log in if not authenticated', () => {
    render(<ChatPanel {...mockProps} isAuthenticated={false} />);
    expect(screen.getByText(/Connectez-vous pour activer le chat/i)).toBeInTheDocument();
  });

  it('displays a message prompting to select an item', () => {
    render(<ChatPanel {...mockProps} />);
    expect(screen.getByText(/Sélectionnez un article pour démarrer une conversation/i)).toBeInTheDocument();
  });

  it('displays the list of watchers for the owner', () => {
    const seller: UserBasic = { id: 'user-1', username: 'testuser' };
    const watcher: UserBasic = { id: 'user-2', username: 'buyer' };
    
    const item: Item = {
      id: 1,
      title: 'Test Item',
      category: 'test',
      description: 'desc',
      price: 100,
      currency: 'EUR',
      shippingFees: 5,
      sellerId: 'user-1',
      seller: seller,
      shopId: 1,
      status: 'available',
      imageUrl: 'test.jpg',
      watchers: [watcher]
    };

    render(<ChatPanel {...mockProps} selectedItem={item} />);
    
    expect(screen.getByText(/Acheteurs potentiels/i)).toBeInTheDocument();
    expect(screen.getByText('Buyer')).toBeInTheDocument(); // Username capitalized
  });

  it('displays the seller for a buyer', () => {
    const seller: UserBasic = { id: 'user-2', username: 'seller' };
    const watcher: UserBasic = { id: 'user-1', username: 'testuser' };
    
    const item: Item = {
      id: 1,
      title: 'Test Item',
      category: 'test',
      description: 'desc',
      price: 100,
      currency: 'EUR',
      shippingFees: 5,
      sellerId: 'user-2',
      seller: seller,
      shopId: 1,
      status: 'available',
      imageUrl: 'test.jpg',
      watchers: [watcher]
    };

    render(<ChatPanel {...mockProps} selectedItem={item} />);
    
    expect(screen.getByText(/Conversation avec le vendeur/i)).toBeInTheDocument();
    // Username capitalized
    expect(screen.getByText('Seller')).toBeInTheDocument();
  });

  it('does not allow sending an empty message', async () => {
    const user = userEvent.setup();
    const seller: UserBasic = { id: 'user-2', username: 'seller' };
    
    const item: Item = {
      id: 1,
      title: 'Test Item',
      category: 'test',
      description: 'desc',
      price: 100,
      currency: 'EUR',
      shippingFees: 5,
      sellerId: 'user-2',
      seller: seller,
      shopId: 1,
      status: 'available',
      imageUrl: 'test.jpg',
      watchers: []
    };

    render(<ChatPanel {...mockProps} selectedItem={item} />);
    
    const sendButton = screen.getByRole('button', { name: /Envoyer/i });
    await user.click(sendButton);
    
    // Verify that no API call was made
    const { sendMessage } = await import('../api');
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
