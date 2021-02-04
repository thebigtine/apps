/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { InputHTMLAttributes, ReactElement, MouseEvent } from 'react';
import { useInputField } from '../../lib/useInputField';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { BaseField, FieldInput } from './common';
import MagnifyingIcon from '../../icons/magnifying.svg';
import XIcon from '../../icons/x.svg';
import { focusOutline } from '../../styles/helpers';

export interface Props
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'placeholder' | 'value' | 'className' | 'style' | 'name'
  > {
  inputId: string;
  valueChanged?: (value: string) => void;
  compact?: boolean;
}

const Icon = styled(MagnifyingIcon)`
  font-size: ${sizeN(6)};
  margin-right: ${sizeN(2)};
  color: var(--field-placeholder-color);
`;

const ClearButton = styled.button`
  display: flex;
  width: ${sizeN(8)};
  height: ${sizeN(8)};
  align-items: center;
  justify-content: center;
  margin-left: ${sizeN(1)};
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  visibility: hidden;
  ${focusOutline}

  .icon {
    font-size: ${sizeN(4.5)};
    color: var(--theme-label-tertiary);
  }

  &:hover .icon {
    color: var(--theme-label-primary);
  }
`;

const Container = styled(BaseField)`
  height: ${({ compact }) => (compact ? sizeN(10) : sizeN(12))};
  border-radius: ${({ compact }) => (compact ? sizeN(3) : sizeN(3.5))};

  ${({ focused, hasInput }) =>
    (focused || hasInput) &&
    `
    && {
      ${Icon} {
        color: var(--theme-label-primary);
      }
    }
  `}

  ${({ hasInput }) =>
    hasInput &&
    `
    && {
      ${ClearButton} {
        visibility: visible;
      }
    }
  `}
`;

export default function SearchField({
  inputId,
  name,
  value,
  valueChanged,
  placeholder,
  compact = false,
  ...props
}: Props): ReactElement {
  const {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur,
    onInput,
    focusInput,
    setInput,
  } = useInputField(value, valueChanged);

  const onClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput(null);
  };

  return (
    <Container
      focused={focused}
      compact={compact}
      onClick={focusInput}
      hasInput={hasInput}
      {...props}
    >
      <Icon />
      <FieldInput
        placeholder={placeholder}
        name={name}
        id={inputId}
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={onInput}
        css={css`
          flex: 1;
        `}
      />
      <ClearButton title="Clear query" onClick={onClearClick}>
        <XIcon />
      </ClearButton>
    </Container>
  );
}
