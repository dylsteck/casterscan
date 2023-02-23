import React from 'react';

interface HeaderProps {
  text: string;
}

const Header: React.FC<HeaderProps> = ({ text }) => {
  return (
    <div style={{ display: 'inline-block' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
        <path d="M7.908.217a2.962 2.962 0 0 1 4.183 0c.455.402.716.962.716 1.558v.006c0 2.295-1.01 3.817-1.654 4.646-.563.731-.872 1.13-.872 1.72v.25c0 .59.32.989.764 1.42.443.432.951.908.951 1.868v.444c0 1.341-.813 2.5-2.5 2.5h-3c-1.687 0-2.5-1.159-2.5-2.5v-.444c0-.96.508-1.436.952-1.868.443-.431.763-.83.763-1.42v-.25c0-.59-.308-.989-.872-1.72-.643-.83-1.654-2.35-1.654-4.646v-.006c0-.596.261-1.156.717-1.558zm4.183 1.52a1.414 1.414 0 1 0-2.83 0 1.414 1.414 0 0 0 2.83 0z"/>
      </svg>
      <span>{text}</span>
    </div>
  );
};

export default Header;