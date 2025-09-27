import MainLayout from '../layouts/MainLayout';
import TermsAndConditions from './auth/TermsAndConditions';

export default function TermsAndConditionsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <TermsAndConditions />
      </div>
    </MainLayout>
  );
}
