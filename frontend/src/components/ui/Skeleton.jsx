import { cn } from "../../utils/cn.js";

export default function Skeleton({ className }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}
