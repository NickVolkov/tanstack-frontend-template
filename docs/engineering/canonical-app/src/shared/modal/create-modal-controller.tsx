import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export function createModalController<Params>(name: string) {
  type ModalState = { isOpen: boolean; params?: Params };
  type ModalController = ModalState & {
    open: (params: Params) => void;
    close: () => void;
  };

  const Context = createContext<ModalController | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ModalState>({ isOpen: false });
    const value = useMemo<ModalController>(
      () => ({
        ...state,
        open: (params) => setState({ isOpen: true, params }),
        close: () => setState((current) => ({ ...current, isOpen: false })),
      }),
      [state],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useModal() {
    const controller = useContext(Context);
    if (!controller) throw new Error(`${name} modal must be used inside its Provider`);
    return controller;
  }

  Provider.displayName = `${name}ModalProvider`;
  return { Provider, useModal };
}
