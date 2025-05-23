declare module '@headlessui/react' {
  import * as React from 'react';

  interface MenuProps {
    as?: React.ElementType;
    children?: React.ReactNode;
    className?: string;
  }
  export const Menu: React.FC<MenuProps> & {
    Button: React.FC<any>;
    Items: React.FC<any>;
    Item: React.FC<any>;
  };

  interface TransitionProps {
    as?: React.ElementType;
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children?: React.ReactNode;
  }
  export const Transition: React.FC<TransitionProps> & {
    Child: React.FC<any>;
    Root: React.FC<any>;
  };

  interface DisclosureProps {
    as?: React.ElementType;
    defaultOpen?: boolean;
    children?: React.ReactNode | ((props: any) => React.ReactNode);
  }
  export const Disclosure: React.FC<DisclosureProps> & {
    Button: React.FC<any>;
    Panel: React.FC<any>;
  };

  interface DialogProps {
    as?: React.ElementType;
    open?: boolean;
    onClose?: (value: boolean) => void;
    children?: React.ReactNode | ((props: any) => React.ReactNode);
  }
  export const Dialog: React.FC<DialogProps> & {
    Overlay: React.FC<any>;
    Title: React.FC<any>;
    Description: React.FC<any>;
    Panel: React.FC<any>;
  };
} 