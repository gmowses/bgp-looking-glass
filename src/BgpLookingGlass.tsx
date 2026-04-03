import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Terminal, Copy, CheckCircle2 } from 'lucide-react'

const translations = {
  en: {
    title: 'BGP Looking Glass Reference',
    subtitle: 'Quick reference for BGP show commands across major network operating systems. Click any command to copy it.',
    copy: 'Copy',
    copied: 'Copied!',
    filterPlaceholder: 'Filter commands...',
    builtBy: 'Built by',
    references: 'References',
    refList: ['RFC 4271 – BGP-4', 'Cisco IOS Command Reference', 'Juniper JunOS CLI Guide', 'Huawei VRP Command Reference', 'FRRouting Documentation'],
  },
  pt: {
    title: 'Referencia BGP Looking Glass',
    subtitle: 'Referencia rapida de comandos BGP nos principais sistemas operacionais de rede. Clique em qualquer comando para copiar.',
    copy: 'Copiar',
    copied: 'Copiado!',
    filterPlaceholder: 'Filtrar comandos...',
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: ['RFC 4271 – BGP-4', 'Cisco IOS Command Reference', 'Juniper JunOS CLI Guide', 'Huawei VRP Command Reference', 'Documentacao FRRouting'],
  },
} as const

type Lang = keyof typeof translations

interface Command {
  label: string
  cmd: string
  output: string
}

interface Vendor {
  name: string
  color: string
  prompt: string
  commands: Command[]
}

const vendors: Vendor[] = [
  {
    name: 'Cisco IOS/IOS-XE',
    color: '#3b82f6',
    prompt: 'Router#',
    commands: [
      {
        label: 'BGP Summary',
        cmd: 'show bgp ipv4 unicast summary',
        output: `BGP router identifier 1.1.1.1, local AS number 65000
BGP table version is 150, main routing table version 150
Neighbor        V    AS MsgRcvd MsgSent TblVer InQ OutQ Up/Down State/PfxRcd
192.168.1.1     4 65001    1234    1200    150   0    0 1d02h     500
10.0.0.1        4 65002     890     880    150   0    0 5h30m     300`,
      },
      {
        label: 'BGP Neighbors Detail',
        cmd: 'show bgp ipv4 unicast neighbors 192.168.1.1',
        output: `BGP neighbor is 192.168.1.1, remote AS 65001, external link
  BGP state = Established, up for 1d02h
  Hold time is 90, keepalive interval is 30 seconds
  Neighbor capabilities: Route refresh: advertised and received
  Prefixes received: 500, Prefixes sent: 250`,
      },
      {
        label: 'BGP Prefix Detail',
        cmd: 'show bgp ipv4 unicast 8.8.8.0/24',
        output: `BGP routing table entry for 8.8.8.0/24, version 42
Paths: (1 available, best #1)
  Advertised to update-groups: 1
  65001 15169 from 192.168.1.1 (192.168.1.1)
    Origin IGP, metric 0, localpref 100, valid, external, best
    Community: 65000:100`,
      },
      {
        label: 'BGP Community Filter',
        cmd: 'show bgp ipv4 unicast community 65000:100',
        output: `   Network          Next Hop         Metric  LocPrf  Path
*> 8.8.8.0/24       192.168.1.1           0     100  65001 15169 i
*> 1.1.1.0/24       192.168.1.1           0     100  65001 13335 i`,
      },
      {
        label: 'Clear BGP Session',
        cmd: 'clear bgp ipv4 unicast 192.168.1.1 soft',
        output: '(session refreshed - no output)',
      },
      {
        label: 'BGP Table (all prefixes)',
        cmd: 'show bgp ipv4 unicast',
        output: `BGP table version is 150, local router ID is 1.1.1.1
Status codes: s suppressed, d damped, h history, * valid, > best, = multipath
   Network          Next Hop         Metric  LocPrf  Path
*> 0.0.0.0/0        10.0.0.1              0     100  65002 i
*> 8.8.8.0/24       192.168.1.1           0     100  65001 15169 i`,
      },
    ],
  },
  {
    name: 'Juniper JunOS',
    color: '#ef4444',
    prompt: 'user@router>',
    commands: [
      {
        label: 'BGP Summary',
        cmd: 'show bgp summary',
        output: `Groups: 2 Peers: 2 Down peers: 0
Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending
inet.0              1200        800          0          0          0          0
Peer          AS    InPkt  OutPkt OutQ Flaps    Last Up/Dwn State|#Active/Received/Accepted
192.168.1.1 65001    12034   11500    0     2       1d2h Establ inet.0: 500/500/500`,
      },
      {
        label: 'BGP Neighbors Detail',
        cmd: 'show bgp neighbor 192.168.1.1',
        output: `Peer: 192.168.1.1+179 AS 65001 Local: 192.168.1.2+52413 AS 65000
  Type: External    State: Established    Flags: <Sync>
  Last State: OpenConfirm  Last Event: RecvKeepAlive
  Holdtime: 90 Preference: 170
  Number of flaps: 2
  Active prefixes:              500`,
      },
      {
        label: 'BGP Prefix Detail',
        cmd: 'show route 8.8.8.0/24 detail',
        output: `inet.0: 800 destinations, 1200 routes (800 active, 0 holddown, 0 hidden)
8.8.8.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Next hop type: Router, Next hop index: 595
                AS path: 65001 15169 I
                Communities: 65000:100
                Localpref: 100
                Router ID: 192.168.1.1`,
      },
      {
        label: 'BGP Community Filter',
        cmd: 'show route community 65000:100',
        output: `inet.0: 800 destinations
8.8.8.0/24     *[BGP/170] 1d 02:00:00
                > to 192.168.1.1 via ge-0/0/0.0
1.1.1.0/24     *[BGP/170] 1d 02:00:00
                > to 192.168.1.1 via ge-0/0/0.0`,
      },
      {
        label: 'Clear BGP Session',
        cmd: 'clear bgp neighbor 192.168.1.1',
        output: '(session cleared)',
      },
      {
        label: 'BGP Paths for Prefix',
        cmd: 'show bgp 8.8.8.0/24',
        output: `Groups: 2 Peers: 2 Down peers: 0
8.8.8.0/24: 1 destinations, 1 routes
  Peer AS Path        Pref     MED   Lclpref   NextHop
* 192.168.1.1  65001 15169 I  170/0    -       100       192.168.1.1`,
      },
    ],
  },
  {
    name: 'Huawei VRP',
    color: '#10b981',
    prompt: '<Huawei>',
    commands: [
      {
        label: 'BGP Summary',
        cmd: 'display bgp ipv4 unicast summary',
        output: `BGP local router ID : 1.1.1.1
BGP local AS number : 65000
Total number of peers : 2         Peers in established state : 2
  Peer        V    AS    MsgRcvd   MsgSent  OutQ  Up/Down  State PrefRcv
  192.168.1.1 4 65001       1234      1200     0  1d02h Est      500
  10.0.0.1    4 65002        890       880     0  5h30m  Est      300`,
      },
      {
        label: 'BGP Neighbors Detail',
        cmd: 'display bgp ipv4 unicast peer 192.168.1.1 verbose',
        output: `BGP Peer is 192.168.1.1,  remote AS 65001
  Type: EBGP link
  BGP current state: Established, Up for 1d02h
  BGP current event: KATimerExpired
  Prefixes received: 500, Prefixes sent: 250`,
      },
      {
        label: 'BGP Prefix Detail',
        cmd: 'display bgp ipv4 unicast routing-table 8.8.8.0/24',
        output: `BGP local router ID : 1.1.1.1
BGP routing table entry information of 8.8.8.0/24:
From: 192.168.1.1 (192.168.1.1)
 Route Duration: 01h23m45s
 Original nexthop: 192.168.1.1
 AS-path: 65001 15169
 Origin: igp      MED: 0  LocalPref: 100
 Community: 65000:100`,
      },
      {
        label: 'BGP Community Filter',
        cmd: 'display bgp ipv4 unicast routing-table community 65000:100',
        output: `BGP Local router ID is 1.1.1.1
Network         NextHop       MED  LocPrf  PrefVal  Path/Ogn
8.8.8.0/24      192.168.1.1   0    100     0        65001 15169i
1.1.1.0/24      192.168.1.1   0    100     0        65001 13335i`,
      },
      {
        label: 'Clear BGP Session',
        cmd: 'reset bgp ipv4 unicast 192.168.1.1',
        output: '(session reset)',
      },
      {
        label: 'BGP Table',
        cmd: 'display bgp ipv4 unicast routing-table',
        output: `BGP Local router ID is 1.1.1.1
 Total Number of Routes: 800
 Network         NextHop       MED  LocPrf  PrefVal  Path/Ogn
*> 0.0.0.0/0     10.0.0.1      0    100     0        65002i
*> 8.8.8.0/24    192.168.1.1   0    100     0        65001 15169i`,
      },
    ],
  },
  {
    name: 'MikroTik RouterOS',
    color: '#f59e0b',
    prompt: '[admin@MikroTik]>',
    commands: [
      {
        label: 'BGP Summary',
        cmd: '/routing bgp session print',
        output: `Flags: E - established
 #   NAME                   REMOTE-ADDRESS      REMOTE-AS  LOCAL-AS  UPTIME       PREFIXES-RECEIVED
 0 E to-65001               192.168.1.1         65001      65000     1d2h         500
 1 E to-65002               10.0.0.1            65002      65000     5h30m        300`,
      },
      {
        label: 'BGP Peer Detail',
        cmd: '/routing bgp session print detail where remote-as=65001',
        output: `         name: to-65001
  remote-address: 192.168.1.1
    remote-port: 179
    remote-as: 65001
    local-as: 65000
    uptime: 1d2h
    state: established
    prefixes-received: 500`,
      },
      {
        label: 'BGP Routes',
        cmd: '/ip route print where bgp',
        output: `Flags: X - disabled, A - active, D - dynamic, C - connect, S - static, r - rip, b - bgp, o - ospf
 #      DST-ADDRESS        PREF-SRC  GATEWAY       DISTANCE
 0 ADb  8.8.8.0/24                   192.168.1.1     20
 1 ADb  1.1.1.0/24                   192.168.1.1     20`,
      },
      {
        label: 'BGP Prefix Detail',
        cmd: '/routing bgp advertisement print where prefix=8.8.8.0/24',
        output: `prefix: 8.8.8.0/24
as-path: 65001 15169
local-pref: 100
origin: igp`,
      },
      {
        label: 'Clear BGP Session',
        cmd: '/routing bgp session reset where name="to-65001"',
        output: '(session reset)',
      },
      {
        label: 'BGP Filter Rules',
        cmd: '/routing filter rule print',
        output: `Flags: X - disabled
 #    CHAIN       RULE
 0    bgp-in      if (bgp-path ~ "^65001") { accept }
 1    bgp-out     if (dst == 0.0.0.0/0) { reject }`,
      },
    ],
  },
  {
    name: 'FRRouting (FRR)',
    color: '#8b5cf6',
    prompt: 'router#',
    commands: [
      {
        label: 'BGP Summary',
        cmd: 'show bgp ipv4 unicast summary',
        output: `BGP router identifier 1.1.1.1, local AS number 65000 vrf-id 0
BGP table version 150
Neighbor        V         AS   MsgRcvd   MsgSent TblVer InQ OutQ   Up/Down State/PfxRcd
192.168.1.1     4      65001      1234      1200    150    0    0   01:23:45          500`,
      },
      {
        label: 'BGP Neighbors Detail',
        cmd: 'show bgp neighbors 192.168.1.1',
        output: `BGP neighbor is 192.168.1.1, remote AS 65001, local AS 65000, external link
 BGP state = Established, up for 01:23:45
 Neighbor capabilities:
   4 Byte AS: advertised and received
   Route refresh: advertised and received
 Prefixes received: 500`,
      },
      {
        label: 'BGP Prefix Detail',
        cmd: 'show bgp ipv4 unicast 8.8.8.0/24',
        output: `BGP routing table entry for 8.8.8.0/24
Paths: (1 available, best #1, table default)
  Advertised to non peer-group peers:
  192.168.1.2
  65001 15169
    192.168.1.1 from 192.168.1.1 (192.168.1.1)
      Origin IGP, metric 0, localpref 100, valid, external, best (First path received)
      Community: 65000:100`,
      },
      {
        label: 'BGP Community Filter',
        cmd: 'show bgp ipv4 unicast community 65000:100',
        output: `BGP table version is 150, local router ID is 1.1.1.1
*> 8.8.8.0/24       192.168.1.1       0    100 65001 15169 i
*> 1.1.1.0/24       192.168.1.1       0    100 65001 13335 i`,
      },
      {
        label: 'Clear BGP Session',
        cmd: 'clear bgp ipv4 unicast 192.168.1.1 soft',
        output: '(session soft-cleared)',
      },
      {
        label: 'BGP Running Config',
        cmd: 'show running-config | section bgp',
        output: `router bgp 65000
 bgp router-id 1.1.1.1
 neighbor 192.168.1.1 remote-as 65001
 neighbor 192.168.1.1 description upstream-provider
 !
 address-family ipv4 unicast
  neighbor 192.168.1.1 activate
  neighbor 192.168.1.1 route-map IN in
 exit-address-family`,
      },
    ],
  },
]

export default function BgpLookingGlass() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [activeVendor, setActiveVendor] = useState(0)
  const [filter, setFilter] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const vendor = vendors[activeVendor]
  const filtered = vendor.commands.filter(c =>
    c.label.toLowerCase().includes(filter.toLowerCase()) ||
    c.cmd.toLowerCase().includes(filter.toLowerCase())
  )

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="font-semibold">BGP Looking Glass</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/bgp-looking-glass" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Vendor tabs */}
          <div className="flex flex-wrap gap-2">
            {vendors.map((v, i) => (
              <button key={v.name} onClick={() => setActiveVendor(i)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={activeVendor === i ? { backgroundColor: `${v.color}20`, color: v.color, border: `1px solid ${v.color}40` } : { border: '1px solid', borderColor: 'rgb(228 228 231)', color: 'rgb(113 113 122)' }}>
                {v.name}
              </button>
            ))}
          </div>

          {/* Filter */}
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder={t.filterPlaceholder}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

          {/* Commands */}
          <div className="space-y-4">
            {filtered.map((cmd, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-semibold">{cmd.label}</span>
                  <button onClick={() => copy(cmd.cmd, `${i}-cmd`)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-green-500 transition-colors">
                    {copiedKey === `${i}-cmd` ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copiedKey === `${i}-cmd` ? t.copied : t.copy}
                  </button>
                </div>
                <div className="bg-zinc-950 dark:bg-black px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono text-zinc-500 shrink-0 pt-0.5">{vendor.prompt}</span>
                    <code className="text-sm font-mono break-all" style={{ color: vendor.color }}>{cmd.cmd}</code>
                  </div>
                </div>
                <div className="bg-zinc-900 dark:bg-zinc-950 px-4 py-3">
                  <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">{cmd.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-green-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
