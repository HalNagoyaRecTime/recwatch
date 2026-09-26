export type ScrollAxis = "vertical" | "horizontal";

export type ScrollMetrics = {
  position: number;
  scrollSize: number;
  viewportSize: number;
};

/** 要素・documentの差を共通Scrollbar操作から分離するadapterです。 */
export type ScrollbarTarget = {
  getMetrics: (axis: ScrollAxis) => ScrollMetrics;
  setPosition: (axis: ScrollAxis, position: number) => void;
  subscribeScroll: (listener: () => void) => () => void;
  observeSize: (listener: () => void) => () => void;
};

function getElementMetrics(element: HTMLElement, axis: ScrollAxis) {
  return axis === "vertical"
    ? {
        position: element.scrollTop,
        scrollSize: element.scrollHeight,
        viewportSize: element.clientHeight,
      }
    : {
        position: element.scrollLeft,
        scrollSize: element.scrollWidth,
        viewportSize: element.clientWidth,
      };
}

export function createElementScrollbarTarget(
  getElement: () => HTMLElement | null
): ScrollbarTarget {
  return {
    getMetrics: (axis) => {
      const element = getElement();
      return element
        ? getElementMetrics(element, axis)
        : { position: 0, scrollSize: 0, viewportSize: 0 };
    },
    setPosition: (axis, position) => {
      const element = getElement();
      if (!element) return;
      if (axis === "vertical") element.scrollTop = position;
      else element.scrollLeft = position;
    },
    subscribeScroll: (listener) => {
      const element = getElement();
      element?.addEventListener("scroll", listener, { passive: true });
      return () => element?.removeEventListener("scroll", listener);
    },
    observeSize: (listener) => {
      const element = getElement();
      if (!element) return () => {};

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(listener);
      const observedChildren = new Set<Element>();
      const observeChildren = () => {
        if (!resizeObserver) return;
        const children = new Set(Array.from(element.children));
        for (const child of observedChildren) {
          if (!children.has(child)) {
            resizeObserver.unobserve(child);
            observedChildren.delete(child);
          }
        }
        for (const child of children) {
          if (!observedChildren.has(child)) {
            resizeObserver.observe(child);
            observedChildren.add(child);
          }
        }
      };

      resizeObserver?.observe(element);
      observeChildren();

      const mutationObserver =
        typeof MutationObserver === "undefined"
          ? null
          : new MutationObserver(() => {
              observeChildren();
              listener();
            });
      mutationObserver?.observe(element, { childList: true });

      return () => {
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
      };
    },
  };
}

export function createDocumentScrollbarTarget(): ScrollbarTarget {
  const getRoot = () => document.scrollingElement ?? document.documentElement;

  return {
    getMetrics: (axis) => {
      const root = getRoot();
      const view = window;
      const body = document.body;
      return axis === "vertical"
        ? {
            position: view.scrollY || root.scrollTop,
            scrollSize: Math.max(
              root.scrollHeight,
              document.documentElement.scrollHeight,
              body?.scrollHeight ?? 0
            ),
            viewportSize:
              view.innerHeight || document.documentElement.clientHeight,
          }
        : {
            position: view.scrollX || root.scrollLeft,
            scrollSize: Math.max(
              root.scrollWidth,
              document.documentElement.scrollWidth,
              body?.scrollWidth ?? 0
            ),
            viewportSize:
              view.innerWidth || document.documentElement.clientWidth,
          };
    },
    setPosition: (axis, position) => {
      if (axis === "vertical") {
        window.scrollTo({
          top: position,
          left: window.scrollX,
          behavior: "auto",
        });
      } else {
        window.scrollTo({
          top: window.scrollY,
          left: position,
          behavior: "auto",
        });
      }
    },
    subscribeScroll: (listener) => {
      window.addEventListener("scroll", listener, { passive: true });
      return () => window.removeEventListener("scroll", listener);
    },
    observeSize: (listener) => {
      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(listener);
      resizeObserver?.observe(document.documentElement);
      if (document.body) resizeObserver?.observe(document.body);
      window.addEventListener("resize", listener);

      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener("resize", listener);
      };
    },
  };
}
