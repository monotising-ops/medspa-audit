type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  color?: string;
}

const sizeMap: Record<Size, number> = {
  sm: 16,
  md: 24,
  lg: 36,
};

export default function Spinner({ size = 'md', color = '#3b82f6' }: SpinnerProps) {
  const px = sizeMap[size];
  const border = size === 'sm' ? 2 : size === 'md' ? 3 : 4;

  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: px,
        height: px,
        borderWidth: border,
        borderStyle: 'solid',
        borderColor: `${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  );
}
