import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

interface Section {
  heading: string
  body: string
}

interface LegalPageProps {
  title: string
  updated: string
  intro: string
  sections: Section[]
}

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title={title} back="/settings" />
        <Card className="p-6">
          <p className="text-xs text-harmonic-muted mb-4">Last updated {updated}</p>
          <p className="text-sm text-harmonic-text leading-relaxed mb-6">{intro}</p>
          <div className="space-y-5">
            {sections.map(s => (
              <section key={s.heading}>
                <h2 className="text-sm font-semibold text-harmonic-text mb-1.5">{s.heading}</h2>
                <p className="text-sm text-harmonic-muted leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
          <p className="text-xs text-harmonic-muted mt-8 pt-6 border-t border-harmonic-border">
            This is placeholder content for app store compliance. Replace with your finalised legal copy before launch.
          </p>
        </Card>
      </div>
    </AppLayout>
  )
}

export function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="May 2026"
      intro="Harmoniq is a choir and worship team management app, a SoulSPCE project. This policy explains what we collect and how we use it."
      sections={[
        { heading: 'What we collect', body: 'Your Google account name, email, and profile photo when you sign in; the choir, availability, attendance, and song data you create in the app.' },
        { heading: 'How we use it', body: 'To run your choir workspace — showing services, availability, members, and announcements to the right people. We never sell your data.' },
        { heading: 'Third-party services', body: 'We use Firebase (authentication, database, storage), Spotify (song artwork and previews), Genius (lyrics links), and Google Calendar (optional service sync). Each handles data under its own policy.' },
        { heading: 'Your choices', body: 'You can edit your profile, manage notification preferences, leave a choir, or delete your account at any time from Settings.' },
        { heading: 'Contact', body: 'Questions about your data? Reach out to your choir director or the SoulSPCE team.' },
      ]}
    />
  )
}

export function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="May 2026"
      intro="By using Harmoniq you agree to these terms. Harmoniq is provided to help worship teams coordinate."
      sections={[
        { heading: 'Using Harmoniq', body: 'You must sign in with a valid Google account. You are responsible for activity under your account and for the content you post to your choir.' },
        { heading: 'Acceptable use', body: 'Be respectful. Do not upload unlawful content or infringe copyright. Lyrics are linked out to Genius; we never host full lyrics.' },
        { heading: 'Content ownership', body: 'You keep ownership of what you create. You grant your choir access to the content you share within it.' },
        { heading: 'Availability', body: 'We aim to keep Harmoniq running smoothly but provide it "as is" without warranties. Features may change as the app evolves.' },
        { heading: 'Termination', body: 'You can delete your account at any time. We may suspend accounts that violate these terms.' },
      ]}
    />
  )
}
