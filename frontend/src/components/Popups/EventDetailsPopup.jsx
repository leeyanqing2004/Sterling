import React from 'react';
import DetailsPopup from './DetailsPopup';

const PLACEHOLDERS = {
  organizers: '(No organizers listed)',
  description: '(No description provided)',
};

export default function EventDetailsPopup({ event, rsvped, onClose, onRsvp, onUnRsvp }) {
  if (!event) return null;
  return (
    <DetailsPopup
      open={true}
      onClose={onClose}
      title={event.name}
      fields={[
        { label: 'ID', value: event.id },
        { label: 'Location', value: event.location },
        { label: 'Start time', value: event.startTime },
        { label: 'End time', value: event.endTime },
        { label: 'Capacity', value: event.capacity },
        { label: 'Number of Guests', value: event.numGuests },
        { label: 'Organizers', value: event.organizers, placeholder: PLACEHOLDERS.organizers },
        { label: 'Description', value: event.description, placeholder: PLACEHOLDERS.description },
      ]}
      primaryAction={
        rsvped
          ? { label: 'Un-RSVP', onClick: onUnRsvp, className: 'unrsvp-btn' }
          : { label: 'RSVP', onClick: onRsvp, className: 'action-btn' }
      }
    />
  );
}