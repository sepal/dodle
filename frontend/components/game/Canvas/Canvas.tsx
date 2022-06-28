import Image from "next/image";
import styled from "styled-components";
import Easel from "./Easel.svg"


type CanvasInput = {
  image: string;
};

const Frame = styled.div`
    display: block;
    margin: 0 auto;
    position: relative;
`;

const ImageWrapper = styled.div`
  position: absolute;
  left: 6px;
  top: 115px;
  width: 300px;
  height: 300px;
  margin: 0px;
  padding: 40px;
  background: rgb(255,255,255);
  background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%); 
  border: 4px solid #eee;
`


export default function Canvas({ image }: CanvasInput) {
  return (
    <Frame>
      <div>
        <Easel />
      </div>
      <ImageWrapper>
        <Image
          alt="A.I. drawing"
          src={image}
          quality={100}
          width={256}
          height={256}
        />
      </ImageWrapper>
    </Frame>
  );
}