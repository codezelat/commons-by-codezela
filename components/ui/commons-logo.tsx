import Image from "next/image";

interface CommonsLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CommonsLogo({ size = "md", className = "" }: CommonsLogoProps) {
  const sizeMap = {
    sm: { container: "h-7 w-7", image: 28 },
    md: { container: "h-8 w-8", image: 32 },
    lg: { container: "h-10 w-10", image: 40 },
  };

  const { container, image } = sizeMap[size];

  return (
    <div className={`${container} ${className} relative flex-shrink-0 overflow-hidden rounded-xl`}>
      <Image
        src="/images/Frame 5.png"
        alt="Commons Logo"
        width={image}
        height={image}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}
