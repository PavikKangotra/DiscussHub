declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export function jsx(type: any, props: any): any;
  export function jsxs(type: any, props: any): any;
  export const Fragment: unique symbol;
} 