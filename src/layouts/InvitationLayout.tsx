import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout do CONVIDADO — experiência imersiva, vertical e mobile-first.
 * NÃO herda visualmente do AdminLayout nem do ClientLayout.
 * Sem sidebar, sem menu de gestão, sem navegação administrativa.
 */
export const InvitationLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#FAF7F2]">
      <Outlet />
    </div>
  );
};
