import type { Dispatch, RefObject, SetStateAction } from "react";

export interface ItemRect {
  top: number;
  height: number;
  left: number;
  width: number;
}

export interface UseFluidHoverOptions {
  /**
   * With `nearest`, which direction to resolve the nearest item along.
   *   "y"  — vertical lists (default): closest by top/height
   *   "x"  — horizontal strips: closest by left/width
   *   "xy" — 2-D grids: closest card across both rows AND columns,
   *          measured by Euclidean distance to each item's center
   */
  axis?: "x" | "y" | "xy";
  /**
   * Makes an item invisible to hit-testing without unregistering it — for
   * rows that stay mounted while clipped away (a collapsed sub-tree).
   * Unregistering would invalidate every measurement; a skipped item keeps
   * the set stable. Consulted per mouse move, so keep it cheap.
   */
  isItemDisabled?: (element: HTMLElement) => boolean;
  /**
   * With `nearest`, whether a click that lands between items (a gap, the
   * padding, past the last row) is routed to the highlighted item, so what
   * is lit is what a click hits. On by default: in a menu or a list the
   * highlight is a promise about the click. Without `nearest` nothing is lit
   * between items, so there is nothing to route. Pass `false` where empty
   * space should stay
   * inert (rows with destructive actions, generous whitespace), or
   * `{ maxDistance }` to route only clicks within that many pixels of the
   * highlighted item's edge.
   */
  gapClick?: boolean | { maxDistance?: number };
  /**
   * Whether empty space lights the nearest item. Off by default: only the
   * item under the pointer lights, and the highlight fades out over empty
   * space (a popup's padding, the unfilled end of a grid row, a label beside
   * a control), gliding again from the next item it lands on. Pass `true` to
   * light the item nearest the pointer wherever it is in the container.
   */
  nearest?: boolean;
}

export interface UseFluidHoverReturn {
  activeIndex: number | null;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
  itemRects: ItemRect[];
  /**
   * True once every registered item has been measured and no remeasure is
   * pending, i.e. `itemRects` describes the current item set. Gate absolutely
   * positioned overlays on it: an overlay that mounts against a rect a later
   * pass still corrects animates from the wrong place to the right one, which
   * reads as the highlight sliding in from another row.
   */
  isMeasured: boolean;
  /**
   * Counts pointer entries. It steps when the pointer, having entered the
   * container, first moves the highlight, so the highlight keyed on it fades
   * in at the new row instead of sliding over from where it was last (a row
   * lit from the keyboard, or one still fading out).
   */
  session: number;
  /** The same count as `session`, for code that reads it outside a render. */
  sessionRef: RefObject<number>;
  handlers: {
    /** Picks the item nearest the pointer. Moves that happened in a
     *  portalled child (a row's own dropdown) are ignored. */
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    /**
     * Routes a click that lands between items (a gap, the padding, past the
     * last row) to the highlighted item, so the highlight and the click agree:
     * what is lit is what a click hits. A click inside an item is left to the
     * item, and so is one on a control between items (a search field) or
     * from a portalled child (a row's own dropdown): it never landed between
     * these items. Disabled items (`isItemDisabled`) are never activated.
     */
    onClick: (e: React.MouseEvent) => void;
  };
  registerItem: (index: number, element: HTMLElement | null) => void;
  /**
   * Invalidates the published rects and runs the hook's coalesced measurement
   * pass again, holding `isMeasured` false until it settles. Reach for it when
   * the rects may be wrong and showing an overlay against them would misplace
   * it: a popup that stays mounted between opens keeps its items registered,
   * so nothing else would notice that its rects were taken while it was
   * hidden. Registration, item resize, and container resize already trigger
   * a pass; do not call this on `children` changes.
   */
  remeasure: () => void;
  /**
   * Re-reads the rects synchronously, keeping `isMeasured` as it is. Only for
   * layout that moves the rows under a visible overlay frame by frame (the
   * accordion re-measures inside its height animation). Everything else
   * wants `remeasure`, or nothing.
   */
  measureItems: () => void;
}
