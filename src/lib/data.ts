
'use client';

export type Server = {
    recordNo: number;
    privateIp: string;
    publicIp: string;
    serverName: string;
    serverInfrastructure: string;
    serverLocation: string;
    serverOs: string;
    isOsRented: 'Yes' | 'No';
    ram: string;
    core: string;
    antivirus: string;
    ri: 'Yes' | 'No';
    riStartDate?: Date;
    riEndDate?: Date;
    database: 'Yes' | 'No';
    databaseType: string;
    serverType: string;
    cActive: 'Y' | 'N';
    vUserName: string;
    dModifiedOn: string;
};

import type { PortRule } from '@/components/PortRuleForm';
import type { IQRequest } from '@/app/iq-required/page';
import type { IQData } from '@/app/iq-details/page';

export type DbCredential = {
  id: number;
  serverName: string;
  ipAddress: string;
  os: string;
  dbName: string;
  dbUserName: string;
  dbPassword: string;
  dModifiedOn: string;
  vUserName: string;
};

export const getFieldName = (key: string) => {
    const fieldNameMap: { [key: string]: string } = {
        recordNo: 'Record No',
        privateIp: 'Private IP',
        publicIp: 'Public IP',
        serverName: 'Server Name',
        serverInfrastructure: 'Infrastructure',
        serverLocation: 'Location',
        serverOs: 'Operating System',
        ram: 'RAM',
        core: 'Core Count',
        antivirus: 'AntiVirus',
        ri: 'Reserved Instance',
        riStartDate: 'RI Start Date',
        riEndDate: 'RI End Date',
        database: 'Database Present',
        databaseType: 'Database Type',
        serverType: 'Server Type',
        isOsRented: 'Is OS Rented?',
        cActive: 'Active',
        vUserName: 'User Name',
        dModifiedOn: 'Modified On'
    };
    return fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

export const initialServers: Server[] = [
  {
    recordNo: 1,
    privateIp: '10.0.1.15',
    publicIp: '54.123.45.67',
    serverName: 'web-prod-01',
    serverInfrastructure: 'AWS',
    serverLocation: 'us-east-1',
    serverOs: 'Ubuntu 20.04',
    isOsRented: 'Yes',
    ram: '32GB',
    core: '8',
    antivirus: 'SentinelOne',
    ri: 'Yes' as const,
    riStartDate: new Date('2023-01-15'),
    riEndDate: new Date('2025-01-15'),
    database: 'Yes' as const,
    databaseType: 'PostgreSQL',
    serverType: 'Business',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2024-07-28T10:00:00Z',
  },
  {
    recordNo: 2,
    privateIp: '10.0.2.28',
    publicIp: '34.201.78.90',
    serverName: 'db-master-01',
    serverInfrastructure: 'On-Premise',
    serverLocation: 'us-west-2',
    serverOs: 'CentOS 8',
    isOsRented: 'No',
    ram: '64GB',
    core: '16',
    antivirus: 'CrowdStrike',
    ri: 'No' as const,
    riStartDate: undefined,
    riEndDate: undefined,
    database: 'Yes' as const,
    databaseType: 'MySQL',
    serverType: 'Prevalidated',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2024-07-28T11:30:00Z',
  },
  {
    recordNo: 3,
    privateIp: '10.0.3.41',
    publicIp: '52.91.12.34',
    serverName: 'app-worker-01',
    serverInfrastructure: 'Azure',
    serverLocation: 'eu-central-1',
    serverOs: 'Windows Server 2019',
    isOsRented: 'Yes',
    ram: '16GB',
    core: '4',
    antivirus: 'McAfee',
    ri: 'Yes' as const,
    riStartDate: new Date('2023-05-10'),
    riEndDate: new Date('2025-05-10'),
    database: 'No' as const,
    databaseType: 'N/A',
    serverType: 'Business',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2024-07-28T12:45:00Z',
  },
  {
    recordNo: 4,
    privateIp: '10.0.4.55',
    publicIp: '13.229.100.201',
    serverName: 'cache-main',
    serverInfrastructure: 'AWS',
    serverLocation: 'ap-southeast-1',
    serverOs: 'Debian 11',
    isOsRented: 'No',
    ram: '8GB',
    core: '2',
    antivirus: 'SentinelOne',
    ri: 'No' as const,
    riStartDate: undefined,
    riEndDate: undefined,
    database: 'No' as const,
    databaseType: 'N/A',
    serverType: 'Prevalidated',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2024-07-28T14:00:00Z',
  },
];


export const initialServerPortData: { serverName: string, publicIp: string, rules: PortRule[] }[] = [
  {
    serverName: 'web-prod-01',
    publicIp: '54.123.45.67',
    rules: [
      { ruleName: 'Allow HTTP', port: '80', protocol: 'TCP', source: '0.0.0.0/0', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
      { ruleName: 'Allow HTTPS', port: '443', protocol: 'TCP', source: '0.0.0.0/0', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
      { ruleName: 'Allow SSH from Office', port: '22', protocol: 'TCP', source: '172.16.0.10/32', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
      { ruleName: 'Block All', port: 'ALL', protocol: 'ALL', source: '0.0.0.0/0', rule: 'Denied', ruleType: 'Inbound', status: 'N', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
    ],
  },
  {
    serverName: 'db-master-01',
    publicIp: '34.201.78.90',
    rules: [
      { ruleName: 'Allow Postgres from Web', port: '5432', protocol: 'TCP', source: '10.0.1.15/32', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
      { ruleName: 'Allow SSH from Office', port: '22', protocol: 'TCP', source: '172.16.0.10/32', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
    ],
  },
  {
    serverName: 'app-worker-01',
    publicIp: '52.91.12.34',
    rules: [
      { ruleName: 'Allow App Port from Web', port: '8080', protocol: 'TCP', source: '10.0.1.15/32', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
    ],
  },
];

export const initialRequests: IQRequest[] = [
  {
    id: 'REQ-001',
    projectCode: 'STS LP_LTR_Vedoluzumab',
    crNoDetails: 'STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051',
    requestDate: new Date('2024-08-01T10:00:00Z'),
    status: 'Draft' as 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Send Back',
    user: 'Admin',
    clientFullName: 'Sarjen Systems Pvt. Ltd.',
    projectVersion: '1.3.0',
    ssplContactPerson: 'Admin',
    clientContactPerson: 'Kuldip Suthar',
    environment: 'Test',
    requestBy: 'Admin',
    signatureMode: 'DoQStack Sign' as const,
    remark: 'Initial draft remark.',
    ssplServers: [
        { type: 'Application Server', name: 'app-worker-01', ip: '10.0.3.41', os: 'Windows Server 2019'},
        { type: 'Database Server', name: 'db-master-01', ip: '10.0.2.28', os: 'CentOS 8' }
    ],
    isClientServer: false,
  },
  {
    id: 'REQ-002',
    projectCode: 'Project Phoenix',
    crNoDetails: 'CR-2024-105',
    requestDate: new Date('2024-07-28T14:30:00Z'),
    status: 'Pending Approval' as 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Send Back',
    user: 'Admin',
    clientFullName: 'Phoenix Inc.',
    projectVersion: '1.0.0',
    ssplContactPerson: 'Admin',
    clientContactPerson: 'John Phoenix',
    environment: 'Production',
    requestBy: 'Admin',
    signatureMode: 'PDF Sign' as const,
    remark: '',
    ssplServers: [],
    isClientServer: true,
    clientServerContactPerson: 'Client Contact',
    clientServerContactNo: '1234567890',
    clientServerEmail: 'client@phoenix.com',
  },
  {
    id: 'REQ-003',
    projectCode: 'Data Lake Migration',
    crNoDetails: 'N/A',
    requestDate: new Date('2024-07-25T11:00:00Z'),
    status: 'Approved' as 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Send Back',
    user: 'AnotherUser', // This one won't be displayed for 'Admin'
    clientFullName: 'Data Corp',
    projectVersion: '2.1.0',
    ssplContactPerson: 'Data Team',
    clientContactPerson: 'Data Contact',
    environment: 'Valid',
    requestBy: 'AnotherUser',
    signatureMode: 'DoQStack Sign' as const,
    reviewedBy: 'Reviewer Admin',
    reviewDate: new Date('2024-07-26T10:00:00Z'),
  },
];


export const initialIqData: IQData[] = [
  {
    id: 'IQ-001',
    clientFullName: 'Sarjen Systems Pvt. Ltd.',
    projectCode: 'STS LP_LTR_Vedoluzumab',
    projectVersion: '1.3.0',
    ssplContactPerson: 'Admin User',
    clientContactPerson: 'Kuldip Suthar',
    environment: 'Test',
    crNoDetails: 'STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051',
    requestDate: new Date('2024-01-15T09:00:00Z'),
    requestBy: 'John Doe',
    remark: 'Initial setup for the new QC pipeline.',
    signatureMode: 'DoQStack Sign' as 'DoQStack Sign' | 'PDF Sign' | 'Others',
    
    protocolSendDate: null,
    protocolSignedDate: null,
    protocolSignedBy: '',
    protocolRemark: '',
    
    scriptExecStartDate: null,
    scriptExecEndDate: null,
    scriptSendDate: null,
    scriptSignedDate: null,
    scriptSignedBy: '',
    scriptRemark: '',

    reportSendDate: null,
    reportSignedDate: null,
    reportSignedBy: '',
    reportRemark: '',
    vUserName: 'Admin',
    dModifiedOn: '2024-07-29T10:00:00Z',
    status: 'InProgress' as 'InProgress' | 'Completed',
  },
  {
    id: 'IQ-002',
    clientFullName: 'BioGen Corp.',
    projectCode: 'Data Lake Migration',
    projectVersion: '2.0.0',
    ssplContactPerson: 'Admin User',
    clientContactPerson: 'Jane Smith',
    environment: 'Production',
    crNoDetails: 'N/A',
    requestDate: new Date('2024-07-10T11:30:00Z'),
    requestBy: 'Jane Smith',
    remark: '',
    signatureMode: 'PDF Sign' as 'DoQStack Sign' | 'PDF Sign' | 'Others',
    
    protocolSendDate: new Date('2024-07-12T14:00:00Z'),
    protocolSignedDate: new Date('2024-07-13T10:00:00Z'),
    protocolSignedBy: 'Robert Brown',
    protocolRemark: 'Protocol signed off without issues.',

    scriptExecStartDate: new Date('2024-07-14T09:00:00Z'),
    scriptExecEndDate: new Date('2024-07-15T17:00:00Z'),
    scriptSendDate: new Date('2024-07-16T11:00:00Z'),
    scriptSignedDate: new Date('2024-07-17T15:00:00Z'),
    scriptSignedBy: 'Michael Green',
    scriptRemark: 'Minor adjustments needed for script execution.',

    reportSendDate: new Date('2024-07-18T10:00:00Z'),
    reportSignedDate: new Date('2024-07-19T16:00:00Z'),
    reportSignedBy: 'Susan White',
    reportRemark: 'Final report approved.',
    vUserName: 'Jane Smith',
    dModifiedOn: '2024-07-29T11:30:00Z',
    status: 'Completed' as 'InProgress' | 'Completed',
  }
];

export const antivirusData = [
  {
    nAntivirusNo: 1,
    vAntivirusName: 'SentinelOne',
    cActive: 'Y' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nAntivirusNo: 2,
    vAntivirusName: 'CrowdStrike',
    cActive: 'Y' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nAntivirusNo: 3,
    vAntivirusName: 'McAfee',
    cActive: 'N' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const providers = [
  {
    nDBProviderNo: 1,
    vDBProviderName: 'PostgreSQL',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nDBProviderNo: 2,
    vDBProviderName: 'MySQL',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nDBProviderNo: 3,
    vDBProviderName: 'MongoDB',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const environmentData = [
  {
    nEnvironmentNo: 1,
    vEnvironmentName: 'Test',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nEnvironmentNo: 2,
    vEnvironmentName: 'Valid',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nEnvironmentNo: 3,
    vEnvironmentName: 'Production',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
  {
    nEnvironmentNo: 4,
    vEnvironmentName: 'Demo',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T13:00:00Z',
  },
];

export const locations = [
  {
    nLocationNo: 1,
    vLocationName: 'us-east-1',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nLocationNo: 2,
    vLocationName: 'us-west-2',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nLocationNo: 3,
    vLocationName: 'eu-central-1',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const osData = [
  {
    nOSNo: 1,
    vOSName: 'Ubuntu 20.04',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nOSNo: 2,
    vOSName: 'CentOS 8',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nOSNo: 3,
    vOSName: 'Windows Server 2019',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const infraData = [
  {
    nInfraNum: 1,
    vInfraName: 'On-Premise',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nInfraNum: 2,
    vInfraName: 'AWS',
    cActive: 'Y',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nInfraNum: 3,
    vInfraName: 'Azure',
    cActive: 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const deptData = [
  {
    nDeptNo: 1,
    vDeptName: 'Development',
    cActive: 'Y' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T10:00:00Z',
  },
  {
    nDeptNo: 2,
    vDeptName: 'IT',
    cActive: 'Y' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T11:00:00Z',
  },
  {
    nDeptNo: 3,
    vDeptName: 'QA',
    cActive: 'Y' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
   {
    nDeptNo: 4,
    vDeptName: 'DevOps',
    cActive: 'N' as 'Y' | 'N',
    vUserName: 'Admin',
    dModifiedOn: '2023-10-27T12:00:00Z',
  },
];

export const initialDbCredentials: DbCredential[] = [
    {
        id: 1,
        serverName: 'db-master-01',
        ipAddress: '10.0.2.28',
        os: 'CentOS 8',
        dbName: 'production_db',
        dbUserName: 'prod_user',
        dbPassword: 'secure_password_1',
        dModifiedOn: '2024-08-01T10:00:00Z',
        vUserName: 'Admin',
    },
    {
        id: 2,
        serverName: 'web-prod-01',
        ipAddress: '10.0.1.15',
        os: 'Ubuntu 20.04',
        dbName: 'analytics_db',
        dbUserName: 'analytics_user',
        dbPassword: 'secure_password_2',
        dModifiedOn: '2024-08-01T11:00:00Z',
        vUserName: 'Admin',
    }
];

export const initialPortRules: PortRule[] = [
  { ruleName: 'Allow HTTP', port: '80', protocol: 'TCP', source: '0.0.0.0/0', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
  { ruleName: 'Allow HTTPS', port: '443', protocol: 'TCP', source: '0.0.0.0/0', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
  { ruleName: 'Allow SSH', port: '22', protocol: 'TCP', source: '172.16.0.10/32', rule: 'Allowed', ruleType: 'Inbound', status: 'Y', dModifiedOn: new Date().toISOString(), vUserName: 'Admin' },
];

export const initialUsers = [
  { id: 1, name: 'Admin User', email: 'admin@devopshub.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'John Doe', email: 'john@devopshub.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'Jane Smith', email: 'jane@devopshub.com', role: 'User', status: 'Active' },
  { id: 4, name: 'Bob Johnson', email: 'bob@devopshub.com', role: 'Viewer', status: 'Inactive' },
];

export const initialRoles = [
  { id: 1, name: 'Admin', permissions: 15, description: 'Full system access' },
  { id: 2, name: 'Manager', permissions: 12, description: 'Management access' },
  { id: 3, name: 'User', permissions: 8, description: 'Standard user access' },
  { id: 4, name: 'Viewer', permissions: 3, description: 'Read-only access' },
];
