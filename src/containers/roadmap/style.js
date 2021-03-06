import styled from 'styled-components';
import { media, mediaopacity } from 'styles/media';
import bulletPoint from 'assets/images/bullet-point.svg';

export const StyleRoadmapTitle = styled.h1`
    font-size: 42px;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 80px;
`;

export const StyleStateTitle = styled.h2`
    font-size: 26px;
    margin-bottom: 25px;
`;

export const StyleRoadmapLine = styled.div`
    background-image: linear-gradient(to top, transparent 0%, #346262 15%, #346262 85%, transparent 100%);
    height: 100%;
    margin: 10px 0;
    margin-left: 75px;
    width: 2px;
    ${media.tablet`display: none;`}
`;

export const StyleStateHeader = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 250px;
    min-width: 250px;
    ${media.tablet`
      margin: auto;
      max-width: 275px;
      min-width: 275px;
    `}
`;

export const StyleRoadmapState = styled.div`
    position: relative;
    padding: 0  110px;
    ${media.tablet`
      margin: auto;
      padding:0;
    `}

    &>div.state {
      align-items: stretch;
      display: flex;
      justify-content: space-around;
      ${media.tablet`
        flex-direction: column;
      `}
    }

    & .list-item {
        padding-left: 30px;
        background: url(${bulletPoint}) no-repeat left 6px;
        background-size: 7px;
        margin: 0;
    }
`;

export const StyleStateList = styled.div`
    padding-top: 58px;
    padding-bottom: 45px;
    max-width: 275px;
    min-width: 275px;
    ${media.tablet`
      margin: auto;
      margin-top: 15px;
      padding-top: 0;
      padding-bottom: 0;
    `}
`;

export const StyleStateListItem = styled.p`
    letter-spacing: 1px;
    margin: 0;
    margin-bottom: 5px;
`;

export const StyleRoadmap = styled.div`
    margin: auto;
    margin-top: 75px;
    margin-bottom: 50px;
    padding: 0 20px;
    max-width: 1167px;
    ${media.tablet`
      margin-bottom: 0;
    `}

    &>div + div {
      ${media.tablet`
        margin-top: 65px;
      `}
    }

    & h4:not(.state),
    h5,
    ${StyleStateListItem} {
      margin-top: 0;
      ${mediaopacity.handheld`opacity: .6`}
    }

    & h4 {
      margin: 0;
    }

    & h4.state {
      margin-bottom: 14px;
    }
`;
