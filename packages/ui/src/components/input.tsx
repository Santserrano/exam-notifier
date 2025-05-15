import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full border px-3 py-2 text-sm ${className}`}

        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
