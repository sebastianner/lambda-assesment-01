import Image from "next/image";
import classNames from "classnames";
import { SectionThreeItem } from "./data";

interface Props {
  item: SectionThreeItem;
}

export default function SectionThreeCard({ item }: Props) {
  return (
    <div className={classNames("flex flex-col gap-4")}>
      <div className={classNames("relative w-full aspect-square")}>
        <Image
          src={item.image}
          alt={item.model}
          fill
          className={classNames("object-contain")}
        />
      </div>
      <div>
        <p className={classNames("text-sm text-(--color-text-secondary) tracking-widest uppercase")}>
          {item.brand}
        </p>
        <h3 className={classNames("font-bold text-lg text-(--color-beige) mt-1")}>
          {item.model}
        </h3>
        <p className={classNames("text-sm text-(--color-text-secondary) mt-2")}>
          {item.description}
        </p>
      </div>
    </div>
  );
}
