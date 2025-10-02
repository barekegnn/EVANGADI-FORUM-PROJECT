import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <path
          d="M23.6367 10.332L21.5117 6.05273L19.3867 10.332L15.1074 12.457L19.3867 14.582L21.5117 18.8613L23.6367 14.582L27.916 12.457L23.6367 10.332Z"
          className="fill-primary"
        />
        <path
          d="M10.9613 15.6582L9.39966 12.5039L7.83801 15.6582L4.68359 17.2198L7.83801 18.7815L9.39966 21.9359L10.9613 18.7815L14.1157 17.2198L10.9613 15.6582Z"
          className="fill-primary"
        />
      </svg>
      <span className="text-3xl font-bold text-foreground">HUConnect</span>
    </div>
  );
}
