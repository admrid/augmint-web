import styled from 'styled-components';

export const StyleTitle = styled.h3``;

export const Table = styled.table`
  width: 100%;
`;

export const StyleThead = styled.thead``;
export const StyleTbody = styled.tbody``;
export const StyleTd = styled.td`
  word-break:break-all;
`;
export const StyleTh = styled.th``;

export const StyleTr = styled.tr`
  ${StyleTd},
  ${StyleTh} {
    text-align: left;
    padding: 0.5em;
  }
`;
