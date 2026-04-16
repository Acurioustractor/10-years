import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useKinship } from '@/hooks/useKinship'

type Tab = 'overview' | 'locations' | 'admin' | 'login'

const LOCATIONS = [
  { id: 'alice-springs', name: 'Alice Springs / Mparntwe', region: 'Central Australia', families: 3, people: 37, color: 'desert' },
  { id: 'palm-island', name: 'Palm Island', region: 'North Queensland', families: 0, people: 0, color: 'eucalypt' },
  { id: 'darwin', name: 'Darwin / Larrakia Country', region: 'Top End', families: 0, people: 0, color: 'ochre' },
  { id: 'katherine', name: 'Katherine / Nitmiluk', region: 'Big Rivers', families: 0, people: 0, color: 'desert' },
  { id: 'tennant-creek', name: 'Tennant Creek / Jurnkurakurr', region: 'Barkly', families: 0, people: 0, color: 'ochre' },
  { id: 'broome', name: 'Broome / Yawuru Country', region: 'Kimberley', families: 0, people: 0, color: 'eucalypt' },
]

export default function FamilyFolderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { graph } = useKinship()

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Family folder</h1>
        <p className="text-ink/60 mt-2 max-w-2xl leading-relaxed">
          A place for families to own their story. Create a family folder, invite members to contribute,
          and build a living history that connects generations — past, present, and future.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-sand/40 p-1 mb-8 overflow-x-auto">
        {([
          { id: 'overview', label: 'How it works' },
          { id: 'locations', label: 'By location' },
          { id: 'admin', label: 'Admin tools' },
          { id: 'login', label: 'Family login' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-cream text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab peopleCount={graph.nodes.length} />}
      {activeTab === 'locations' && <LocationsTab />}
      {activeTab === 'admin' && <AdminTab />}
      {activeTab === 'login' && <LoginTab />}
    </div>
  )
}

function OverviewTab({ peopleCount }: { peopleCount: number }) {
  return (
    <div className="space-y-8">
      {/* Vision statement */}
      <div className="bg-desert/5 border border-desert/20 rounded-xl p-6 md:p-8">
        <h2 className="font-serif text-2xl text-ink mb-3">Every family deserves to know their story</h2>
        <p className="text-ink/70 leading-relaxed">
          For too long, Indigenous Australian family histories have been scattered across government archives,
          mission records, and fading memories. Family Folder puts that story back in the hands of the people
          who lived it. One family at a time, one location at a time — building toward a connected map of
          history that spans the continent.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StepCard
          number={1}
          title="Create a family folder"
          description="A family elder or organiser starts a folder. No org needed — just a family name and the first few people. The folder belongs to the family, not an institution."
          color="desert"
        />
        <StepCard
          number={2}
          title="Invite family to contribute"
          description="Share a link or code. Family members add their own stories, photos, and dreams. Each person controls their own privacy — what's shared and what stays private."
          color="ochre"
        />
        <StepCard
          number={3}
          title="See the bigger picture"
          description="As families build their stories, connections emerge — shared ancestors, overlapping country, intertwined histories. The timeline grows from one family into a living map of community."
          color="eucalypt"
        />
      </div>

      {/* Current state */}
      <div className="border border-ink/10 rounded-xl p-6 bg-cream">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2 w-2 rounded-full bg-eucalypt animate-pulse" />
          <h3 className="font-serif text-lg text-ink">Oonchiumpa pilot</h3>
        </div>
        <p className="text-sm text-ink/60 mb-4">
          The first family folder is live with the Bloomfield–Kunoth–Liddle–Randall families in Alice Springs.
          {peopleCount > 0 && ` ${peopleCount} people across multiple generations, from the 1870s to 2036.`}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="text-sm px-4 py-2 rounded-full bg-ochre/10 text-ochre hover:bg-ochre/15 transition-colors">
            View the timeline →
          </Link>
          <Link to="/family" className="text-sm px-4 py-2 rounded-full bg-sand text-desert hover:bg-sand/80 transition-colors">
            See the family tree →
          </Link>
        </div>
      </div>

      {/* What makes this different */}
      <div>
        <h3 className="font-serif text-xl text-ink mb-4">What makes this different</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DifferenceCard
            title="Family-owned, not institution-owned"
            body="No government department, no university, no NGO controls the data. The family decides who sees what."
          />
          <DifferenceCard
            title="Built for oral + visual culture"
            body="Stories, photos, audio — not just dates and names in a spreadsheet. The timeline is a living narrative."
          />
          <DifferenceCard
            title="Connects to real opportunity"
            body="Dreams aren't just recorded — they're connected to mentors and resources through the Dream Inbox."
          />
          <DifferenceCard
            title="Respects cultural sensitivity"
            body="Every piece of content has visibility and cultural sensitivity controls. Sacred knowledge stays protected."
          />
        </div>
      </div>
    </div>
  )
}

function LocationsTab() {
  return (
    <div className="space-y-6">
      <p className="text-ink/60 max-w-2xl">
        Browse by location to find families and histories connected to specific country.
        As more families create folders, this map grows.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOCATIONS.map(loc => (
          <div
            key={loc.id}
            className={`border rounded-xl p-5 transition-colors ${
              loc.families > 0
                ? 'border-ochre/30 bg-ochre/5 hover:bg-ochre/10 cursor-pointer'
                : 'border-ink/10 bg-cream opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg text-ink">{loc.name}</h3>
                <div className="text-xs text-ink/50 mt-0.5">{loc.region}</div>
              </div>
              {loc.families > 0 ? (
                <div className="text-right">
                  <div className="text-sm font-medium text-ochre tabular-nums">{loc.families} families</div>
                  <div className="text-xs text-ink/40 tabular-nums">{loc.people} people</div>
                </div>
              ) : (
                <span className="text-xs text-ink/30 px-2 py-1 rounded-full bg-ink/5">Coming soon</span>
              )}
            </div>
            {loc.families > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Link to="/family" className="text-xs text-ochre hover:underline">
                  View families →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-eucalypt/5 border border-eucalypt/20 rounded-xl p-6 mt-8">
        <h3 className="font-serif text-lg text-ink mb-2">Want to add your community?</h3>
        <p className="text-sm text-ink/60 leading-relaxed">
          If you're from an Aboriginal or Torres Strait Islander community and want to start documenting
          your family history here, get in touch. We'll help you set up a family folder and
          connect you with the tools to tell your story your way.
        </p>
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-full text-sm bg-eucalypt/15 text-eucalypt hover:bg-eucalypt/25 transition-colors"
        >
          Register interest
        </button>
      </div>
    </div>
  )
}

function AdminTab() {
  return (
    <div className="space-y-6">
      <p className="text-ink/60 max-w-2xl">
        Admin tools for community administrators who manage family folders for a location or organisation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminToolCard
          title="Manage people"
          description="Add, edit, or merge people records. Fix duplicate entries. Link people across families."
          icon="👤"
          status="Available in Empathy Ledger"
        />
        <AdminToolCard
          title="Manage kinship"
          description="Add family relationships. Connect parents to children, siblings to siblings. Build the tree."
          icon="🌿"
          status="Available in Empathy Ledger"
        />
        <AdminToolCard
          title="Manage timeline"
          description="Add historical events, milestones, and future aspirations. Attach people and media."
          icon="📅"
          status="Available in Empathy Ledger"
        />
        <AdminToolCard
          title="Review contributions"
          description="Approve stories and photos submitted by family members. Flag sensitive content."
          icon="✓"
          status="Coming soon"
        />
        <AdminToolCard
          title="Privacy controls"
          description="Set default visibility for the folder. Manage who can see what. Handle cultural sensitivity."
          icon="🔒"
          status="Coming soon"
        />
        <AdminToolCard
          title="Export & backup"
          description="Download the full family history as a PDF book, GEDCOM file, or data export."
          icon="📦"
          status="Planned"
        />
      </div>

      <div className="border border-ink/10 rounded-xl p-6 bg-sand/20">
        <h3 className="font-serif text-lg text-ink mb-2">Admin access</h3>
        <p className="text-sm text-ink/60 mb-4">
          Admins are appointed by the family or community organisation. Each admin manages one or more
          family folders and can invite other admins. The Empathy Ledger platform handles permissions.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink/40 px-3 py-1.5 rounded-full bg-ink/5">
            Currently: Oonchiumpa org admins manage all folders
          </span>
        </div>
      </div>
    </div>
  )
}

function LoginTab() {
  const [mode, setMode] = useState<'login' | 'create'>('login')

  return (
    <div className="max-w-md mx-auto">
      <div className="border border-ink/10 rounded-xl bg-cream p-6 md:p-8">
        <div className="flex gap-1 rounded-full bg-sand/40 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'create' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60'
            }`}
          >
            Create folder
          </button>
        </div>

        {mode === 'login' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Family code</label>
              <input
                type="text"
                placeholder="e.g. BLOOM-2024"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
              <p className="text-[11px] text-ink/40 mt-1">Your family admin will give you this code</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Your name</label>
              <input
                type="text"
                placeholder="As your family knows you"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-lg bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors"
            >
              Enter family folder
            </button>
            <p className="text-xs text-ink/40 text-center">
              No email or password needed — just the family code and your name.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Family name</label>
              <input
                type="text"
                placeholder="e.g. Bloomfield family"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Location / Country</label>
              <input
                type="text"
                placeholder="e.g. Alice Springs, Arrernte Country"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Your name (admin)</label>
              <input
                type="text"
                placeholder="You'll be the first admin"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Email (optional)</label>
              <input
                type="email"
                placeholder="For account recovery only"
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
              />
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-lg bg-eucalypt text-cream font-medium text-sm hover:bg-eucalypt/90 transition-colors"
            >
              Create family folder
            </button>
            <p className="text-xs text-ink/40 text-center">
              You'll get a family code to share with relatives. They can join with just the code and their name.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-ink/40 max-w-sm mx-auto leading-relaxed">
        Family Folder is powered by the Empathy Ledger. Your family's data belongs to your family.
        We never share it without permission.
      </div>
    </div>
  )
}

// ─── Shared components ──────────────────────────────────────────────────

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

function DifferenceCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-4 rounded-lg bg-sand/30 border border-ink/5">
      <h4 className="text-sm font-medium text-ink mb-1">{title}</h4>
      <p className="text-xs text-ink/60 leading-relaxed">{body}</p>
    </div>
  )
}

function AdminToolCard({ title, description, icon, status }: { title: string; description: string; icon: string; status: string }) {
  const statusColor = status.includes('Available') ? 'text-eucalypt bg-eucalypt/10' :
    status.includes('Coming') ? 'text-ochre bg-ochre/10' : 'text-ink/40 bg-ink/5'
  return (
    <div className="border border-ink/10 rounded-xl p-5 bg-cream">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-lg">{icon}</span>
          <h3 className="font-serif text-base text-ink mt-1">{title}</h3>
          <p className="text-xs text-ink/60 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-3 ${statusColor}`}>
        {status}
      </div>
    </div>
  )
}
