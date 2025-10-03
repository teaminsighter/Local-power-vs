"use client";

import Image from 'next/image';

export function Footer() {
    const scrollToConsultation = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <footer className="bg-primary text-primary-foreground" id="main-footer">
            <div className="container py-12 md:py-16 space-y-8">
                <div className="flex flex-col md:flex-row items-start justify-start gap-12">
                     <a href="#" className="flex items-center flex-shrink-0" id="footer-logo-link">
                        <Image
                            src="https://firebasestorage.googleapis.com/v0/b/localpower-60d8a.firebasestorage.app/o/Local-Power-logo-green.jpg?alt=media&token=e473a750-1fa9-4e11-b3f0-ddb128741b42"
                            alt="Local Power Logo"
                            width={200}
                            height={50}
                            className="h-10 w-auto"
                        />
                    </a>
                    <div className="space-y-2 text-primary-foreground/80 text-base">
                        <p>The Green Commercial Centre, Main St., Dunboyne, Co. Meath, Ireland</p>
                        <p>Phone: +35318250263</p>
                        <p>info@localpower.ie</p>
                    </div>
                </div>
                 <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-primary-foreground/60">
                    <p className="text-sm text-center md:text-left">&copy; {new Date().getFullYear()} Local Power Ltd. All Rights Reserved.</p>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-white transition-colors uppercase footer-link" id="footer-privacy-policy">Privacy Policy</a>
                        <a href="#" onClick={scrollToConsultation} className="hover:text-white transition-colors uppercase footer-link" id="footer-contact">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
