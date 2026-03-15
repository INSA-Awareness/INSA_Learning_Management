import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                        <span className="font-bold text-gray-900">CyberSafe Nation</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                        A government initiative dedicated to empowering citizens with the knowledge and tools to stay safe online. Together, we build a resilient digital nation.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">f</div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">t</div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">in</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Platform</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/" className="hover:text-primary">Home</Link></li>
                        <li><Link href="/training" className="hover:text-primary">Training Library</Link></li>
                        <li><Link href="/resources" className="hover:text-primary">Resources</Link></li>
                        <li><Link href="/dashboard" className="hover:text-primary">News & Alerts</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/contact" className="hover:text-primary">Help Center</Link></li>
                        <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                        <li><Link href="/contact" className="hover:text-primary">Report an Incident</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/about" className="hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href="/about" className="hover:text-primary">Terms of Service</Link></li>
                        <li><Link href="/about" className="hover:text-primary">Accessibility</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-100 mx-6 lg:mx-12 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                <p>© 2025 CyberSafe Nation. All rights reserved. Official Government Website.</p>
                <div className="mt-4 md:mt-0">
                    <span className="text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                        System Operational
                    </span>
                </div>
            </div>
        </footer>
    );
};
