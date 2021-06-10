import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { Button, ButtonProps } from './buttons/Button';
import ArrowIcon from '../../icons/arrow.svg';

const baseStyle: CSSProperties = {
  position: 'fixed',
  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
  willChange: 'transform, opacity',
};

export default function ScrollToTopButton(): ReactElement {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const callback = () => {
      setShow(document.documentElement.scrollTop >= window.innerHeight / 2);
    };
    window.addEventListener('scroll', callback, { passive: true });
    return () => window.removeEventListener('scroll', callback);
  }, []);

  const props: ButtonProps<'a'> = {
    tag: 'a',
    href: '#',
    icon: <ArrowIcon />,
  };

  const style: CSSProperties = {
    ...baseStyle,
    transform: show ? undefined : 'translateY(1rem)',
    opacity: show ? undefined : 0,
  };

  return (
    <>
      <Button
        {...props}
        className="btn-primary right-4 laptop:hidden z-2"
        buttonSize="large"
        style={{ ...style, bottom: '4.5rem' }}
      />
      <Button
        {...props}
        className="btn-primary right-8 bottom-8 hidden laptop:flex z-2"
        buttonSize="xlarge"
        style={style}
      />
    </>
  );
}