import Image, { type ImageProps } from "next/image";
import CreateProduct from "./create-product/create-product";
import Products from "./products/products";

export const dynamic = "force-dynamic"

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return <>
      <CreateProduct/>
      <Products />
    </>
}
