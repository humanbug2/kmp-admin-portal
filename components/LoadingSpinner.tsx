import { CircularProgress } from "@mui/material";
import cx from "classnames";

interface LoadingSpinnerProps {
  size?: number;
  fullscreen?: boolean;
}

const LoadingSpinner = ({
  size = 100,
  fullscreen = false,
}: LoadingSpinnerProps) => (
  <div
    className={cx(
      "flex items-center justify-center py-2",
      fullscreen && "h-screen"
    )}
  >
    <CircularProgress size={size} disableShrink />
  </div>
);

export default LoadingSpinner;
