import { IonItemDivider, IonItemGroup, IonLabel, IonList, IonListHeader } from '@ionic/react';
import React from 'react';
import { Schedule, Session } from '../models/Schedule';
import SessionListItem from './SessionListItem';
import { connect } from '../data/connect';
import { addFavorite, removeFavorite } from '../data/sessions/sessions.actions';
import Tqsdk from '../lib/tqsdk';
import App, { dataManager } from '../App';

interface OwnProps {
  schedule: Schedule
}

interface StateProps {
  favoriteSessions: number[];
}

interface DispatchProps {
  addFavorite: typeof addFavorite;
  removeFavorite: typeof removeFavorite;
}

interface SessionListProps extends OwnProps, StateProps, DispatchProps { };

const SessionList: React.FC<SessionListProps> = ({ addFavorite, removeFavorite, favoriteSessions, schedule }) => {

  if (schedule.groups.length === 0) {
    return (
      <IonList>
        <IonListHeader>
          No Sessions Found
        </IonListHeader>
      </IonList>
    );
  }

  return (
    <IonList>
    {schedule.groups.map((group, index: number) => (
      <IonItemGroup key={`group-${index}`}>
        {group.sessions.map((session: Session, sessionIndex: number) => (
          <SessionListItem
            isFavorite={favoriteSessions.indexOf(session.id) > -1}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
            key={`group-${index}-${sessionIndex}`}
            session={session}
          />
        ))}
      </IonItemGroup>
    ))}
  </IonList>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    favoriteSessions: state.data.favorites
  }),
  mapDispatchToProps: ({
    addFavorite,
    removeFavorite
  }),
  component: SessionList
});