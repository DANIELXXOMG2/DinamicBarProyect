import { cn } from '@/lib/utilities';

function Skeleton({
  className,
  ...properties
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...properties}
    />
  );
}

export { Skeleton };
