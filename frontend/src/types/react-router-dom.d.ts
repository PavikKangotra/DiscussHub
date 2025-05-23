declare module 'react-router-dom' {
  import * as React from 'react';

  export interface BrowserRouterProps {
    basename?: string;
    children?: React.ReactNode;
    window?: Window;
  }
  export function BrowserRouter(props: BrowserRouterProps): any;
  
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }
  export function Route(props: RouteProps): any;
  
  export interface RoutesProps {
    children?: React.ReactNode;
    location?: any;
  }
  export function Routes(props: RoutesProps): any;
  
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
    replace?: boolean;
    state?: any;
  }
  export function Link(props: LinkProps): any;
  
  export function useNavigate(): (to: string, options?: { replace?: boolean, state?: any }) => void;
  export function useParams<T extends Record<string, string | undefined>>(): T;
  export function useLocation(): Location;
  
  // Add Fragment for JSX support
  export interface FragmentProps {
    children?: React.ReactNode;
  }
  export function Fragment(props: FragmentProps): any;
} 