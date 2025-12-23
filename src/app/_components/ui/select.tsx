import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`appearance-none rounded-lg border border-slate-300 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M6%208L2%204h8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 py-2 pr-10 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
