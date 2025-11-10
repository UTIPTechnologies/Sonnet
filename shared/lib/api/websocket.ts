export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {};

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        if (onError) {
          onError(error);
        }
      };

      this.ws.onclose = (event) => {
        if (onClose) {
          onClose(event);
        }
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
      if (onError) {
        onError(e as Event);
      }
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

