declare module 'react-dom/client' {
  import * as React from 'react';
  
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  
  export function createRoot(container: Element | null): Root;
  export function hydrateRoot(container: Element, children: React.ReactNode): Root;
} 