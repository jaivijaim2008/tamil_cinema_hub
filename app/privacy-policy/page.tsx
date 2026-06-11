export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly, such as when you fill out our contact form. This may include your name, email address, and message content. We also automatically collect certain information when you visit our website, including your IP address, browser type, and usage data.',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to respond to your inquiries, improve our website and services, analyze usage patterns, and maintain the security of our platform. We do not sell or rent your personal information to third parties.',
    },
    {
      title: 'Cookies & Tracking',
      content: 'Our website uses essential cookies to ensure proper functionality. We may also use analytics tools to understand how visitors interact with our site. You can control cookie settings through your browser preferences.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      title: 'Third-Party Services',
      content: 'Our website is built with Next.js and uses Sanity CMS for content management. These services have their own privacy policies governing how they handle data. We encourage you to review their policies.',
    },
    {
      title: 'Children\'s Privacy',
      content: 'Our website is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.',
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date.',
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us through our contact page or at hello@tamilcinemahub.xyz.',
    },
  ]

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-accent-gold text-[11px] font-mono tracking-[0.3em] uppercase mb-2">Legal</p>
        <h1 className="font-playfair text-[clamp(28px,5vw,48px)] text-text-primary mb-4">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-12">Last updated: January 2024</p>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-accent-gold">
              {/* Background number */}
              <span className="absolute -left-4 -top-4 font-mono text-5xl text-accent-gold/10 select-none pointer-events-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="font-playfair text-xl text-text-primary mb-3">{section.title}</h2>
              <p className="text-text-secondary text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
