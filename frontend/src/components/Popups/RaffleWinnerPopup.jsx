import React from 'react';
import DetailsPopup from './DetailsPopup';

export default function RaffleWinnerPopup({ raffle, winner, open = false, onClose }) {
  if (!open || !raffle || !winner) return null;
  
  return (
    <DetailsPopup
      open={true}
      onClose={onClose}
      title={`Winner Drawn: ${raffle.name}`}
      fields={[
        { label: 'Raffle ID', value: raffle.id },
        { label: 'Raffle Name', value: raffle.name },
        { label: 'Winner UTORid', value: winner.utorid },
        { label: 'Winner Name', value: winner.name },
        { label: 'Prize Points', value: raffle.prizePoints },
      ]}
    />
  );
}

