import type { ReactNode } from "react";
import { Lightbulb, PenLine, Quote } from "lucide-react";
import type { LessonBlock, LessonBlockType } from "@/types/lesson";

type BlockOf<T extends LessonBlockType> = Extract<LessonBlock, { type: T }>;

/**
 * One drawing function per block type. `Record<LessonBlockType, …>` means
 * TypeScript refuses to compile if a new block type is added to the content
 * model without a way to draw it here.
 *
 * Every piece of text is passed to React as text ({block.text}), never as
 * HTML, so lesson content can't inject markup or scripts.
 */
const renderers: { [T in LessonBlockType]: (block: BlockOf<T>) => ReactNode } = {
  heading: (block) => <h2 className="pt-4 font-display text-2xl font-semibold text-parchment">{block.text}</h2>,
  paragraph: (block) => <p className="leading-relaxed text-mist">{block.text}</p>,
  keyIdea: (block) => (
    <aside className="rounded-2xl border border-gold-700/40 bg-gold-900/10 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
        <Lightbulb aria-hidden className="size-4" />
        {block.title}
      </p>
      <p className="mt-2 leading-relaxed text-parchment">{block.text}</p>
    </aside>
  ),
  quote: (block) => (
    <figure className="border-l-2 border-gold-600/60 pl-5">
      <Quote aria-hidden className="mb-2 size-5 text-gold-600" />
      <blockquote className="font-display text-xl leading-snug text-parchment italic">{block.text}</blockquote>
      <figcaption className="mt-2 text-sm text-slate-dim">{block.source}</figcaption>
    </figure>
  ),
  list: (block) => {
    const ListTag = block.style === "number" ? "ol" : "ul";
    return (
      <ListTag
        className={
          block.style === "number"
            ? "list-decimal space-y-2 pl-6 text-mist marker:text-gold-500"
            : "list-disc space-y-2 pl-6 text-mist marker:text-gold-500"
        }
      >
        {block.items.map((item) => (
          <li key={item} className="pl-1 leading-relaxed">
            {item}
          </li>
        ))}
      </ListTag>
    );
  },
  reflection: (block) => (
    <aside className="rounded-2xl border border-charcoal-700 bg-charcoal-900/70 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-dim">
        <PenLine aria-hidden className="size-4" />
        Reflect
      </p>
      <p className="mt-2 leading-relaxed text-parchment">{block.prompt}</p>
    </aside>
  ),
};

function renderBlock<T extends LessonBlockType>(block: BlockOf<T>): ReactNode {
  return (renderers[block.type] as (block: BlockOf<T>) => ReactNode)(block);
}

/** Draws a lesson's content, block by block. */
export function LessonBlocks({ blocks }: { blocks: readonly LessonBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        // Blocks never reorder, so their position is a stable key.
        <div key={index}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}
