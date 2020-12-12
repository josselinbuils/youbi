import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ERROR_ACTION, ErrorAction } from '../../shared/actions';
import { SharedProperties } from '../../shared/SharedProperties';

export class ErrorBoundary extends Component {
  private clear?: () => void;

  componentDidCatch(error: Error, { componentStack }: ErrorInfo) {
    toast.error(
      <>
        {formatError(error)}
        <br />${componentStack}
      </>
    );
  }

  componentDidMount() {
    const { actions } = window.remote as SharedProperties;

    const errorListenerCallback = (event: ErrorEvent) => {
      const { colno, error, filename, lineno } = event;
      const filePath = filename.match(/src.+\.[a-z]+/)?.[0] ?? filename;

      toast.error(
        <>
          {formatError(error)}
          <br />
          &nbsp;&nbsp;at {filePath} {lineno}:{colno}
        </>
      );
    };
    const errorActionCallback = ({ error }: ErrorAction) =>
      toast.error(formatError(error));
    const unhandledRejectionCallback = (event: PromiseRejectionEvent) =>
      toast.error(formatError(event.reason));

    window.addEventListener('error', errorListenerCallback);
    window.addEventListener('unhandledrejection', unhandledRejectionCallback);
    actions.on(ERROR_ACTION, errorActionCallback);

    this.clear = () => {
      window.removeEventListener('error', errorListenerCallback);
      window.removeEventListener(
        'unhandledrejection',
        unhandledRejectionCallback
      );
      actions.off(ERROR_ACTION, errorActionCallback);
    };
  }

  componentWillUnmount() {
    this.clear?.();
  }

  render() {
    const { children } = this.props;
    return (
      <>
        {children}
        <ToastContainer style={{ width: 'auto' }} />
      </>
    );
  }
}

function formatError({ message, stack }: Error): ReactNode {
  return (
    <p
      dangerouslySetInnerHTML={{
        __html:
          stack
            ?.replace(/ /g, '&nbsp;')
            .replace(/\n/g, '<br />')
            .replace(/\(webpack:[^)]+\/([^/)]+)\)/g, '($1)')
            .replace(/\?:/g, ':') || message,
      }}
    />
  );
}
