import React from 'react';

const MOUSE_BUTTON_LEFT = 0;

export function useDragAndDrop(
  downHandler: (downEvent: React.MouseEvent) => MouseMoveHandler | void,
  upHandler: MouseUpHandler = () => {}
): (downEvent: React.MouseEvent) => void {
  return function dragAndDropHandler(downEvent: React.MouseEvent): void {
    if (downEvent.button !== MOUSE_BUTTON_LEFT) {
      return;
    }

    const moveHandler = downHandler(downEvent);

    // Handler could be canceled inside down handler
    if (moveHandler !== undefined) {
      downEvent.preventDefault();
      downEvent.persist();

      const hookUpHandler = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', hookUpHandler);
        upHandler(upEvent);
      };

      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', hookUpHandler);
    }
  };
}

export type EventHandler<EventType extends keyof WindowEventMap> = (
  event: WindowEventMap[EventType]
) => void;
type MouseMoveHandler = EventHandler<'mousemove'>;
type MouseUpHandler = EventHandler<'mouseup'>;
