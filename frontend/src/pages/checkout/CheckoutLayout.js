import React from 'react';
import { Outlet } from 'react-router-dom';

const CheckoutLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'row', minHeight: '70vh', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', margin: '40px auto', maxWidth: 1100 }}>
    <div style={{ flex: 1, padding: 32 }}>
      <Outlet />
    </div>
  </div>
);

export default CheckoutLayout;
