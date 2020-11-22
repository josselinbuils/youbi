import { RefObject, useEffect } from 'react';
import { useDynamicRef } from '@josselinbuils/hooks/useDynamicRef';

const OBSERVER_ROOT_MARGIN = '0px 0px -90% 0px';

let cachedObserver: IntersectionObserver | undefined;
const observerCallbackEntries = [] as ObserverCallbackEntry[];

export function useIntersect<T extends HTMLElement>(
  elementRef: RefObject<T>,
  callback: () => unknown
): void {
  const callbackRef = useDynamicRef(callback);

  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      const observer = getObserver();

      const callbackEntry = [
        element,
        callbackRef.current,
      ] as ObserverCallbackEntry;

      observer.observe(element);
      observerCallbackEntries.push(callbackEntry);

      return () => {
        observer.unobserve(element);
        observerCallbackEntries.splice(
          observerCallbackEntries.indexOf(callbackEntry),
          1
        );
      };
    }
  }, [callbackRef, elementRef]);
}

function getObserver(): IntersectionObserver {
  if (cachedObserver === undefined) {
    cachedObserver = new IntersectionObserver(
      (entries) => {
        const intersection = entries.reverse().find((i) => i.isIntersecting);

        if (intersection !== undefined) {
          observerCallbackEntries.find(
            ([element]) => element === intersection.target
          )?.[1]();
        }
      },
      { rootMargin: OBSERVER_ROOT_MARGIN }
    );
  }
  return cachedObserver;
}

type ObserverCallbackEntry = [HTMLElement, () => unknown];
