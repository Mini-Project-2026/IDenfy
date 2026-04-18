import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Search,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 text-slate-400" id="about">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-indigo-900/40 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">IDenfy</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              IDenfy is a blockchain-powered certificate verification platform
              that ensures the authenticity and integrity of academic and
              government-issued credentials. Tamper-proof, transparent, and
              instantly verifiable.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                akash.2024ca010@mnnit.ac.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                +91 77848 68961
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                R N Tagore Hostel, MNNIT Allahabad, Prayagraj, Uttar Pradesh, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} IDenfy. All rights reserved.</p>
          <p>
            Built with <span className="text-indigo-400">Blockchain</span> &middot; Powered by <span className="text-indigo-400">Hyperledger</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
