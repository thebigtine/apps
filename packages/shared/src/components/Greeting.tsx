import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { get as getCache, set as setCache } from 'idb-keyval';
import { isSameDay } from 'date-fns';
import { LoggedUser } from '../lib/user';
import { tablet } from '../styles/media';

type GreetingData = { text: string; emoji: string };

const getGreetingSlot = (hour: number): number => {
  if (hour < 5) {
    return 0;
  }
  if (hour < 12) {
    return 1;
  }
  if (hour < 17) {
    return 2;
  }
  return 3;
};

const getGreetingData = (): GreetingData => {
  const now = new Date();
  const hour = now.getHours();
  const slot = getGreetingSlot(hour);
  if (slot === 0) {
    return { text: 'Good Night', emoji: '🌙' };
  }
  if (slot === 1) {
    return { text: 'Good Morning', emoji: '☀️' };
  }
  if (slot === 2) {
    return { text: 'Good Afternoon', emoji: '✌️' };
  }
  return { text: 'Good Evening', emoji: '✨️' };
};

export default function Greeting({
  onEnter,
  onExit,
  user,
}: {
  user?: LoggedUser;
  onEnter: () => unknown;
  onExit: () => unknown;
}): ReactElement {
  const [show, setShow] = useState(false);

  const greetingElement = useMemo(() => {
    const firstName = user?.name?.split?.(' ')?.[0];
    const greeting = getGreetingData();
    return (
      <div className="typo-callout font-bold ml-2">
        {greeting.text}
        {firstName && (
          <span className="hidden laptop:inline">, {firstName}</span>
        )}{' '}
        {greeting.emoji}
      </div>
    );
  }, []);

  useEffect(() => {
    (async () => {
      const media = window.matchMedia(tablet.replace('@media ', ''));
      if (!media.matches) {
        return;
      }

      const now = new Date();
      const lastGreeting = await getCache<Date>('greeting');
      const showGreeting =
        !lastGreeting ||
        !isSameDay(now, lastGreeting) ||
        getGreetingSlot(lastGreeting.getHours()) !==
          getGreetingSlot(now.getHours());
      if (showGreeting) {
        await setCache('greeting', now);
        setTimeout(() => {
          onEnter();
          setTimeout(() => {
            setShow(true);
            setTimeout(() => setShow(false), 7000);
          }, 500);
        }, 1500);
      }
    })();
  }, []);

  return (
    <CSSTransition
      in={show}
      timeout={500}
      classNames="fade"
      unmountOnExit
      onExited={onExit}
    >
      {greetingElement}
    </CSSTransition>
  );
}
