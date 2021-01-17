import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { statsChartOutline, swapVerticalOutline, personOutline, cardOutline } from 'ionicons/icons';
import SpeakerList from './SpeakerList';
import SpeakerDetail from './SpeakerDetail';
import SessionDetail from './SessionDetail';
import MapView from './MapView';
import About from './About';
import QuotePage from './QuotePage';

interface MainTabsProps { }

const MainTabs: React.FC<MainTabsProps> = () => {

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/tabs" to="/tabs/quote" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/tabs/quote" render={() => <QuotePage />} exact={true} />
        <Route path="/tabs/chart" render={() => <SpeakerList />} exact={true} />
        <Route path="/tabs/chart/:id" component={SpeakerDetail} exact={true} />
        <Route path="/tabs/quote/:id" component={SessionDetail} />
        <Route path="/tabs/chart/sessions/:id" component={SessionDetail} />
        <Route path="/tabs/trade" render={() => <MapView />} exact={true} />
        <Route path="/tabs/me" render={() => <About />} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="quote" href="/tabs/quote">
          <IonIcon icon={swapVerticalOutline} />
          <IonLabel>报价</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chart" href="/tabs/chart">
          <IonIcon icon={statsChartOutline} />
          <IonLabel>图表</IonLabel>
        </IonTabButton>
        <IonTabButton tab="trade" href="/tabs/trade">
          <IonIcon icon={cardOutline} />
          <IonLabel>交易</IonLabel>
        </IonTabButton>
        <IonTabButton tab="me" href="/tabs/me">
          <IonIcon icon={personOutline} />
          <IonLabel>我的</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;