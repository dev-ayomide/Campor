import LegalLayout from '../layouts/LegalLayout';
import ContactSupport from './auth/ContactSupport';

export default function ContactSupportPage() {
  return (
    <LegalLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ContactSupport />
      </div>
    </LegalLayout>
  );
}
