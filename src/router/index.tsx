import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ApprovalList from '@/pages/Approval/List';
import ApprovalDetail from '@/pages/Approval/Detail';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'approval',
        children: [
          {
            index: true,
            element: <Navigate to="/approval/list" replace />,
          },
          {
            path: 'list',
            element: <ApprovalList />,
          },
          {
            path: 'detail/:id',
            element: <ApprovalDetail />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
