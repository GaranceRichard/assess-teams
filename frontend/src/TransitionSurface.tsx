import { Component, Fragment, createRef, type ReactNode } from "react";
import {
  motionAllowed,
  restoreSnapshotScroll,
  transitionSnapshot,
} from "./transitionSnapshot";
import "./transitions.css";

type Props = {
  transitionKey: string | number | undefined;
  axis: "page" | "question";
  order?: number;
  className?: string;
  children: ReactNode;
};

// Capture before React mutates the old DOM, without keeping old components alive.
export class TransitionSurface extends Component<Props> {
  private root = createRef<HTMLDivElement>();
  private outgoing: HTMLElement | null = null;
  private media?: MediaQueryList;
  private timeout?: ReturnType<typeof setTimeout>;

  componentDidMount() {
    this.media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    this.media?.addEventListener("change", this.finish);
  }

  getSnapshotBeforeUpdate(previous: Props) {
    if (
      previous.transitionKey === this.props.transitionKey ||
      this.outgoing ||
      !motionAllowed()
    )
      return null;
    const live = this.root.current!.firstElementChild as HTMLElement;
    const copy = transitionSnapshot(live);
    copy.querySelectorAll("dialog").forEach((dialog) => dialog.remove());
    copy.className = "transition-outgoing";
    copy.style.width = `${live.getBoundingClientRect().width}px`;
    copy.style.height = `${live.getBoundingClientRect().height}px`;
    return copy;
  }

  componentDidUpdate(
    previous: Props,
    _state: unknown,
    snapshot: HTMLElement | null,
  ) {
    if (!snapshot) return;
    const root = this.root.current!;
    root.dataset.direction =
      (this.props.order ?? 0) < (previous.order ?? 0) ? "previous" : "next";
    this.outgoing = snapshot;
    root.append(snapshot);
    restoreSnapshotScroll(snapshot);
    root.dataset.moving = "true";
    // A bounded window coalesces rapid navigation; the live layer never restarts.
    this.timeout = setTimeout(this.finish, 400);
  }

  private finish = () => {
    clearTimeout(this.timeout);
    this.outgoing?.remove();
    this.outgoing = null;
    if (this.root.current) delete this.root.current.dataset.moving;
  };

  componentWillUnmount() {
    this.media?.removeEventListener("change", this.finish);
    this.finish();
  }

  render() {
    return (
      <div
        ref={this.root}
        className={`transition-surface ${this.props.className ?? ""}`}
        data-axis={this.props.axis}
      >
        <div
          className="transition-live"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) this.finish();
          }}
        >
          <Fragment key={this.props.transitionKey}>
            {this.props.children}
          </Fragment>
        </div>
      </div>
    );
  }
}
