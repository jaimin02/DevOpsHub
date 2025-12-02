
'use client';

export const availablePages = [
  { id: '/dashboard', label: 'Dashboard' },
  { id: '/inventory', label: 'Server Inventory' },
  { id: '/port-management', label: 'Port Management' },
  { id: '/iq-master', label: 'IQ Master' },
  { id: '/iq-details', label: 'IQ Details' },
  { id: '/iq-required', label: 'IQ Checklist Request' },
  { id: '/iq-review', label: 'IQ Review' },
  { id: '/reports', label: 'Reports' },
  { id: '/master', label: 'Master Data' },
  { id: '/user-administration', label: 'User Administration' },
  { id: '/user-management', label: 'User Master' },
  { id: '/role-master', label: 'Role Master' },
];

export type Permission = 'Read' | 'Write';

export type Role = {
  id: number;
  name: string;
  permissions: { [pageId: string]: Permission };
  status: 'Y' | 'N';
  dModifiedOn: string;
  vUserName: string;
};

export const initialRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    permissions: availablePages.reduce((acc, page) => {
        acc[page.id] = 'Write';
        return acc;
    }, {} as { [pageId: string]: Permission }),
    status: 'Y',
    dModifiedOn: '2024-07-31T10:00:00Z',
    vUserName: 'Admin',
  },
  {
    id: 2,
    name: 'User',
    permissions: {
      '/dashboard': 'Read',
      '/inventory': 'Read',
      '/iq-details': 'Write',
      '/iq-required': 'Write',
    },
    status: 'Y',
    dModifiedOn: '2024-07-31T11:00:00Z',
    vUserName: 'Admin',
  },
  {
    id: 3,
    name: 'Viewer',
    permissions: {
        '/dashboard': 'Read',
        '/reports': 'Read'
    },
    status: 'N',
    dModifiedOn: '2024-07-31T12:00:00Z',
    vUserName: 'Admin',
  },
];
