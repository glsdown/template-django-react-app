import React, { useEffect } from 'react';
import { useAlert } from 'react-alert';
import { useSelector } from 'react-redux';

import { messageSelector } from '../../features/messages/messageSlice';

// Alerts component to display error messages and alerts
const Alerts = () => {
  const alert = useAlert();

  // Get the errors and messages from the store
  const message = useSelector(messageSelector);

  useEffect(() => {
    // Display a message as an alert
    if (message) {
      if (message.alertType === 'success') {
        alert.success(message.msg);
      }
      if (message.alertType === 'error') {
        alert.error(message.msg);
      }
    }
  }, [alert, message]);
  return <></>;
};

export default Alerts;
