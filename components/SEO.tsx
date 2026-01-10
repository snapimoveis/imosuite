
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  overrideFullTitle?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, overrideFullTitle = false }) => {
  useEffect(() => {
    const baseTitle = "ImoSuite";
    const fullTitle = overrideFullTitle ? title : `${title} | ${baseTitle}`;
    
    document.title = fullTitle;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description, overrideFullTitle]);

  return null;
};

export default SEO;
