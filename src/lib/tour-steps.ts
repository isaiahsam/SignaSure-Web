export interface TourStep {
  id: string;
  target?: string; // CSS selector for the element to highlight (null = centered modal)
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SignaSure!',
    description:
      'SignaSure helps you understand legal documents using AI. Let us show you around so you can get the most out of the app.',
    placement: 'center',
  },
  {
    id: 'upload-area',
    target: '[data-tour="upload-area"]',
    title: 'Upload Documents',
    description:
      'Drag and drop or click to upload a document. We support PDFs, images, and common document formats.',
    placement: 'bottom',
  },
  {
    id: 'document-type',
    target: '[data-tour="upload-area"]',
    title: 'Select Document Type',
    description:
      'After uploading, choose the type of document (lease, employment contract, NDA, etc.) and your role for a more tailored analysis.',
    placement: 'bottom',
  },
  {
    id: 'history-tab',
    target: '[data-tour="history-tab"]',
    title: 'Document History',
    description:
      'Access all your previously analyzed documents here. You can search, filter, and favorite them.',
    placement: 'bottom',
  },
  {
    id: 'sidebar-nav',
    target: '[data-tour="sidebar-nav"]',
    title: 'Navigation',
    description:
      'Use the sidebar to navigate between the Dashboard and Settings pages.',
    placement: 'right',
    // On mobile, the tour component will detect and use [data-tour="mobile-nav"] instead
  },
  {
    id: 'settings-access',
    target: '[data-tour="settings-access"]',
    title: 'Your Account',
    description:
      'Access your account settings, change themes, and manage your profile from here.',
    placement: 'bottom',
  },
];
