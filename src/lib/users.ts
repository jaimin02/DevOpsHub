
'use client';

export type User = {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'Admin' | 'User' | 'Viewer';
  deptName?: string;
  cActive: 'Y' | 'N';
  userType: 'AD User' | 'Non-AD User';
  dModifiedOn: string;
  vUserName: string;
};

export const getFieldName = (key: string) => {
    const fieldNameMap: { [key: string]: string } = {
        userId: 'User ID',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        mobile: 'Mobile',
        role: 'Role',
        deptName: 'Dept. Name',
        cActive: 'Active',
        userType: 'User Type',
        dModifiedOn: 'Modified On'
    };
    return fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

export const initialUsers: User[] = [
  {
    id: 1,
    userId: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    mobile: '123-456-7890',
    role: 'Admin',
    deptName: 'IT',
    cActive: 'Y',
    userType: 'AD User',
    dModifiedOn: '2024-07-30T10:00:00Z',
    vUserName: 'Admin'
  },
  {
    id: 2,
    userId: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    mobile: '987-654-3210',
    role: 'User',
    deptName: 'QA',
    cActive: 'Y',
    userType: 'Non-AD User',
    dModifiedOn: '2024-07-30T11:00:00Z',
    vUserName: 'Admin'
  },
  {
    id: 3,
    userId: 'viewer',
    firstName: 'Viewer',
    lastName: 'Person',
    email: 'viewer@example.com',
    role: 'Viewer',
    deptName: 'Development',
    cActive: 'N',
    userType: 'AD User',
    dModifiedOn: '2024-07-30T12:00:00Z',
    vUserName: 'Admin'
  },
];
