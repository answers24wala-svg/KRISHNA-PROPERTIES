import { ArrowLeft, BookOpen, Clock, User, Phone, Mail, MapPin } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export default function TermsView({ onBack }: TermsViewProps) {
  const termsData = [
    {
      num: 1,
      title: "Acceptance of Terms",
      desc: "By accessing and using this Website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must immediately cease all access and use."
    },
    {
      num: 2,
      title: "Eligibility",
      desc: "Users must be at least 18 years of age and legally capable of entering into binding contracts under Indian law. By registering, you warrant that all information provided is accurate and truthful."
    },
    {
      num: 3,
      title: "User Accounts",
      desc: "To access certain services like listing creation, you must create an account. You agree to provide accurate, current, and complete registration information (including mobile number and email) and keep your credentials confidential."
    },
    {
      num: 4,
      title: "Property Listings",
      desc: "Sellers and Admins may submit genuine property listings, photos, videos, and specifications. We reserve the absolute right to review, edit, reject, suspend, or remove listings violating these Terms or public policy."
    },
    {
      num: 5,
      title: "Payments & Fees",
      desc: "Fees for featured listings or premium consulting packages are payable in advance unless stated otherwise. All payments are subject to applicable Indian taxes and are non-refundable unless specified otherwise by law."
    },
    {
      num: 6,
      title: "User Conduct",
      desc: "You agree not to publish false, misleading, fraudulent, unlawful, defamatory, or infringing content. Any abuse or bot-spam will lead to immediate account suspension and potential legal proceedings."
    },
    {
      num: 7,
      title: "Intellectual Property",
      desc: "All source code, UI elements, layouts, assets, databases, and content published belong exclusively to Krishna Properties and Consultancy or its licensors and are protected under Indian copyright laws."
    },
    {
      num: 8,
      title: "Privacy Policy",
      desc: "Our collection and usage of your personal information (name, phone, email, credentials) are governed directly by our official Privacy Policy."
    },
    {
      num: 9,
      title: "Disclaimers",
      desc: "All property listing details are user-provided. While we attempt verification, Krishna Properties and Consultancy does not warrant accuracy. Users are strictly advised to independently verify physical structures, ownership titles, and documents before making transactions."
    },
    {
      num: 10,
      title: "Limitation of Liability",
      desc: "To the maximum extent permitted by law, Krishna Properties and Consultancy shall not be liable for any indirect, consequential, or incidental losses arising from real estate deals made through links or contact options on the platform."
    },
    {
      num: 11,
      title: "Suspension & Termination",
      desc: "We reserve the right to temporarily suspend or permanently terminate user accounts, access, and active listings without prior notice in cases of contract breach, fraudulent reports, or illegal activities."
    },
    {
      num: 12,
      title: "Governing Law & Jurisdiction",
      desc: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat."
    }
  ];

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
            <BookOpen className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-on-surface leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-brand-on-surface-variant font-medium leading-relaxed max-w-2xl">
            Welcome to <strong>Krishna Properties and Consultancy</strong>. Please read these terms carefully before accessing or using our Website <strong>krishnapropertiesahmedabad.com</strong>.
          </p>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {termsData.map((t) => (
            <div key={t.num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/80 space-y-2">
              <h2 className="font-display font-black text-xs sm:text-sm text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center font-mono text-xs font-black">{t.num}</span>
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-brand-on-surface-variant leading-relaxed font-light">
                {t.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Us block */}
        <div className="border-t border-gray-100 pt-8 space-y-4">
          <h2 className="font-display font-black text-sm sm:text-base text-brand-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-on-surface flex items-center justify-center font-mono text-xs">13</span>
            Official Contact
          </h2>
          
          <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 space-y-3 text-xs font-semibold text-brand-on-surface">
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
  );
}
