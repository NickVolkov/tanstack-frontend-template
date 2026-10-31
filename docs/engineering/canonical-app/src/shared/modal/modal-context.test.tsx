import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import createContextModal, { type ModalBaseProps } from "./modal-context";

afterEach(cleanup);

function TestModal({ isOpen, onOpenChange, onCloseEnd, children }: ModalBaseProps) {
  return (
    <section data-testid="modal" data-open={String(isOpen)}>
      {children}
      <button onClick={() => onOpenChange(false)}>request close</button>
      <button onClick={onCloseEnd}>finish exit</button>
    </section>
  );
}

describe("createContextModal", () => {
  it("keeps params through close and clears them after the exit transition", () => {
    const { useModal, withModal } = createContextModal({
      name: "ArticleDetailsTest",
      ModalComponent: TestModal,
      getInitialParams: () => ({ articleId: null as string | null }),
    });

    function ModalContent() {
      const { params } = useModal();
      return <output>{params.articleId ?? "empty"}</output>;
    }

    function View() {
      const modal = useModal();
      return <button onClick={() => modal.open({ articleId: "article-42" })}>open details</button>;
    }

    const ViewWithModal = withModal(ModalContent, {})(View);
    render(<ViewWithModal />);

    fireEvent.click(screen.getByText("open details"));
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true");
    expect(screen.getByText("article-42")).toBeInTheDocument();

    fireEvent.click(screen.getByText("request close"));
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false");
    expect(screen.getByText("article-42")).toBeInTheDocument();

    fireEvent.click(screen.getByText("finish exit"));
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("supports parameterless modals without synthetic undefined params", () => {
    const { useModal, withModal } = createContextModal({
      name: "ArticleEditorTest",
      ModalComponent: TestModal,
    });

    function View() {
      const modal = useModal();
      return <button onClick={modal.open}>open editor</button>;
    }

    const ViewWithModal = withModal(() => <p>editor</p>, {})(View);
    render(<ViewWithModal />);

    fireEvent.click(screen.getByText("open editor"));
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true");
  });
});
