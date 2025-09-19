export default function GradientText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-t from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500">
      {children}
    </span>
  );
}
