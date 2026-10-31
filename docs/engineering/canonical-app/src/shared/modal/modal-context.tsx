import { createContext, useContext, useMemo, useState, type JSX } from "react";
import type { ComponentProps, ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { useRefCallback } from "../hooks/use-ref-callback";

export type ModalBaseProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCloseEnd?: () => void;
  children: ReactNode;
};

const noop = () => {};

export default function createContextModal<C extends ComponentType<ModalBaseProps>, P = null>({
  name,
  ModalComponent,
  getInitialParams,
}: {
  name: string;
  ModalComponent: C;
  getInitialParams?: () => P;
}) {
  // Parameterless modals use null; parameterized modals provide their own factory.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const resolveInitialParams = getInitialParams ?? (() => null as P);
  type T = Omit<ComponentProps<C>, "isOpen" | "onOpenChange" | "children"> & {
    children?: ReactNode;
  };
  const ModalContext = createContext<{
    state: { isOpen: boolean; params: P };
    setState: Dispatch<SetStateAction<{ isOpen: boolean; params: P }>>;
  }>({ state: { isOpen: false, params: resolveInitialParams() }, setState: noop });

  function ModalContextProvider({
    initialState = false,
    children,
  }: {
    initialState?: boolean;
    children: ReactNode;
  }) {
    const [state, setState] = useState(() => ({
      isOpen: initialState,
      params: resolveInitialParams(),
    }));

    const context = useMemo(
      () => ({
        state,
        setState,
      }),
      [state],
    );

    return <ModalContext.Provider value={context}>{children}</ModalContext.Provider>;
  }

  function useModal(): Exclude<P, null> extends never
    ? {
        isOpen: boolean;
        toggle: VoidFunction;
        open: VoidFunction;
        close: VoidFunction;
      }
    : {
        isOpen: boolean;
        params: P;
        toggle: (params?: P) => void;
        open: (params: P) => void;
        onOpenChange: (value: boolean) => void;
        close: VoidFunction;
        setParams: (params: Partial<P>) => void;
        clearParams: VoidFunction;
      } {
    const { state, setState } = useContext(ModalContext);

    return useMemo(
      () => ({
        isOpen: state.isOpen,
        params: state.params,
        toggle: (outerParams?: P) => {
          setState(({ isOpen, params }) => {
            return { isOpen: !isOpen, params: outerParams ?? params };
          });
        },
        open: (outerParams?: P) => {
          setState(({ params }) => ({
            isOpen: true,
            params: outerParams ?? params,
          }));
        },
        close: () => {
          setState(({ params }) => ({ isOpen: false, params }));
        },
        onOpenChange: (value: boolean) => {
          setState(({ params }) => ({ isOpen: value, params }));
        },
        setParams: (newParams: Partial<P>) =>
          setState(({ isOpen, params }) => ({
            isOpen,
            params: { ...params, ...newParams },
          })),
        clearParams: () => setState(({ isOpen }) => ({ isOpen, params: resolveInitialParams() })),
      }),
      [state, setState],
    );
  }

  function Modal({ onCloseEnd, ...props }: T) {
    // @ts-expect-error TS mess
    const { isOpen, clearParams, onOpenChange } = useModal();

    const handleCloseEnd = useRefCallback(() => {
      clearParams();
      onCloseEnd?.();
    });
    // Removing an optional callback from T still leaves valid modal props.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const modalProps = props as T;

    return (
      // @ts-expect-error TS mess
      <ModalComponent
        {...modalProps}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onCloseEnd={handleCloseEnd}
      />
    );
  }

  function withProvider(Component: ComponentType) {
    return function <E>(View: ComponentType<E>) {
      return function WithProvider(props: E & JSX.IntrinsicAttributes) {
        return (
          <ModalContextProvider>
            <View {...props} />
            <Component />
          </ModalContextProvider>
        );
      };
    };
  }

  function withModal(Component: ComponentType, modalProps: T & JSX.IntrinsicAttributes) {
    return withProvider(() => (
      <Modal {...modalProps}>
        <Component />
      </Modal>
    ));
  }

  if (name) {
    ModalContextProvider.displayName = `${name}ModalContextProvider`;
    Modal.displayName = `${name}Modal`;
  }

  return {
    ModalContext,
    ModalContextProvider,
    Modal,
    useModal,
    withProvider,
    withModal,
  };
}
