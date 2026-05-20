import classNames from "classnames";

interface ProductCardProps {
  image?: string;
  brand?: string;
  model?: string;
  description?: string;
  isOpen?: boolean;
  onClick?: () => void;
}

export default function CardComponent({
  image,
  brand = "NVIDIA",
  model = "VR200 NVL72",
  description = "Rack-scale systems optimized for agentic AI.",
  isOpen = false,
  onClick,
}: ProductCardProps) {
  return (
    <div
      className={classNames(
        "group w-full xl:transition-[width]",
        "xl:duration-400 xl:ease-[cubic-bezier(0,0,0.2,1)]",
        isOpen ? "2xl:w-[625px]" : "2xl:w-[240px]",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label={`${brand} ${model} — ${description}`}
        className={classNames(
          "relative w-full h-[600px] overflow-hidden border border-white/10 rounded-sm cursor-pointer bg-transparent p-0 text-left",
        )}
      >
        {image ? (
          <img
            src={image}
            alt={`${brand} ${model}`}
            aria-hidden="true"
            className={classNames(
              "object-cover",
              "absolute inset-0 w-full h-full",
              "transition-[filter] duration-400",
              { "2xl:grayscale": !isOpen },
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden="true" />
        )}

        <div className={classNames("card-info", { "card-info--open": isOpen })}>
          <h3 className="font-bold text-lg text-(--color-beige) leading-tight">
            <span className="block">{brand}</span>
            <span className="block">{model}</span>
          </h3>
          <p
            className={classNames(
              "card-info__description",
              "font-base text-(--color-text-secondary) tracking-widest mt-2 text-sm",
            )}
          >
            {description}
          </p>
        </div>
      </button>

      <div
        className={classNames(
          "hidden 2xl:block w-full h-[10px] transition-colors duration-300",
          isOpen
            ? "bg-(--color-ultraviolet)"
            : "bg-white group-hover:bg-(--color-ultraviolet)",
        )}
      />
    </div>
  );
}
