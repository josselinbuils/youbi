import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ERROR_ACTION, ErrorAction } from '../../shared/actions';
import { SharedProperties } from '../../shared/SharedProperties';

export class ErrorBoundary extends Component {
  private clear?: () => void;

  componentDidCatch({ stack }: Error, { componentStack }: ErrorInfo) {
    toast.error(
      <>
        {stack}
        <br />${componentStack}
      </>
    );
  }

  componentDidMount() {
    const { actions } = window.remote as SharedProperties;
    const { onError } = this;

    const errorListenerCallback = (event: ErrorEvent) => {
      const { colno, filename, lineno, message } = event;
      const filePath = filename.match(/src.+\.[a-z]+/)?.[0] ?? filename;

      onError(
        <>
          {message}
          <br />
          &nbsp;&nbsp;at {filePath} {lineno}:{colno}
        </>
      );
    };
    const errorActionCallback = ({ error }: ErrorAction) => onError(error);
    const unhandledRejectionCallback = (event: PromiseRejectionEvent) => {
      onError(event.reason);
    };

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

  private onError = (error: Error | ReactNode) => {
    toast.error((error as Error)?.stack ?? error);
  };
}
