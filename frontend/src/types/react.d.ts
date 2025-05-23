declare module 'react' {
  export interface ReactNode {
    // ReactNode can be a ReactElement, a string, a number, etc.
  }
  
  export interface Component<P = {}, S = {}> {
    render(): ReactNode;
    props: P;
    state: S;
  }
  
  export interface FunctionComponent<P = {}> {
    (props: P): ReactNode;
  }
  
  export type FC<P = {}> = FunctionComponent<P>;
  
  export interface HTMLAttributes<T> {
    className?: string;
    style?: any;
    onClick?: (event: any) => void;
    // Add more as needed
  }
  
  export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string;
    target?: string;
    rel?: string;
  }
  
  export interface SVGProps<T> {
    className?: string;
    fill?: string;
    height?: number | string;
    width?: number | string;
    // Add more as needed
  }
  
  export interface ElementType {
    // Placeholder for element types
  }
  
  export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
  
  export interface ComponentClass<P = {}, S = {}> {
    new(props: P): Component<P, S>;
  }
  
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  
  export interface FormEvent<T = Element> {
    preventDefault(): void;
    target: T;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: React.Context<T>): T;
  
  export interface Context<T> {
    Provider: ComponentType<{ value: T; children?: ReactNode }>;
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
  }
  
  export function createContext<T>(defaultValue: T): Context<T>;
  
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {}
  }
  
  // Add Fragment support
  export interface FragmentProps {
    children?: ReactNode;
    key?: string | number;
  }
  export const Fragment: React.ComponentType<FragmentProps>;
  
  // Add StrictMode component
  export const StrictMode: React.ComponentType<{children?: ReactNode}>;
} 