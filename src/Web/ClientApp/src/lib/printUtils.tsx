import React from 'react';
import { createRoot } from 'react-dom/client';
import ThermalReceipt, { ThermalReceiptProps } from '../components/Admin/ThermalReceipt';

export const printReceiptViaIframe = (props: ThermalReceiptProps) => {
  // Create an invisible iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  // Hide it from screen readers as well
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }
  
  // Clone all styles to ensure Tailwind CSS works perfectly inside the iframe
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach(s => {
    iframeDoc.head.appendChild(s.cloneNode(true));
  });

  // Setup iframe body
  iframeDoc.body.setAttribute('dir', 'rtl');
  // We can add a class to body just in case print overrides need it
  iframeDoc.body.className = 'print-portal-body';

  const rootEl = iframeDoc.createElement('div');
  iframeDoc.body.appendChild(rootEl);
  
  const root = createRoot(rootEl);
  // Render the exact same component used previously, but isolated
  root.render(<ThermalReceipt {...props} />);

  // Give React time to render and browser time to fetch any linked stylesheets
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
    
    // Cleanup iframe after print dialog is closed
    // A 1 second delay is usually safe after print dialog is dismissed
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
