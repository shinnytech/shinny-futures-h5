import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { Session } from '../models/Schedule';

interface SessionListItemProps {
  session: Session;
}

const SessionListItem: React.FC<SessionListItemProps> = ({ session }) => {
  return (
    <IonItem routerLink={`/tabs/schedule/${session.id}`}>
    <IonLabel>
      <h3>{session.name}</h3>
    </IonLabel>
  </IonItem>
  );
};

export default React.memo(SessionListItem);