import styled from "styled-components";
// eslint-disable-next-line import/default
import QRCodeComponent from "qrcode.react";


export const QRCode = styled(QRCodeComponent)`
  display: block;
  margin: 0 auto;
`;

export const QRCodeWrapper = styled.div`
  min-width: 200px;
`;

export const QRCodeTitle = styled.h3`
  text-align: center;
`;
