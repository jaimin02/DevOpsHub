# User Requirement Specification (URS) for DevOps Hub

## 1. Introduction

### 1.1. Purpose
This document outlines the detailed user requirements for the **DevOps Hub**, a centralized, web-based platform designed to streamline and manage critical IT operations. The system provides tools for server inventory management, security policy enforcement (port management), a complete Installation Qualification (IQ) lifecycle workflow, master data administration, and role-based user access control.

### 1.2. Scope
The application provides a secure, auditable, and efficient environment for IT administrators and users to manage infrastructure, track qualifications, and generate reports. The scope covers the initial user authentication to the final generation of operational reports.

## 2. Functional Requirements

### 2.1. Authentication & User Access
- **UR-001 (Login):** Users must be able to log into the application using a unique username and password. The system shall support both AD and Non-AD user types.
- **UR-002 (Password Recovery):** A "Forgot Password" feature must be available, allowing users to securely reset their password via their registered email address.
- **UR-003 (Role-Based Access Control - RBAC):** The system must enforce RBAC. User actions shall be restricted based on their assigned role (e.g., Admin, User, Viewer).

### 2.2. Main Dashboard
- **UR-004 (Dashboard Overview):** Upon successful login, the user shall be directed to a central dashboard that presents a high-level, real-time summary of the system's operational status.
- **UR-005 (Key Metrics):** The dashboard must display key performance indicators (KPIs) in visually distinct cards, including:
    - Total number of managed servers.
    - Total number of IQ records.
    - Summary of total backup operations (e.g., daily, weekly, monthly for applications and databases).
    - Count of IQ requests pending signature/approval.
- **UR-006 (Recent Activity):** The dashboard shall feature a feed displaying the most recent activities within the system, such as server updates and IQ request status changes, including timestamps and the user responsible.

### 2.3. Master Data Management
- **UR-007 (Centralized Master Data):** The system must provide a "Master" section for the creation, viewing, and editing of core data entities. Each master data page must support search, add, and edit functionalities.
- **UR-008 (Server Inventory):** Manage detailed records of all servers, including fields for IP addresses (private/public), OS, hardware specs (RAM, Core), infrastructure provider, location, RI status, and database details.
- **UR-009 (Location Master):** Manage a list of physical or cloud-based locations (e.g., data centers, regions).
- **UR-010 (OS Master):** Manage a list of approved Operating Systems.
- **UR-011 (Infrastructure Master):** Manage infrastructure providers (e.g., AWS, Azure, On-Premise).
- **UR-012 (Database Provider Master):** Manage a list of supported database technologies (e.g., PostgreSQL, MySQL).
- **UR-013 (AntiVirus Master):** Manage a list of approved antivirus solutions.
- **UR-014 (Environment Master):** Manage deployment environments (e.g., Test, Production, Valid, Demo).
- **UR-015 (Department Master):** Manage a list of company departments.

### 2.4. Security Management
- **UR-016 (Port Management):**
    - The system must allow authorized users to view and manage port rules (firewall rules) for each configured server.
    - Users must be able to add, edit, and view inbound/outbound rules, specifying ports, protocols, source/destination IPs, and rule status (Active/Inactive).
- **UR-017 (DB Credentials):**
    - The system must provide a secure interface for managing database credentials associated with servers.
    - Users shall be able to add, view, and edit credentials, including DB username and password.

### 2.5. Installation Qualification (IQ) Lifecycle
- **UR-018 (IQ Checklist Request):** Users must be able to create a detailed IQ Checklist Request, specifying project, client, server details (SSPL or client-managed), software requirements, and access rights.
- **UR-019 (IQ Review & Approval):** An authorized reviewer must be able to review pending IQ requests. The reviewer shall have the ability to "Approve", "Reject", or "Send Back" a request with mandatory remarks.
- **UR-020 (IQ Details Tracking):** Upon approval, an IQ record is created. Users shall be able to track and update the status of this record through its four main stages:
    - IQ Checklist
    - IQ Protocol
    - IQ Script
    - IQ Report
- **UR-021 (Stage Updates):** For each stage, users must be able to update key information, including send dates, signed dates, signatory names, and remarks.

### 2.6. User Administration
- **UR-022 (User Management):** Administrators must be able to create, view, edit, and manage user accounts from a "User Master" page. This includes assigning user types (AD/Non-AD), roles, departments, and setting account status (Active/Inactive).
- **UR-023 (Role Management):** Administrators must be able to define user roles from a "Role Master" page. This includes creating roles and assigning specific page-level permissions (e.g., Read, Write, None) to each role.

### 2.7. Reporting
- **UR-024 (Reporting Module):** The application must provide a dedicated reporting module to generate and export operational data.
- **UR-025 (Exportable Reports):** Users shall be able to generate and export the following reports in both PDF and Excel formats:
    - Server Inventory Report
    - Port Management Report
    - IQ Details Report

## 3. Non-Functional Requirements

### 3.1. Usability & Interface
- **NFR-001:** The UI must be clean, modern, and intuitive, following a consistent design language (Neumorphism + Material Hybrid).
- **NFR-002:** The system must support both light and dark themes, which can be toggled by the user.
- **NFR-003:** All interactive elements (buttons, cards) must provide visual feedback (e.g., hover effects, shadows).
- **NFR-004:** Navigation must be clear and consistent, with a primary sidebar for major sections.

### 3.2. Audit & Traceability
- **NFR-005:** All changes to master data, user records, and roles must be captured in an audit trail.
- **NFR-006:** The audit trail must log the change details (field, old value, new value), the user who made the change, a timestamp, and a mandatory remark for the change.
- **NFR-007:** The audit trail for any given record must be viewable from that record's management page.
