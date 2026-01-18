export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      {
        question: "How do I access my profile?",
        answer: "Click on 'My Profile' in the main navigation sidebar. Here you can view your personal information, employment details, compensation, documents, and more."
      },
      {
        question: "How do I update my personal information?",
        answer: "Navigate to My Profile and click the 'Edit' button on any section you wish to update. Some fields may require HR approval before changes take effect."
      },
      {
        question: "How do I find colleagues in the directory?",
        answer: "Use the 'Directory' link in the main navigation. You can search by name, department, or position. Click on any colleague to view their profile and contact information."
      },
      {
        question: "How do I navigate the dashboard?",
        answer: "The dashboard is your home page showing key metrics, upcoming events, and quick actions. Use the sidebar navigation on the left to access different sections of the system."
      },
      {
        question: "What do the different user roles mean?",
        answer: "Employee: Basic access to personal information and requests. Manager: Can approve team requests and view team reports. HR: Full access to employee management and company settings. Admin: Complete system access including settings configuration."
      }
    ]
  },
  {
    id: "time-off",
    label: "Time Off & Leave",
    items: [
      {
        question: "How do I request time off?",
        answer: "Go to 'Time Off' in the main navigation and click 'Request Time Off'. Select the leave type, dates, and provide any required notes. Submit the request for approval."
      },
      {
        question: "How do I check my leave balance?",
        answer: "Your leave balances are displayed at the top of the Time Off page. You can see available days for each leave type including annual leave, sick leave, and other categories."
      },
      {
        question: "What types of leave are available?",
        answer: "Common leave types include: Annual Leave, Sick Leave, Personal Leave, Bereavement Leave, Maternity/Paternity Leave, and Unpaid Leave. Available types may vary based on your employment terms."
      },
      {
        question: "How long does approval take?",
        answer: "Approval times vary based on your manager's availability. Most requests are processed within 1-2 business days. You'll receive a notification once your request is approved or requires action."
      },
      {
        question: "Can I cancel a leave request?",
        answer: "Yes, you can cancel pending requests from the Time Off page. Click on your request and select 'Cancel'. Approved requests may require manager approval for cancellation."
      },
      {
        question: "What happens if my leave request is rejected?",
        answer: "You'll receive a notification with the rejection reason. You can submit a new request with different dates or discuss alternatives with your manager."
      }
    ]
  },
  {
    id: "business-trips",
    label: "Business Trips",
    items: [
      {
        question: "How do I submit a business trip request?",
        answer: "Navigate to 'Business Trips' and click 'New Trip Request'. Fill in the destination, travel dates, purpose, and any advance requirements. Submit for manager and HR approval."
      },
      {
        question: "What is per diem and how is it calculated?",
        answer: "Per diem is a daily allowance for meals and incidental expenses during business travel. The rate is automatically calculated based on your destination and is shown when you create your trip request."
      },
      {
        question: "What expenses can be claimed?",
        answer: "Typical claimable expenses include: transportation, accommodation, meals (if not covered by per diem), visa fees, and other business-related costs. Always keep receipts for reimbursement."
      },
      {
        question: "How do I add expenses to my trip?",
        answer: "Open your trip from the Business Trips page and go to the Expenses tab. Click 'Add Expense', enter the details, upload the receipt, and save. Expenses are reviewed by HR after your trip."
      },
      {
        question: "What is the approval process for trips?",
        answer: "Business trips follow a two-step approval: first by your direct manager, then by HR. You'll receive notifications at each stage. Trip details cannot be edited once approved without submitting an amendment."
      },
      {
        question: "Can I modify an approved trip?",
        answer: "Yes, you can submit an amendment request for approved trips. Go to your trip details and click 'Request Amendment'. Changes require re-approval from your manager and HR."
      }
    ]
  },
  {
    id: "approvals",
    label: "Approvals & Requests",
    items: [
      {
        question: "Where can I see my pending requests?",
        answer: "Go to 'Approvals' in the main navigation. The 'My Requests' tab shows all your submitted requests and their current status."
      },
      {
        question: "How do I track the status of my requests?",
        answer: "Each request shows its current status: Pending, Approved, or Rejected. Click on any request to see the full approval history and any comments from approvers."
      },
      {
        question: "Who approves my requests?",
        answer: "Most requests are first approved by your direct manager, then by HR if required. The specific approval workflow depends on the request type and your organization's policies."
      },
      {
        question: "What if my request is rejected?",
        answer: "You'll receive a notification with the rejection reason. Review the feedback, make any necessary adjustments, and submit a new request if appropriate."
      },
      {
        question: "How do I approve requests as a manager?",
        answer: "If you're a manager, pending approvals appear in the 'Pending Approvals' tab. Review each request, add comments if needed, and click Approve or Reject."
      }
    ]
  },
  {
    id: "profile-documents",
    label: "My Profile & Documents",
    items: [
      {
        question: "How do I view my payslips?",
        answer: "Go to My Profile and select the 'Compensation' tab. Your payslips are listed by pay period. Click on any payslip to view or download the PDF."
      },
      {
        question: "How do I update my documents?",
        answer: "Navigate to My Profile > Documents tab. You can view your uploaded documents here. Contact HR to upload new documents or update existing ones."
      },
      {
        question: "Where can I see my compensation details?",
        answer: "Your compensation information is in My Profile > Compensation tab. This includes your salary, allowances, deductions, and payment history."
      },
      {
        question: "How do I view my benefits enrollment?",
        answer: "Go to 'Benefits' in the navigation to see your current benefit plans, coverage details, and enrollment status. You can also submit claims from this section."
      },
      {
        question: "How do I update my emergency contact?",
        answer: "In My Profile, scroll to the Emergency Contact section and click Edit. Update the contact details and save your changes."
      },
      {
        question: "How do I change my bank account for salary?",
        answer: "Bank account changes require HR verification. Contact your HR representative to update your banking information for salary deposits."
      }
    ]
  },
  {
    id: "projects",
    label: "Projects",
    items: [
      {
        question: "How do I create a new project?",
        answer: "Go to 'Projects' and click 'New Project'. Enter the project name, description, and other details. You can assign team members and set due dates."
      },
      {
        question: "How do I move projects between stages?",
        answer: "In the Kanban view, drag and drop projects between columns to change their stage. In list or table view, click on a project and update its status from the details panel."
      },
      {
        question: "How do I add comments to projects?",
        answer: "Open a project by clicking on it. In the Comments tab, type your message and click Send. All team members can see and respond to comments."
      },
      {
        question: "What are the different view modes?",
        answer: "Projects supports three views: Kanban (drag-and-drop cards), Table (spreadsheet-style), and List (compact list). Switch between them using the view toggle in the toolbar."
      },
      {
        question: "How do I filter and search projects?",
        answer: "Use the search bar to find projects by name. Apply filters for status, priority, assignee, or date range to narrow down the list."
      }
    ]
  },
  {
    id: "calendar",
    label: "Calendar & Schedule",
    items: [
      {
        question: "What events appear on the calendar?",
        answer: "The calendar shows company holidays, team events, your approved time off, and any meetings or events you're invited to."
      },
      {
        question: "How do I see company holidays?",
        answer: "Company holidays are displayed on the calendar with a special indicator. They're also listed in the Holidays section when viewing by month."
      },
      {
        question: "How do I view team members' time off?",
        answer: "The calendar displays approved time off for your team members. Use the filter options to show or hide different event types."
      },
      {
        question: "Can I add personal events to the calendar?",
        answer: "The calendar primarily shows company and team events. For personal scheduling, coordinate with your manager or HR for any work-related events."
      }
    ]
  },
  {
    id: "support",
    label: "General & Support",
    items: [
      {
        question: "Who do I contact for HR issues?",
        answer: "For HR-related questions, contact your HR representative directly through the Directory. For urgent matters, check the company contact information in Settings."
      },
      {
        question: "How do I report a system problem?",
        answer: "If you encounter technical issues, try refreshing the page first. If the problem persists, contact your IT support team or HR with details about the issue."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, your data is protected with industry-standard encryption. Access to sensitive information is role-based, meaning only authorized personnel can view certain data."
      },
      {
        question: "How do I log out of the system?",
        answer: "Click on your profile avatar in the sidebar and select the logout icon. You'll be securely logged out and returned to the login page."
      },
      {
        question: "Can I access the system from my mobile device?",
        answer: "Yes, the system is fully responsive and works on mobile devices. Simply access it through your mobile browser using the same login credentials."
      },
      {
        question: "How do I change my password?",
        answer: "Password changes are managed through the authentication system. Use the 'Forgot Password' option on the login page to reset your password via email."
      }
    ]
  }
];
