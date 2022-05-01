import Image from "next/image";
import styled from "styled-components";

type CanvasInput = {
  image: string;
};

const Frame = styled.div`
    display: block;
    width: 256px
    height: 256px;
    margin: 0 auto;
`;

export default function Canvas({ image }: CanvasInput) {
  return (
    <Frame>
      <Image
        alt="A.I. drawing"
        src={image}
        layout="fill"
        objectFit="cover"
        quality={100}
        width={256}
        height={256}
      />
    </Frame>
  );
}
