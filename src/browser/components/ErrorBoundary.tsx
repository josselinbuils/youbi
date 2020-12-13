import React, { Component, ErrorInfo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ERROR_ACTION, ErrorAction } from '../../shared/actions';
import { SharedProperties } from '../../shared/SharedProperties';

export class ErrorBoundary extends Component {
  private clear?: () => void;

  componentDidCatch(error: Error, { componentStack }: ErrorInfo) {
    console.log(componentStack);
    this.onError(error);
  }

  componentDidMount() {
    const { actions } = window.remote as SharedProperties;

    window.addEventListener('error', this.onError);
    window.addEventListener('unhandledrejection', this.onError);
    actions.on<ErrorAction>(ERROR_ACTION, this.onError);

    this.clear = () => {
      window.removeEventListener('error', this.onError);
      window.removeEventListener('unhandledrejection', this.onError);
      actions.off(ERROR_ACTION, this.onError);
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

  private onError = (
    input: Error | ErrorAction | ErrorEvent | PromiseRejectionEvent
  ) => {
    let error: Error;

    switch (true) {
      case (input as ErrorAction | ErrorEvent).error !== undefined:
        ({ error } = input as ErrorAction | ErrorEvent);
        break;

      case (input as PromiseRejectionEvent).reason !== undefined:
        error = (input as PromiseRejectionEvent).reason as Error;
        break;

      default:
        error = input as Error;
    }

    console.error(error);
    toast.error(
      `💥 ${`${error.message || error}`.replace(/^[^:]+Error:/, '')}`
    );
  };
}
