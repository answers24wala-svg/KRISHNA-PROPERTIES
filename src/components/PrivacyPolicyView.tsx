import { ArrowLeft, Shield, Clock, User, Phone, Mail, MapPin } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export default function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Navigation Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-150">
          <Clock className="w-3 h-3 text-brand-secondary" />
          Effective: July 21, 2026
        </span>
      </div>

      {/* Main Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Title Block */}
        <div className="border-b border-gray-100 pb-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <Shield className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-on-surface leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-brand-on-surface-variant font-medium leading-relaxed max-w-2xl">
            Welcome to <strong>Krishna Properties and Consultancy</strong> ("Company," "we," "our," or "us"). 
            This Privacy Policy explains how we collect, use, store, disclose, and protect your personal information 
            when you access or use <strong>krishnapropertiesahmedabad.com</strong> (the "Website") and any related services.
          </p>
        </div>

        {/* Content body */}
        <div className="space-y-6 text-xs sm:text-sm text-brand-on-surface-variant leading-relaxed font-light">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">1</span>
              Information We Collect
            </h2>
            <p>We may collect the following categories of information:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold text-brand-on-surface text-xs block mb-1">A. Personal Information</span>
                <ul className="list-disc list-inside space-y-1 text-gray-500 font-medium">
                  <li>Full Name</li>
                  <li>Mobile Number</li>
                  <li>Email Address</li>
                  <li>Residential or Business Address</li>
                  <li>City, State and PIN Code</li>
                  <li>Profile photograph (optional)</li>
                </ul>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold text-brand-on-surface text-xs block mb-1">B. Property Information</span>
                <ul className="list-disc list-inside space-y-1 text-gray-500 font-medium">
                  <li>Property title and description</li>
                  <li>Property location & coordinates</li>
                  <li>Property photos and videos</li>
                  <li>Pricing & Specifications</li>
                  <li>Amenities and facilities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">2</span>
              Registration Information
            </h2>
            <p>
              To create an account (Buyer or Seller), you are required to provide a valid <strong>Mobile Number</strong>, 
              <strong>Email Address</strong>, password, and secure OTP verification. You are solely responsible for 
              maintaining the confidentiality of your login credentials.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">3</span>
              Property Listings
            </h2>
            <p>
              Users/Sellers uploading listing images, floor plans, pricing, and ownership details confirm that they own or 
              have the necessary authorizations and rights to publish such content.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">4</span>
              How We Use Your Information
            </h2>
            <p>We use your information to operate our marketplace, connect buyers and sellers, prevent fraud, verify map listings, and comply with regulatory duties.</p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">5</span>
              Communications
            </h2>
            <p>
              We may contact you via SMS, Phone Calls, WhatsApp, and Emails for transactional confirmations, 
              enquiry forwarding, OTP verifications, and platform updates.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">6</span>
              Payments & Cookies
            </h2>
            <p>
              Paid advertisements or featured services are processed via secure external payment channels. 
              We do not store complete bank cards or UPI PIN credentials. 
              Cookies are used to maintain sessions and persist browser preferences.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">7</span>
              Sharing of Information
            </h2>
            <p>
              We do <strong>not</strong> sell your personal data. Your contact info is only displayed to matching leads, 
              brokers, or as authorized by you to facilitate property transactions.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">8</span>
              Contact Us & Governing Law
            </h2>
            <p>
              This Privacy Policy is governed by the laws of India. For concerns or account deletion requests, 
              please reach out directly using the official coordinates below:
            </p>

            {/* Official Contact Info Card */}
            <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-3 mt-4 text-xs font-semibold text-brand-on-surface">
              <span className="font-display font-extrabold text-sm block">Krishna Properties and Consultancy</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5 text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-secondary shrink-0" />
                  <span>Owner: Gopal Naidu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-secondary shrink-0" />
                  <a href="tel:9638177321" className="text-brand-secondary hover:underline font-bold">+91 96381 77321</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-secondary shrink-0" />
                  <a href="mailto:Gopalnaidu085@gmail.com" className="text-brand-secondary hover:underline">Gopalnaidu085@gmail.com</a>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Shop no 18, Sangani Platinum, Opp. Shalin Heights 2,<br />
                    Narol Aslali Highway, Narol, Ahmedabad, Gujarat - 382405
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
