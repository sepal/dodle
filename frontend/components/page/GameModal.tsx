import React from 'react'
import ReactModal from "react-modal";
import styled from "styled-components";
import Button from '../atoms/Button';
import CloseIcon from './icon--close.svg'

const ModalStyle = styled.div`
    min-height: 18rem;
    margin: 1em;
    padding: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: white;
    border-radius: 0.25rem;
    overflow: scroll;
    max-height: 95%;
    position: relative;

`;

const OverlayStyle = styled.div`
position: fixed;
display: flex;
justify-content: center;
align-items: center;
top: 0;
left: 0;
right: 0;
bottom: 0;
z-index: 3500;
background: #212b3277;
margin:0;
`;

const CloseButton = styled.a`
position: absolute;
top: 1.25em;
right: 1em;
cursor: pointer;
`

interface ModalProps {
    isOpen: boolean
    onClose: () => {}
    children: React.ReactNode
}

function Modal({isOpen, onClose, children} : ModalProps) {
    ReactModal.setAppElement('#__next');
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="_"
            overlayClassName="_"
            contentElement={(props, children) => <ModalStyle {...props}>{children}</ModalStyle>}
            overlayElement={(props, contentElement) => <OverlayStyle {...props}>{contentElement}</OverlayStyle>}
        >
            <CloseButton onClick={onClose}>
                <CloseIcon />
            </CloseButton>
            {children}
            <Button onClick={onClose}>Back to the game</Button>
        </ReactModal>
    )
}

export default Modal;