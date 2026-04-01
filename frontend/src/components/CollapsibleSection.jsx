import { useId, useState } from "react";

const CollapsibleSection = ({
  title,
  count,
  defaultCollapsed = true,
  description,
  emptyText = "No items available yet.",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const contentId = useId();

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <section className="neo-inset rounded-2xl px-5 py-4 md:px-6 md:py-5">
      <header className="flex flex-col gap-2">
        <button
          className="flex w-full items-center justify-between gap-3 text-left"
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={toggleOpen}
        >
          <div>
            <p className="font-display text-base font-bold md:text-lg">
              {title}
            </p>
            {description && (
              <p className="text-xs text-[color:var(--neo-muted)]">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
              {count}
            </span>
            <span className="text-sm text-[color:var(--neo-muted)]">
              {isOpen ? "Hide" : "Show"}
            </span>
          </div>
        </button>
      </header>

      <div id={contentId} className={isOpen ? "mt-4" : "mt-4 hidden"}>
        {children ? (
          children
        ) : (
          <p className="text-sm text-[color:var(--neo-muted)]">{emptyText}</p>
        )}
      </div>
    </section>
  );
};

const CollapsibleItem = ({
  title,
  meta,
  preview,
  defaultCollapsed = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const contentId = useId();

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="neo-card p-4 md:p-5">
      <button
        className="flex w-full items-start justify-between gap-3 text-left"
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={toggleOpen}
      >
        <div>
          <p className="text-sm font-semibold md:text-base">{title}</p>
          {meta && (
            <p className="mt-1 text-xs text-[color:var(--neo-muted)]">{meta}</p>
          )}
          {!isOpen && preview && (
            <p className="mt-2 text-xs text-[color:var(--neo-muted)]">
              {preview}
            </p>
          )}
        </div>
        <span className="text-xs text-[color:var(--neo-muted)]">
          {isOpen ? "Hide" : "View"}
        </span>
      </button>
      <div id={contentId} className={isOpen ? "mt-3" : "hidden"}>
        {children}
      </div>
    </div>
  );
};

export { CollapsibleSection, CollapsibleItem };
