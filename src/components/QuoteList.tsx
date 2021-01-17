import { IonItemDivider, IonItemGroup, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { Schedule, Session } from '../models/Schedule';
import { connect } from '../data/connect';
import { addFavorite, removeFavorite } from '../data/sessions/sessions.actions';
import QuoteListItem from './QuoteListItem';
import React from 'react';
import { tqsdk } from '../data/dataApi';

interface OwnProps {
  schedule: Schedule;
  listType: 'all' | 'favorites';
  hide: boolean;
}

interface StateProps {
  favoriteSessions: number[];
}

interface DispatchProps {
  addFavorite: typeof addFavorite;
  removeFavorite: typeof removeFavorite;
}

interface SessionListProps extends OwnProps, StateProps, DispatchProps { };

const SessionList: React.FC<SessionListProps> = ({ addFavorite, removeFavorite, favoriteSessions, hide, schedule, listType }) => {

  if (schedule.groups.length === 0 && !hide) {
    return (
      <IonList>
        <IonListHeader>
          No Sessions Found
        </IonListHeader>
      </IonList>
    );
  }

  return (
    <IonList style={hide ? { display: 'none' } : {}}>
    {schedule.groups.map((group, index: number) => (
      <IonItemGroup key={`group-${index}`}>
        {group.sessions.map((session: Session, sessionIndex: number) => (
          <QuoteListItem
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