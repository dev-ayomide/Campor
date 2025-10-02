import LegalLayout from '../layouts/LegalLayout';
import PrivacyPolicy from './auth/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PrivacyPolicy />
      </div>
    </LegalLayout>
  );
}
