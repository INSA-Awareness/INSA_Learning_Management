import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <div className="w-full flex-col flex bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full px-6 py-24 sm:py-32 lg:px-8 text-center flex flex-col items-center"
        style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        <span className="relative z-10 text-primary text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Official Government Portal
        </span>

        <h1 className="relative z-10 mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl">
          Building a <span className="text-primary">Cyber Resilient</span> Nation
        </h1>

        <p className="relative z-10 mt-6 text-lg leading-8 text-gray-300 max-w-2xl">
          The official government platform empowering citizens, businesses, and institutions with knowledge to defend against cyber threats.
        </p>

        <div className="relative z-10 mt-10 flex items-center justify-center gap-x-4">
          <Link href="/courses"><Button variant="primary" size="lg">Explore Courses &rarr;</Button></Link>
          <Link href="/login"><Button variant="outline" size="lg" className="border-gray-300 text-white hover:bg-white/10">Sign In</Button></Link>
        </div>

        <div className="relative z-10 mt-16 pt-8 border-t border-white/20 flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs font-semibold text-gray-300 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 text-primary">&#9733;</span> Citizen Resource Hub
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 text-primary">&#9888;</span> Latest Cyber Alerts
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 text-primary">&#9993;</span> Report Incident
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="py-24 bg-gray-50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Strategic Pillars of Defense</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Guiding principles outlining our national commitment to a secure digital environment for all citizens and organizations.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-primary flex items-center justify-center mb-6">
                &#128218;
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Educate & Train</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed mb-6">
                Equipping all citizens and organizations with essential cybersecurity skills through interactive modules.
              </p>
              <Link href="/courses" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                Explore Modules &rarr;
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-6">
                &#128365;
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Alert & Inform</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed mb-6">
                Providing timely, reliable alerts regarding active ransomware and phishing campaigns.
              </p>
              <Link href="/dashboard" className="text-yellow-600 font-semibold text-sm hover:underline flex items-center gap-1">
                View Latest Alerts &rarr;
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
                &#128274;
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Protect & Empower</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed mb-6">
                Delivering actionable guidance and tools to establish robust digital defenses for all sectors.
              </p>
              <Link href="/tools" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
                Explore Tools &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Guidance */}
      <section className="py-24 bg-white px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1">
            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-4 block">Sector Specific</span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Tailored Guidance for Every Sector</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Cyber threats don&apos;t stop when you log off. Access specialized resources, frameworks, and actionable advice crafted specifically for your sector&apos;s needs.
            </p>
            <Link href="/resources"><Button variant="outline" className="mt-8">View All Categories</Button></Link>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Incident Response Playbooks</h4>
              <p className="text-sm text-gray-600 line-clamp-2">Step-by-step guides for containing and eradicating active threats in your environment.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Compliance Frameworks</h4>
              <p className="text-sm text-gray-600 line-clamp-2">Mapped controls for ISO 27001, NIST CSF, and national cybersecurity mandates.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Threat Modeling Templates</h4>
              <p className="text-sm text-gray-600 line-clamp-2">Standardized documentation for identifying architectural vulnerabilities before deployment.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Security Awareness Kits</h4>
              <p className="text-sm text-gray-600 line-clamp-2">Printable posters, email templates, and presentation decks for internal campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Threat Alerts */}
      <section className="py-24 bg-gray-50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span> Recent Threat Alerts
            </h2>
            <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-gray-900">View All Alerts &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border-t-4 border-red-500 rounded-b-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-1 rounded">Critical</span>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">Global Ransomware Campaign</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">A coordinated ransomware attack is targeting national infrastructure. Ensure all systems are patched and offline backups are secured immediately.</p>
              <Link href="/dashboard" className="text-xs font-semibold text-gray-900 underline group-hover:text-primary transition-colors">Read Details &rarr;</Link>
            </div>

            <div className="bg-white p-6 border-t-4 border-yellow-500 rounded-b-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider bg-yellow-50 px-2 py-1 rounded">High</span>
                <span className="text-xs text-gray-400">5 hours ago</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tax Season Phishing</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">Cybercriminals are sending fraudulent emails impersonating the tax authority. Do not click links or download attachments from unknown senders.</p>
              <Link href="/dashboard" className="text-xs font-semibold text-gray-900 underline">Read Details &rarr;</Link>
            </div>

            <div className="bg-white p-6 border-t-4 border-blue-500 rounded-b-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Update</span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Browser Security Patch</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">Major browser vendors have released critical updates to address a zero-day vulnerability in rendering engines. Please update immediately.</p>
              <Link href="/dashboard" className="text-xs font-semibold text-gray-900 underline">Read Details &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 bg-secondary px-6 lg:px-8 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join the National Cyber Defense</h2>
          <p className="mt-4 text-gray-400 text-lg">
            Cybersecurity is a shared responsibility. Equip yourself with the knowledge to identify threats and protect our nation&apos;s digital way of life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Create Free Account</Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" className="w-full sm:w-auto bg-transparent border border-gray-600 text-white hover:bg-gray-800">Explore Resources</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
