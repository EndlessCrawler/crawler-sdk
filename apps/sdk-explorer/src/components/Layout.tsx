'use client';

import DataSetSelector from '@/components/DataSetSelector';
import Header from '@/components/Header';
import Results from '@/components/Results';

interface LayoutProps {
  title?: string | null;
}

export default function Layout({ title = null, children }: React.PropsWithChildren<LayoutProps>) {
  return (
    <div>
      <Header />

      <div className="drawer">
        <DataSetSelector />
        <hr />
        {title && <h3>{title}</h3>}
        <hr />
        {children}
      </div>

      <div className="results-container">
        <Results />
      </div>
    </div>
  );
}
