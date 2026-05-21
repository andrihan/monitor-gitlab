import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn("bg-white rounded-2xl overflow-hidden", className)}
      style={{
        border: "1px solid #E5E2F5",
        boxShadow: "0 1px 4px rgba(26,21,51,0.06), 0 4px 16px rgba(26,21,51,0.04)",
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn("px-6 py-4 flex items-center justify-between", className)}
      style={{ borderBottom: "1px solid #EDEAF8" }}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-sm font-bold tracking-tight", className)} style={{ color: "#1A1533" }}>
      {children}
    </h3>
  );
}
