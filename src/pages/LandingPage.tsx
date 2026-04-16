import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
          Every family deserves<br />to know their story
        </h1>
        <p className="mt-6 text-lg text-ink/70 max-w-2xl mx-auto leading-relaxed">
          A place for Indigenous Australian families to build their own living history.
          Track your family tree, add stories, set dreams for the next generation,
          and see where you fit in the bigger picture.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            to="/join"
            className="px-6 py-3 rounded-full text-base font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
          >
            Join your family
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3 rounded-full text-base font-medium bg-sand text-desert hover:bg-sand/80 transition-colors"
          >
            Explore stories
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand/30 border-y border-ink/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-2xl text-ink text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Create a family folder"
              description="A family elder or organiser starts a folder. No institution needed. Just a family name and the first few people."
              color="desert"
            />
            <StepCard
              number={2}
              title="Invite family to contribute"
              description="Share a code. Family members add their own stories, photos, and dreams. Each person controls their own privacy."
              color="ochre"
            />
            <StepCard
              number={3}
              title="See the bigger picture"
              description="As families build their stories, connections emerge. Shared ancestors, overlapping country, intertwined histories."
              color="eucalypt"
            />
          </div>
        </div>
      </section>

      {/* What makes this different */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-2xl text-ink text-center mb-8">What makes this different</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <Card
            title="Family-owned, not institution-owned"
            body="No government department, no university, no NGO controls the data. The family decides who sees what."
          />
          <Card
            title="Built for oral + visual culture"
            body="Stories, photos, audio. Not just dates and names in a spreadsheet. The timeline is a living narrative."
          />
          <Card
            title="Connects to real opportunity"
            body="Dreams aren't just recorded. They're connected to mentors and resources through the Dream Inbox."
          />
          <Card
            title="Respects cultural sensitivity"
            body="Every piece of content has visibility and cultural sensitivity controls. Sacred knowledge stays protected."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-desert/5 border-t border-desert/10 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-2xl text-ink mb-4">Ready to start?</h2>
          <p className="text-ink/60 mb-6">
            Create a family folder in under a minute. No email or password needed.
            Just your family name and yours.
          </p>
          <Link
            to="/join"
            className="inline-block px-6 py-3 rounded-full text-base font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
          >
            Create your family folder
          </Link>
        </div>
      </section>
    </div>
  )
}

function StepCard({ number, title, description, color }: { number: number; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    desert: 'bg-desert/10 text-desert border-desert/20',
    ochre: 'bg-ochre/10 text-ochre border-ochre/20',
    eucalypt: 'bg-eucalypt/10 text-eucalypt border-eucalypt/20',
  }
  return (
    <div className="border border-ink/10 rounded-xl p-6 bg-cream">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium border ${colorMap[color]}`}>
        {number}
      </div>
      <h3 className="font-serif text-lg text-ink mt-3 mb-2">{title}</h3>
      <p className="text-sm text-ink/60 leading-relaxed">{description}</p>
    </div>
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 rounded-lg bg-sand/30 border border-ink/5">
      <h4 className="text-sm font-medium text-ink mb-1">{title}</h4>
      <p className="text-xs text-ink/60 leading-relaxed">{body}</p>
    </div>
  )
}
