export default function Logo({ size = "md", onDark = false }) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  const nColor = onDark ? "text-white" : "text-nexu-teal";

  return (
    <span className={`font-extrabold tracking-tight ${sizes[size]}`}>
      <span className={nColor}>N</span>
      <span className="text-nexu-orange">exu</span>
    </span>
  );
}
