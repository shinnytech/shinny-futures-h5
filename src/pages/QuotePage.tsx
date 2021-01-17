import React, { useState, useRef } from 'react';

import { IonToolbar, IonContent, IonPage, IonTitle, IonHeader, getConfig } from '@ionic/react';

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
  const [segment, setSegment] = useState<'all' | 'favorites'>('all');

  const pageRef = useRef<HTMLElement>(null);

  return (
    <IonPage ref={pageRef} id="-page">
      <IonHeader translucent={true}>
      </IonHeader>

      <IonContent fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">主连</IonTitle>
          </IonToolbar>
        </IonHeader>

        <QuoteList
          schedule={schedule}
          listType={segment}
          hide={segment === 'favorites'}
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