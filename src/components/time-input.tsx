import { NumericInputBase } from "./numeric-input-base";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

/**
 * Time input for selecting duration in seconds
 * Displays as MM:SS with -5s/+5s buttons
 * Max value: 59:59 (3599 seconds)
 */
export function TimeInput({ value, onChange, disabled }: Props) {
  const MAX_SECONDS = 59 * 60 + 59;

  const formatSeconds = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const parseTime = (text: string): number | null => {
    const parts = text.replace(/[^0-9]/g, "");
    let totalSeconds = 0;

    if (parts.length <= 2) {
      // Just seconds
      totalSeconds = Number(parts) || 0;
    } else {
      // MM:SS format
      const minutes = Number(parts.slice(0, 2)) || 0;
      const seconds = Number(parts.slice(2, 4)) || 0;
      totalSeconds = minutes * 60 + seconds;
    }

    // Validate ranges
    const minutesVal = Math.floor(totalSeconds / 60);
    const secondsVal = totalSeconds % 60;
    if (minutesVal > 59) return null;
    if (secondsVal > 59) return null;

    return totalSeconds;
  };

  return (
    <NumericInputBase
      value={value}
      onChange={onChange}
      max={MAX_SECONDS}
      disabled={disabled}
      format={formatSeconds}
      parse={parseTime}
      buttonIncrement={5}
      buttonDecrement={5}
    />
  );
}
