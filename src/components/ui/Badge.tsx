import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "danger" | "warning" | "info" | "neutral" | "purple";
}

const variantStyles: Record<string, React.CSSProperties> = {
  default:  { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
  success:  { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
  danger:   { background: "#FFF1F2", color: "#E11D48", border: "1px solid #FECDD3" },
  warning:  { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
  info:     { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
  neutral:  { background: "#F8F7FF", color: "#8E89B8", border: "1px solid #E5E2F5" },
  purple:   { background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" },
};

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
