import React, { useRef, useState } from "react";
import styled from "styled-components";

interface GuessHandler {
  (guess: string): void;
}

type InputProps = {
  guessHandler: GuessHandler;
};

const Form = styled.form`
  margin-top: 1.5em;
  border: 0px solid #f0f0f0;
  padding: 5px;
  display: flex;
  justify-content: space-around;
`;

const StyledInput = styled.input`
  border: 0;
  border-bottom: 2px solid #ccc;
  width: 80%;
  font-size: 16px;
  line-height: 1.5;
`;

const StyledSubmit = styled.button`
  border: 1px sold #ccc;
  margin-left: 5px;
  width: 20%;
  font-size: 16px;
  line-height: 1.5;
`;

const Input = ({ guessHandler }: InputProps) => {
  const [guess, setGuess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (guessHandler && guess.trim().length > 0) {
      guessHandler(guess);
      inputRef.current?.focus();
      setGuess("");
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <StyledInput
        ref={inputRef}
        name="guess"
        placeholder="Enter your guess..."
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      <StyledSubmit>Guess</StyledSubmit>
    </Form>
  );
};

export default Input;
