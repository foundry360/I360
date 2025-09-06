
'use client';

import * as React from 'react';

export const useIdle = (onIdle: () => void, idleTime: number) => {
  const idleTimeout = React.useRef<NodeJS.Timeout>();

  const resetTimer = React.useCallback(() => {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
    idleTimeout.current = setTimeout(onIdle, idleTime);
  }, [onIdle, idleTime]);

  const handleEvent = React.useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  React.useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Initial timer start
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    // Cleanup
    return () => {
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [resetTimer, handleEvent]);
};
