import React, {
  HTMLAttributes,
  LegacyRef,
  ReactElement,
  useRef,
  useState,
} from 'react';
import BaseButton, {
  ButtonProps,
  ButtonSize,
  ButtonStatesStyles,
  ButtonStateStyle,
  StyledButtonProps,
} from './BaseButton';
import { tertiaryStyle } from './TertiaryButton';
import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import sizeN from '../../macros/sizeN.macro';

const getRightMargin = (size: ButtonSize = 'medium'): string => {
  switch (size) {
    case 'small':
      return sizeN(4);
    case 'large':
      return sizeN(8);
    default:
      return sizeN(6);
  }
};

const applyButtonStateStyle = (style: ButtonStateStyle): string => {
  if (style.color) {
    return `color: ${style.color};`;
  }
  return '';
};

const applyButtonStatesStyles = (styles: ButtonStatesStyles): string =>
  `
  ${styles.default ? applyButtonStateStyle(styles.default) : ''}

  ${
    styles.pressed
      ? `& [aria-pressed="true"] ~ label {
    ${applyButtonStateStyle(styles.pressed)}
  }`
      : ''
  }

  ${
    styles.hover
      ? `& :hover ~ label, & .hover ~ label, & :focus.focus-visible ~ label {
    ${applyButtonStateStyle(styles.hover)}
  }`
      : ''
  }

  ${
    styles.active
      ? `& :active ~ label {
    ${applyButtonStateStyle(styles.active)}
  }`
      : ''
  }

  ${
    styles.disabled
      ? `& [disabled] ~ label {
    ${applyButtonStateStyle(styles.disabled)}
  }`
      : ''
  }
  `;

type QuandaryButtonProps = {
  id: string;
  reverse?: boolean;
  labelMediaQuery?: string;
};

const Container = styled.div<
  StyledButtonProps & Omit<QuandaryButtonProps, 'id'>
>`
  display: flex;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
  align-items: stretch;
  user-select: none;

  label {
    align-items: center;
    font-weight: bold;
    cursor: pointer;
    ${typoCallout}

    ${({ reverse, buttonSize }) =>
      reverse
        ? `
      padding-left: ${getRightMargin(buttonSize)};
      padding-right: ${sizeN(1)};
    `
        : `
      padding-left: ${sizeN(1)};
      padding-right: ${getRightMargin(buttonSize)};
    `}

    ${({ labelMediaQuery }) =>
      labelMediaQuery
        ? `
      display: none;
      ${labelMediaQuery} {
        display: flex;
      }
    `
        : `display: flex;`}
  }

  & [disabled] ~ label {
    pointer-events: none;
  }

  ${({ darkStates }) => applyButtonStatesStyles(darkStates)}

  .light & {
    ${({ lightStates }) => applyButtonStatesStyles(lightStates)}
  }
`;

export default function QuandaryButton<
  Tag extends keyof JSX.IntrinsicElements
>({
  id,
  children,
  style,
  className,
  reverse,
  labelMediaQuery,
  tag,
  ...props
}: ButtonProps<Tag> & QuandaryButtonProps): ReactElement {
  const buttonStyle = tertiaryStyle(props.themeColor);
  let labelProps: HTMLAttributes<HTMLLabelElement> = {};
  let buttonProps: {
    className?: string;
    innerRef?: LegacyRef<HTMLButtonElement>;
  } = {};
  if (tag === 'a') {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const onLabelClick = (event: React.MouseEvent<HTMLLabelElement>): void => {
      event.preventDefault();
      buttonRef.current.click();
    };
    labelProps = {
      onMouseOver: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: onLabelClick,
    };
    buttonProps = {
      className: isHovered && 'hover',
      innerRef: buttonRef,
    };
  }

  return (
    <Container
      {...buttonStyle}
      buttonSize={props.buttonSize}
      style={style}
      className={className}
      reverse={reverse}
      labelMediaQuery={labelMediaQuery}
    >
      <BaseButton<Tag>
        id={id}
        {...buttonStyle}
        {...props}
        tag={tag}
        {...buttonProps}
      />
      {children && (
        <label htmlFor={id} {...labelProps}>
          {children}
        </label>
      )}
    </Container>
  );
}
