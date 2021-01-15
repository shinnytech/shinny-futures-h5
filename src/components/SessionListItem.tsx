import React, { useRef } from 'react';
import { IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption } from '@ionic/react';
import { Session } from '../models/Schedule';

interface SessionListItemProps {
  session: Session;
  onAddFavorite: (id: number) => void;
  onRemoveFavorite: (id: number) => void;
  isFavorite: boolean;
}

const SessionListItem: React.FC<SessionListItemProps> = ({ isFavorite, onAddFavorite, session }) => {
  const ionItemSlidingRef = useRef<HTMLIonItemSlidingElement>(null)

  const removeFavoriteSession = () => {
    onAddFavorite(session.id);
  }

  const addFavoriteSession = () => {
    if (isFavorite) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      removeFavoriteSession();
    } else {
      // remember this session as a user favorite
      onAddFavorite(session.id);
    }
  };

  return (
    <IonItem routerLink={`/tabs/quote/${session.id}`}>
    <IonLabel>
      <h3>{session.name}</h3>
      <p>
        {session.timeStart}&mdash;&nbsp;
        {session.timeStart}&mdash;&nbsp;
        {session.location}
      </p>
    </IonLabel>
  </IonItem>
  );
};

export default React.memo(SessionListItem);