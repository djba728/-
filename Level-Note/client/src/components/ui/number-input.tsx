import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number | string | null | undefined;
  onValueChange: (val: number | null) => void;
  precision?: number;
}

// A specialized input that handles nulls and numbers gracefully for the grid
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onValueChange, precision = 3, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value?.toString() ?? "");

    React.useEffect(() => {
      if (value === null || value === undefined) {
        setLocalValue("");
      } else {
        setLocalValue(value.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      
      if (val === "") {
        onValueChange(null);
        return;
      }

      const num = parseFloat(val);
      if (!isNaN(num)) {
        onValueChange(num);
      }
    };

    const handleBlur = () => {
        // Optional: format on blur
        if (localValue !== "" && !isNaN(parseFloat(localValue))) {
            const num = parseFloat(localValue);
            // Don't force precision on raw input, wait for calculation display?
            // Actually, for inputs like BS/FS, user types raw.
            onValueChange(num); 
        }
    };

    return (
      <Input
        type="number"
        inputMode="decimal"
        step="0.001"
        className={cn("font-mono text-right", className)}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"
