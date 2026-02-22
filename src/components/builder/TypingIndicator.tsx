export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-surface-2 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-1" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-2" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-3" />
      </div>
    </div>
  );
}
