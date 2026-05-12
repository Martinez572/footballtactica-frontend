import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d1117' }}>
      <Sidebar />
      <main style={{
        marginLeft: '240px',
        flex: 1,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;