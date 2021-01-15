import React, { useRef } from 'react';

import { IonToolbar, IonContent, IonPage, IonTitle, IonHeader, getConfig } from '@ionic/react';

import SessionList from '../components/SessionList';
import './SchedulePage.scss'

import * as selectors from '../data/selectors';
import { connect } from '../data/connect';
import { setSearchText } from '../data/sessions/sessions.actions';
import { Schedule } from '../models/Schedule';
import QuoteList from '../components/QuoteList';

interface OwnProps { }

interface StateProps {
  schedule: Schedule;
  favoritesSchedule: Schedule;
  mode: 'ios' | 'md'
}

interface DispatchProps {
  setSearchText: typeof setSearchText;
}

type SchedulePageProps = OwnProps & StateProps & DispatchProps;

const SchedulePage: React.FC<SchedulePageProps> = ({ favoritesSchedule, schedule, setSearchText, mode }) => {

  const pageRef = useRef<HTMLElement>(null);

  return (
    <IonPage ref={pageRef} id="schedule-page">
      <IonHeader translucent={true}>
      </IonHeader>

      <IonContent fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Main</IonTitle>
          </IonToolbar>
        </IonHeader>

        <QuoteList
          schedule={schedule}
        />
      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    schedule: selectors.getSearchedSchedule(state),
    favoritesSchedule: selectors.getGroupedFavorites(state),
    mode: getConfig()!.get('mode')
  }),
  mapDispatchToProps: {
    setSearchText
  },
  component: React.memo(SchedulePage)
});