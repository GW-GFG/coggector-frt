import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE } from './api';

// Mock global fetch
global.fetch = vi.fn();

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have a configured API_BASE', () => {
    expect(API_BASE).toBeDefined();
  });

  it('fetchConversation should call the correct URL', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ conversationId: 'conv-1', messages: [] })
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    
    const { fetchConversation } = await import('./api');
    await fetchConversation('user-2', 'fake-token');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/conversations/user-2'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token'
        })
      })
    );
  });

  it('sendMessage should send a POST with the correct body', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        serverMsgId: 'msg-1',
        conversationId: 'conv-1',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        content: 'Hello',
        sentAt: new Date().toISOString()
      })
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    
    const { sendMessage } = await import('./api');
    await sendMessage('user-2', 'Hello', 'fake-token');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/conversations/user-2'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token'
        }),
        body: JSON.stringify({ content: 'Hello' })
      })
    );
  });

  it('should throw an error if the response is not OK', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      text: async () => 'Not found'
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    
    const { fetchConversation } = await import('./api');
    
    await expect(
      fetchConversation('user-2', 'fake-token')
    ).rejects.toThrow('HTTP 404');
  });
});
