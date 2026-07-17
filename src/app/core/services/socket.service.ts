import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, fromEvent } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {

  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  /** Map of event name → shared Observable to avoid duplicate listeners */
  private listenerCache = new Map<string, Observable<unknown>>();
  private socketUrl = environment.socketUrl;

  /** Queue of events that were emitted before the socket connected */
  private emitQueue: Array<{ event: string; payload?: unknown }> = [];
  // ─── Connection ────────────────────────────────────────────────────────────

  /**
   * Connect (or reconnect) the socket using the JWT from localStorage.
   * If a socket is already open, this is a no-op.
   */
  connect(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[SocketService] No auth token found — socket not connected.');
      return;
    }

    // Disconnect stale socket (e.g. after logout/re-login with new token)
    if (this.socket && this.socket.connected) {
      return; // Already connected — nothing to do
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listenerCache.clear();
    }

    this.socket = io(this.socketUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.info('[SocketService] Connected:', this.socket?.id);
      // Flush any emissions that arrived before the handshake completed
      for (const item of this.emitQueue) {
        this.socket!.emit(item.event, item.payload);
      }
      this.emitQueue = [];
    });

    this.socket.on('disconnect', (reason: string) => {
      console.info('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.warn('[SocketService] Connection error:', err.message);
    });
  }

  /**
   * Disconnect and clean up the socket. Call on logout.
   */
  disconnect(): void {
    this.emitQueue = []; // discard any pending emissions on logout
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listenerCache.clear();
    }
  }

  /**
   * Re-connect with a freshly obtained token (e.g. after token refresh).
   */
  reconnectWithNewToken(): void {
    this.disconnect();
    this.connect();
  }

  // ─── Emit ──────────────────────────────────────────────────────────────────

  /**
   * Emit a socket event with an optional payload.
   */
  emit(event: string, payload?: unknown): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`[SocketService] Queuing "${event}" — socket not yet connected.`);
      this.emitQueue.push({ event, payload });
      return;
    }
    this.socket.emit(event, payload);
  }

  /**
   * Emit a socket event with a callback (acknowledgement).
   */
  emitWithAck<T>(event: string, payload?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error(`Socket not connected while emitting "${event}"`));
        return;
      }
      this.socket.emit(event, payload, (response: T) => {
        resolve(response);
      });
    });
  }

  // ─── Listen ────────────────────────────────────────────────────────────────

  /**
   * Returns a shared Observable for the given socket event.
   * Uses a cache to ensure a single listener per event name.
   */
  on<T>(event: string): Observable<T> {
    if (this.listenerCache.has(event)) {
      return this.listenerCache.get(event) as Observable<T>;
    }

    if (!this.socket) {
      // Return an Observable that immediately produces nothing — components can
      // subscribe safely and will receive events once connected.
      const empty$ = new Observable<T>(() => { });
      this.listenerCache.set(event, empty$ as Observable<unknown>);
      return empty$;
    }

    const obs$ = new Observable<T>((subscriber) => {
      const handler = (data: T) => subscriber.next(data);
      this.socket!.on(event, handler);
      return () => {
        this.socket?.off(event, handler);
      };
    }).pipe(
      share(),
      takeUntil(this.destroy$)
    );

    this.listenerCache.set(event, obs$ as Observable<unknown>);
    return obs$;
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
