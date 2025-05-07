
    import React from 'react';
    import * as ProgressPrimitive from '@radix-ui/react-progress';
    import { cn } from '@/lib/utils';

    const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary dark:bg-slate-700',
          className
        )}
        {...props}>
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all dark:bg-purple-500"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
      </ProgressPrimitive.Root>
    ));
    Progress.displayName = ProgressPrimitive.Root.displayName;

    export { Progress };
  