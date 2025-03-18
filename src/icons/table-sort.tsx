import { ColumnSort } from "@tanstack/react-table";
import { SVGAttributes } from "react";

interface Props extends SVGAttributes<SVGElement> {
  className?: string;
  sort?: ColumnSort;
}

export function TableSortIcon({ sort, className }: Props) {
  let upColor = "currentColor";
  let downColor = "currentColor";
  if (sort) {
    if (sort.desc) {
      upColor = "var(--color-primary)";
    } else {
      downColor = "var(--color-primary)";
    }
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5" stroke={downColor} />
      <path d="M21 16.5L16.5 21m0 0L12 16.5M16.5 21V7.5" stroke={upColor} />
    </svg>
  );
}
