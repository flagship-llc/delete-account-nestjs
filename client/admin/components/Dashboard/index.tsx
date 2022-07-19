import React from 'react';
import { Card, Page } from '@shopify/polaris';
import { useAppContext } from '../../contexts/AppContext';

const Dashboard = () => {
  const app = useAppContext();

  const getSomeValueFromAdminController = async () => {
    await app.get('/admin');
  };

  return (
    <Page>
      <Card>
        <Card.Section>
          <p>
            This is the admin dashboard.
          </p>
        </Card.Section>
      </Card>
    </Page>
  );
};

export default Dashboard;
