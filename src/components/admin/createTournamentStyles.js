// Shared Tailwind class strings for the Create Tournament form and its sub-components.
// Centralised so every section (Basic Info, Prize & Rules, Referee, Summary, Actions)
// stays visually consistent without repeating class strings everywhere.

export const pageShellClass = 'grid min-h-[calc(100vh-64px)] w-full max-w-full content-start gap-3.5 overflow-x-hidden px-11 py-6 max-[760px]:px-5 max-[760px]:py-5';
export const wrapClass = 'grid w-full max-w-[900px] min-w-0 mx-auto gap-3.5';
export const formClass = 'grid min-w-0 gap-3.5';
export const cardClass = 'grid w-full min-w-0 max-w-full gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 max-[760px]:p-3.5';
export const cardTitleClass = 'm-0 flex items-center gap-2 border-b border-[var(--admin-border)] pb-2 text-[0.9rem] font-black text-[var(--admin-ink)]';
export const cardTitleButtonClass = 'm-0 flex w-full cursor-pointer items-center justify-between gap-2 border-0 border-b border-[var(--admin-border)] bg-transparent p-0 pb-2 text-left text-[0.9rem] font-black text-[var(--admin-ink)]';
export const fieldClass = 'grid min-w-0 content-start gap-[5px] self-start';
export const labelClass = 'text-[0.74rem] font-[750] text-[#5b403c]';
export const controlBaseClass = 'w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#94a3b8] focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
export const inputClass = `${controlBaseClass} h-9 px-3`;
export const textareaClass = `${controlBaseClass} min-h-[68px] resize-y px-3 py-2 leading-[1.4]`;
export const twoColumnClass = 'grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3 max-[760px]:grid-cols-1';
export const threeColumnClass = 'grid min-w-0 grid-cols-[repeat(3,minmax(0,1fr))] gap-3 max-[640px]:grid-cols-1';
export const actionButtonClass = 'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-full px-[18px] text-[0.78rem] font-[850] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-55 max-[760px]:w-full';
