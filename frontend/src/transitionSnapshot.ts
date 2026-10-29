const scrollPositions = new WeakMap<
  HTMLElement,
  { element: HTMLElement; top: number; left: number }[]
>();

export function restoreSnapshotScroll(copy: HTMLElement) {
  scrollPositions.get(copy)?.forEach(({ element, top, left }) => {
    element.scrollTop = top;
    element.scrollLeft = left;
  });
  scrollPositions.delete(copy);
}

// Visual copies have no React state, events, accessible identity or API lifecycle.
export function motionAllowed() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches ??
    false
  );
}

export function transitionSnapshot(source: HTMLElement, rootTag?: "div") {
  let copy = source.cloneNode(true) as HTMLElement;
  if (rootTag) {
    const wrapper = document.createElement(rootTag);
    [...copy.attributes].forEach(({ name, value }) =>
      wrapper.setAttribute(name, value),
    );
    wrapper.append(...copy.childNodes);
    copy = wrapper;
  }
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const copies = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  const scroll = originals.flatMap((original, index) =>
    original.scrollTop || original.scrollLeft
      ? [
          {
            element: copies[index],
            top: original.scrollTop,
            left: original.scrollLeft,
          },
        ]
      : [],
  );
  scrollPositions.set(copy, scroll);
  copies.forEach((element, index) => {
    element.removeAttribute("id");
    element.removeAttribute("name");
    element.removeAttribute("form");
    element.removeAttribute("for");
    element.removeAttribute("aria-labelledby");
    element.removeAttribute("aria-describedby");
    element.removeAttribute("autofocus");
    if (element instanceof HTMLSelectElement) {
      element.selectedIndex = (
        originals[index] as HTMLSelectElement
      ).selectedIndex;
    }
    if (
      element instanceof HTMLCanvasElement &&
      element.width &&
      element.height
    ) {
      element
        .getContext("2d")
        ?.drawImage(originals[index] as HTMLCanvasElement, 0, 0);
    }
  });
  copy.inert = true;
  copy.setAttribute("aria-hidden", "true");
  return copy;
}
