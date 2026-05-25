import { useState, useEffect, useRef } from "react";

// ── Fonts ──────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');`;

// ── Design tokens ──────────────────────────────────────────────────
const T = {
  black:   "#000000",
  bg:      "#080808",
  surface: "#111111",
  card:    "#161616",
  border:  "#222222",
  border2: "#2a2a2a",
  white:   "#FFFFFF",
  grey1:   "#F5F5F5",
  grey2:   "#A0A0A0",
  grey3:   "#606060",
  grey4:   "#303030",
  accent:  "#FFFFFF",
  green:   "#4AFA7B",
  red:     "#FF4444",
  gold:    "#F0C060",
  blue:    "#60A0FF",
};

// ── Simulated live data ────────────────────────────────────────────
const useLivePrices = () => {
  const [prices, setPrices] = useState({ QQQ:481.45, NQ:21480, BTC:68420, SPY:534.2 });
  const [changes, setChanges] = useState({ QQQ:0, NQ:0, BTC:0, SPY:0 });
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(p => {
        const next = Object.fromEntries(
          Object.entries(p).map(([k,v]) => [k, +(v*(1+(Math.random()-0.5)*0.002)).toFixed(2)])
        );
        setChanges(Object.fromEntries(
          Object.entries(next).map(([k,v]) => [k, +((v - p[k])/p[k]*100).toFixed(3)])
        ));
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  return { prices, changes };
};

const useTime = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return time;
};

// ── Micro components ───────────────────────────────────────────────
const Dot = ({ color = T.green, pulse = false, size = 7 }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    borderRadius: "50%", background: color, flexShrink: 0,
    boxShadow: pulse ? `0 0 8px ${color}` : "none",
    animation: pulse ? "pulse 2s infinite" : "none",
  }} />
);

const Tag = ({ children, color = T.grey3 }) => (
  <span style={{
    fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.12em", padding: "2px 7px", borderRadius: 2,
    border: `1px solid ${color}30`, color,
    textTransform: "uppercase",
  }}>{children}</span>
);

const Divider = () => (
  <div style={{ height: 1, background: T.border, margin: "0" }} />
);

const StatBox = ({ label, value, sub, color = T.white, mono = true }) => (
  <div style={{ padding: "14px 16px" }}>
    <div style={{
      fontSize: 9, color: T.grey3, letterSpacing: "0.2em",
      textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
      marginBottom: 6,
    }}>{label}</div>
    <div style={{
      fontSize: 22, fontWeight: 700, color,
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Syne', sans-serif",
      letterSpacing: mono ? "-0.02em" : "0",
    }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: T.grey3, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 8, overflow: "hidden", ...style,
  }}>{children}</div>
);

const CardHeader = ({ label, right, accent = false }) => (
  <div style={{
    padding: "11px 16px", borderBottom: `1px solid ${T.border}`,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: accent ? `${T.white}04` : "transparent",
  }}>
    <span style={{
      fontSize: 9, letterSpacing: "0.25em", color: T.grey3,
      fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
    }}>{label}</span>
    {right && <span style={{ fontSize: 10, color: T.grey3 }}>{right}</span>}
  </div>
);

// ── Progress bar ───────────────────────────────────────────────────
const ProgressBar = ({ pct, color = T.white, height = 2 }) => (
  <div style={{ height, background: T.border, borderRadius: height }}>
    <div style={{
      height: "100%", width: `${Math.min(100,pct)}%`,
      background: color, borderRadius: height,
      transition: "width 0.6s ease",
    }} />
  </div>
);

// ── Trade row ──────────────────────────────────────────────────────
const TradeRow = ({ time, sport, game, result, pnl, entry, exit }) => {
  const pos = pnl >= 0;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "40px 50px 1fr 55px 60px",
      gap: 8, padding: "10px 16px", alignItems: "center",
      borderBottom: `1px solid ${T.border}`,
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ color: T.grey3, fontSize: 10 }}>{time}</span>
      <Tag color={sport==="NBA"?T.blue:sport==="SOCCER"?T.green:T.gold}>{sport}</Tag>
      <span style={{ color: T.grey2, fontSize: 10, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{game}</span>
      <span style={{ color: result==="WIN"?T.green:result==="LOSS"?T.red:T.grey3, fontSize: 10 }}>{result}</span>
      <span style={{ color: pos?T.green:T.red, textAlign: "right" }}>
        {pos?"+":""}{pnl.toFixed(2)}
      </span>
    </div>
  );
};

// ── Ticker ─────────────────────────────────────────────────────────
const Ticker = ({ prices, changes }) => (
  <div style={{
    display: "flex", gap: 0, overflowX: "auto",
    scrollbarWidth: "none", borderBottom: `1px solid ${T.border}`,
  }}>
    {Object.entries(prices).map(([sym, price], i) => {
      const up = changes[sym] >= 0;
      return (
        <div key={sym} style={{
          padding: "10px 18px", flexShrink: 0,
          borderRight: `1px solid ${T.border}`,
          borderLeft: i === 0 ? "none" : "none",
        }}>
          <div style={{
            fontSize: 9, color: T.grey3, letterSpacing: "0.15em",
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 3,
          }}>{sym}</div>
          <div style={{
            fontSize: 15, fontWeight: 600, color: T.white,
            fontFamily: "'JetBrains Mono', monospace",
          }}>${price.toLocaleString()}</div>
          <div style={{
            fontSize: 10, color: up ? T.green : T.red,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{up?"▲":"▼"} {Math.abs(changes[sym])}%</div>
        </div>
      );
    })}
  </div>
);

// ── TAB: OVERVIEW ──────────────────────────────────────────────────
function OverviewTab() {
  const [botActive] = useState(true);
  const [sportsActive] = useState(true);

  const BOTS = [
    { name: "NQ Trading Bot", status: "LIVE", platform: "Alpaca Paper", wr: 85, pnl: 1971, trades: 14, color: T.green },
    { name: "Sports Bot v4", status: "LIVE", platform: "All Sports", wr: 68, pnl: 247, trades: 31, color: T.blue },
  ];

  const PROP = { profit: 1971, target: 1500, dd: 187, maxDd: 1000 };
  const propPct = Math.min(100, Math.round(PROP.profit/PROP.target*100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Server status */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div style={{ padding: "14px 16px", borderRight: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, color: T.grey3, letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>SERVER</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Dot pulse color={T.green} />
              <span style={{ fontSize: 13, color: T.white, fontFamily: "'JetBrains Mono', monospace" }}>137.184.221.156</span>
            </div>
            <div style={{ fontSize: 10, color: T.grey3, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>NYC1 · 24/7 uptime</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: T.grey3, letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>BOTS RUNNING</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'JetBrains Mono', monospace" }}>2</div>
            <div style={{ fontSize: 10, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>All systems nominal</div>
          </div>
        </div>
      </Card>

      {/* Bot cards */}
      {BOTS.map((bot, i) => (
        <Card key={i}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{bot.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Dot color={bot.color} pulse size={6} />
                  <Tag color={bot.color}>{bot.status}</Tag>
                  <Tag>{bot.platform}</Tag>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: bot.pnl>=0?T.green:T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                  {bot.pnl>=0?"+":""}{bot.pnl.toFixed(0)}
                </div>
                <div style={{ fontSize: 9, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>USDC P&L</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["WIN RATE", bot.wr+"%", bot.wr>=75?T.green:T.gold], ["TRADES", bot.trades, T.white], ["STATUS", "PAPER", T.grey2]].map(([l,v,c]) => (
                <div key={l} style={{ background: T.surface, borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, color: T.grey3, letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {/* Prop firm */}
      <Card>
        <CardHeader label="Apex 25K EOD" right={`${propPct}% complete`} />
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.white, fontFamily: "'JetBrains Mono', monospace" }}>${PROP.profit.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>of ${PROP.target.toLocaleString()} target</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>✓ PASSED</div>
              <div style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>Request payout</div>
            </div>
          </div>
          <ProgressBar pct={propPct} color={T.green} height={3} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>DD used: ${PROP.dd}</span>
            <span style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>remaining: ${PROP.maxDd-PROP.dd}</span>
          </div>
        </div>
      </Card>

      {/* News alerts */}
      <Card>
        <CardHeader label="Red Folder Today" />
        {[
          { time:"08:30", event:"CPI YoY", status:"PASSED" },
          { time:"10:00", event:"ISM Manufacturing", status:"28min" },
          { time:"14:00", event:"FOMC Minutes", status:"4h 28m" },
        ].map((n,i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "10px 16px",
            borderBottom: i<2?`1px solid ${T.border}`:"none",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", minWidth: 38 }}>{n.time}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.status==="PASSED"?T.grey3:T.red, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: T.grey1, flex: 1 }}>{n.event}</span>
            <Tag color={n.status==="PASSED"?T.grey3:T.red}>{n.status}</Tag>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: NQ BOT ────────────────────────────────────────────────────
function NQBotTab() {
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setScanning(true);
      setTimeout(() => setScanning(false), 1500);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const TRADES = [
    { time:"09:38", dir:"LONG", entry:481.20, sl:480.85, tp:482.10, rr:"2.3R", pnl:847, status:"WIN" },
    { time:"09:52", dir:"SHORT", entry:482.35, sl:482.70, tp:481.25, rr:"3.1R", pnl:1124, status:"WIN" },
    { time:"10:15", dir:"LONG", entry:481.90, sl:481.55, tp:482.55, rr:"1.8R", pnl:0, status:"BE" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Status */}
      <Card>
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Syne', sans-serif" }}>NQ Trading Bot</div>
              <div style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>Alpaca Paper · QQQ proxy</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Dot color={scanning?T.gold:T.green} pulse size={8} />
              <span style={{ fontSize: 10, color: scanning?T.gold:T.green, fontFamily: "'JetBrains Mono', monospace" }}>
                {scanning?"SCANNING":"IDLE"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              ["WIN RATE","85%",T.green],
              ["TODAY P&L","$1,971",T.green],
              ["W/L/BE","2/0/1",T.white],
              ["RISK","1%",T.grey2],
            ].map(([l,v,c]) => (
              <div key={l} style={{ background: T.surface, borderRadius: 6, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: T.grey3, letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Strategy rules */}
      <Card>
        <CardHeader label="Strategy Rules Active" />
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Skip Monday","ON",T.green],
            ["News Filter 5min","ON",T.green],
            ["Min RR 1.0","ON",T.green],
            ["Liquidity TP","ON",T.green],
            ["Smart SL","OFF",T.grey3],
            ["1 Trade/Day","ON",T.green],
          ].map(([rule, status, color]) => (
            <div key={rule} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.grey2 }}>{rule}</span>
              <Tag color={color}>{status}</Tag>
            </div>
          ))}
        </div>
      </Card>

      {/* Trade log */}
      <Card>
        <CardHeader label="Today's Trades" right="NY Session" />
        <div style={{
          display: "grid", gridTemplateColumns: "45px 55px 1fr 45px 65px",
          gap: 8, padding: "8px 16px 6px",
          fontSize: 8, color: T.grey3, letterSpacing: "0.1em",
          fontFamily: "'JetBrains Mono', monospace",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span>TIME</span><span>DIR</span><span>ENTRY→TP</span><span>RR</span><span style={{textAlign:"right"}}>P&L</span>
        </div>
        {TRADES.map((t,i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "45px 55px 1fr 45px 65px",
            gap: 8, padding: "10px 16px", alignItems: "center",
            borderBottom: i<TRADES.length-1?`1px solid ${T.border}`:"none",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ fontSize: 10, color: T.grey3 }}>{t.time}</span>
            <Tag color={t.dir==="LONG"?T.green:T.red}>{t.dir}</Tag>
            <span style={{ fontSize: 10, color: T.grey2 }}>{t.entry}→{t.tp}</span>
            <span style={{ fontSize: 10, color: T.gold }}>{t.rr}</span>
            <span style={{ fontSize: 11, color: t.status==="WIN"?T.green:t.status==="LOSS"?T.red:T.grey3, textAlign:"right", fontWeight:600 }}>
              {t.pnl===0?"BE":t.pnl>0?"+$"+t.pnl:"-$"+Math.abs(t.pnl)}
            </span>
          </div>
        ))}
      </Card>

      {/* Prop firm */}
      <Card>
        <CardHeader label="Apex 25K EOD Progress" />
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.grey2, fontFamily: "'JetBrains Mono', monospace" }}>$1,971 / $1,500 target</span>
            <span style={{ fontSize: 11, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>131%</span>
          </div>
          <ProgressBar pct={131} color={T.green} height={3} />
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: T.surface, borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>DD USED</div>
              <div style={{ fontSize: 13, color: T.white, fontFamily: "'JetBrains Mono', monospace" }}>$187</div>
            </div>
            <div style={{ flex: 1, background: T.surface, borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>DD LEFT</div>
              <div style={{ fontSize: 13, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>$813</div>
            </div>
            <div style={{ flex: 1, background: T.surface, borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>PAYOUT</div>
              <div style={{ fontSize: 13, color: T.gold, fontFamily: "'JetBrains Mono', monospace" }}>READY</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── TAB: SPORTS BOT ────────────────────────────────────────────────
function SportsBotTab() {
  const SPORT_STATS = [
    { sport:"NBA", trades:14, wr:71, pnl:142, status:"No games", color:T.blue },
    { sport:"NFL", trades:8,  wr:62, pnl:68,  status:"Off season", color:T.gold },
    { sport:"SOCCER", trades:9, wr:77, pnl:89, status:"EPL active", color:T.green },
    { sport:"MLB", trades:6, wr:66, pnl:31, status:"Live games", color:T.grey2 },
    { sport:"NHL", trades:4, wr:75, pnl:24, status:"Playoffs", color:T.blue },
    { sport:"UFC", trades:2, wr:50, pnl:-7, status:"Weekend only", color:T.red },
  ];

  const RECENT = [
    { time:"03:21", sport:"NBA", game:"OKC@SAS", result:"SKIP", pnl:0, entry:0.08, exit:0 },
    { time:"02:58", sport:"SOCCER", game:"ARS@CHE", result:"WIN", pnl:14.20, entry:0.38, exit:0.44 },
    { time:"02:31", sport:"MLB", game:"NYY@BOS", result:"LOSS", pnl:-8.50, entry:0.42, exit:0.37 },
    { time:"01:47", sport:"NBA", game:"BOS@MIA", result:"WIN", pnl:19.80, entry:0.35, exit:0.43 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Server status */}
      <Card>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Syne', sans-serif" }}>Sports Bot v4</div>
              <div style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>screen 5151.allsports · NYC1</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <Dot color={T.green} pulse size={7} />
                <span style={{ fontSize: 11, color: T.green, fontFamily: "'JetBrains Mono', monospace" }}>RUNNING</span>
              </div>
              <div style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>Last scan: 42s ago</div>
            </div>
          </div>
        </div>
        <Divider />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[["BANKROLL","$500"],["TRADES","43"],["WIN RATE","68%"]].map(([l,v],i) => (
            <div key={l} style={{ padding: "12px 16px", borderRight: i<2?`1px solid ${T.border}`:"none" }}>
              <div style={{ fontSize: 8, color: T.grey3, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Per sport breakdown */}
      <Card>
        <CardHeader label="By Sport" right="Real data" />
        {SPORT_STATS.map((s, i) => (
          <div key={s.sport} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 16px",
            borderBottom: i<SPORT_STATS.length-1?`1px solid ${T.border}`:"none",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: T.surface,
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dot color={s.color} size={8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white, fontFamily: "'Syne', sans-serif" }}>{s.sport}</span>
                <span style={{ fontSize: 11, color: s.pnl>=0?T.green:T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.pnl>=0?"+":""}{s.pnl.toFixed(0)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: T.grey3, fontFamily: "'JetBrains Mono', monospace" }}>{s.trades}t · {s.wr}% WR · {s.status}</span>
                <div style={{ width: 50, height: 2, background: T.border, borderRadius: 1 }}>
                  <div style={{ height: "100%", width: `${s.wr}%`, background: s.color, borderRadius: 1 }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Recent trades */}
      <Card>
        <CardHeader label="Recent Activity" />
        <div style={{
          display: "grid", gridTemplateColumns: "40px 60px 1fr 50px 60px",
          gap: 8, padding: "7px 16px",
          fontSize: 8, color: T.grey3, letterSpacing: "0.1em",
          fontFamily: "'JetBrains Mono', monospace",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span>TIME</span><span>SPORT</span><span>GAME</span><span>RESULT</span><span style={{textAlign:"right"}}>P&L</span>
        </div>
        {RECENT.map((t,i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "40px 60px 1fr 50px 60px",
            gap: 8, padding: "10px 16px", alignItems: "center",
            borderBottom: i<RECENT.length-1?`1px solid ${T.border}`:"none",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ fontSize: 10, color: T.grey3 }}>{t.time}</span>
            <Tag color={t.sport==="NBA"?T.blue:t.sport==="SOCCER"?T.green:T.gold}>{t.sport}</Tag>
            <span style={{ fontSize: 10, color: T.grey2 }}>{t.game}</span>
            <Tag color={t.result==="WIN"?T.green:t.result==="LOSS"?T.red:T.grey3}>{t.result}</Tag>
            <span style={{ fontSize: 11, color: t.pnl>0?T.green:t.pnl<0?T.red:T.grey3, textAlign:"right" }}>
              {t.pnl===0?"—":t.pnl>0?"+$"+t.pnl.toFixed(2):"−$"+Math.abs(t.pnl).toFixed(2)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: AI + OBSIDIAN ─────────────────────────────────────────────
function AITab() {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Good morning. NQ bot: 2 wins today, $1,971 P&L — Apex target passed. Sports bot running on server. What do you need?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(m => [...m, { role:"user", content:msg }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are an integrated AI assistant for a futures trader using PB Trading Theory on NQ futures. 
                  Context: Apex 25K EOD prop firm account (target passed at $1,971), Alpaca paper trading bot running, 
                  Polymarket sports bot running on DigitalOcean server (137.184.221.156), 
                  all strategies backtested 85%+ win rate. Be concise, direct, and actionable.`,
          messages: messages.concat([{role:"user",content:msg}]).map(m=>({role:m.role,content:m.content})),
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role:"assistant", content:data.content?.[0]?.text || "Connect API key for live responses." }]);
    } catch {
      setMessages(m => [...m, { role:"assistant", content:"Live AI ready — add Claude API key to enable." }]);
    }
    setLoading(false);
  };

  const NOTES = [
    { title:"PB Trading — Session Notes", tag:"trading", words:847, modified:"2m ago" },
    { title:"Market Structure — FVG Thesis", tag:"research", words:2891, modified:"Yesterday" },
    { title:"Bot Development Progress", tag:"coding", words:1204, modified:"3h ago" },
    { title:"Weekly Goals & Review", tag:"goals", words:423, modified:"1h ago" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* AI Chat */}
      <Card style={{ display:"flex", flexDirection:"column", height:340 }}>
        <CardHeader label="AI Assistant" right="Claude" />
        <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:8, scrollbarWidth:"none" }}>
          {messages.map((m,i) => (
            <div key={i} style={{
              padding:"10px 12px", borderRadius:6, fontSize:12, lineHeight:1.6,
              maxWidth:"88%", fontFamily:"'JetBrains Mono', monospace",
              ...(m.role==="user"
                ? { background:T.surface, border:`1px solid ${T.border2}`, color:T.grey1, alignSelf:"flex-end" }
                : { background:"transparent", border:`1px solid ${T.border}`, color:T.grey2, alignSelf:"flex-start" }
              ),
            }}>{m.content}</div>
          ))}
          {loading && (
            <div style={{ padding:"10px 12px", borderRadius:6, fontSize:12, color:T.grey3,
                          fontFamily:"'JetBrains Mono', monospace", border:`1px solid ${T.border}`, alignSelf:"flex-start" }}>
              thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8 }}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Ask anything..."
            style={{
              flex:1, background:"transparent", border:`1px solid ${T.border2}`,
              borderRadius:5, padding:"8px 12px", color:T.white, fontSize:12,
              fontFamily:"'JetBrains Mono', monospace", outline:"none",
            }}
          />
          <button onClick={send} disabled={loading} style={{
            background:T.white, border:"none", borderRadius:5,
            padding:"0 14px", cursor:"pointer", fontSize:11,
            fontFamily:"'JetBrains Mono', monospace", color:T.black, fontWeight:600,
            opacity:loading?0.5:1,
          }}>→</button>
        </div>
      </Card>

      {/* Obsidian */}
      <Card>
        <CardHeader label="Obsidian Vault" right="847 notes" />
        {NOTES.map((n,i) => (
          <div key={i} style={{
            padding:"11px 16px",
            borderBottom:i<NOTES.length-1?`1px solid ${T.border}`:"none",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:T.grey1, fontFamily:"'Syne', sans-serif", fontWeight:500 }}>{n.title}</span>
              <span style={{ fontSize:10, color:T.grey3, fontFamily:"'JetBrains Mono', monospace" }}>{n.modified}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <Tag color={T.grey3}>#{n.tag}</Tag>
              <span style={{ fontSize:9, color:T.grey4, fontFamily:"'JetBrains Mono', monospace", display:"flex", alignItems:"center" }}>{n.words}w</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: HABITS ────────────────────────────────────────────────────
function HabitsTab() {
  const [habits, setHabits] = useState([
    { name:"Morning session review", done:true, streak:12, icon:"◎" },
    { name:"Trading journal entry", done:true, streak:8, icon:"◎" },
    { name:"Exercise", done:false, streak:5, icon:"○" },
    { name:"Read 30 min", done:true, streak:21, icon:"◎" },
    { name:"Meditate", done:false, streak:3, icon:"○" },
    { name:"Cold shower", done:true, streak:7, icon:"◎" },
    { name:"Review bot P&L", done:true, streak:4, icon:"◎" },
    { name:"No phone before 8am", done:false, streak:2, icon:"○" },
  ]);

  const toggle = i => setHabits(h => h.map((item,idx) => idx===i?{...item,done:!item.done}:item));
  const done = habits.filter(h=>h.done).length;
  const pct = Math.round(done/habits.length*100);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* Progress */}
      <Card>
        <div style={{ padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:T.white, fontFamily:"'Syne', sans-serif" }}>Daily Stack</div>
              <div style={{ fontSize:10, color:T.grey3, fontFamily:"'JetBrains Mono', monospace", marginTop:2 }}>
                {done}/{habits.length} complete
              </div>
            </div>
            <div style={{ fontSize:32, fontWeight:800, color:pct===100?T.green:T.white, fontFamily:"'Syne', sans-serif" }}>
              {pct}%
            </div>
          </div>
          <ProgressBar pct={pct} color={pct===100?T.green:T.white} height={2} />
        </div>
      </Card>

      {/* Habits list */}
      <Card>
        {habits.map((h,i) => (
          <div
            key={i}
            onClick={()=>toggle(i)}
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"13px 16px", cursor:"pointer",
              borderBottom:i<habits.length-1?`1px solid ${T.border}`:"none",
              background:h.done?`${T.white}03`:"transparent",
              transition:"background 0.15s",
            }}
          >
            <div style={{
              width:20, height:20, borderRadius:4, flexShrink:0,
              border:`1.5px solid ${h.done?T.white:T.border2}`,
              background:h.done?T.white:"transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.15s",
            }}>
              {h.done && <span style={{ fontSize:11, color:T.black, fontWeight:900 }}>✓</span>}
            </div>
            <span style={{
              fontSize:13, flex:1, color:h.done?T.grey3:T.grey1,
              textDecoration:h.done?"line-through":"none",
              fontFamily:"'Syne', sans-serif",
              transition:"all 0.15s",
            }}>{h.name}</span>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:10, color:h.streak>=10?T.gold:T.grey3, fontFamily:"'JetBrains Mono', monospace" }}>
                {h.streak}
              </span>
              <span style={{ fontSize:9, color:T.grey4 }}>streak</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Weekly summary */}
      <Card>
        <CardHeader label="This Week" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, padding:"14px 16px" }}>
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, color:T.grey3, fontFamily:"'JetBrains Mono', monospace", marginBottom:6 }}>{d}</div>
              <div style={{
                height:28, borderRadius:4,
                background:i<5?T.white:i===5?`${T.white}40`:T.border2,
              }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────
const TABS = [
  { id:"overview", label:"Overview" },
  { id:"nq",       label:"NQ Bot" },
  { id:"sports",   label:"Sports Bot" },
  { id:"ai",       label:"AI" },
  { id:"habits",   label:"Habits" },
];

export default function CommandCenter() {
  const [tab, setTab] = useState("overview");
  const { prices, changes } = useLivePrices();
  const time = useTime();

  const etTime = time.toLocaleTimeString("en-US", {
    timeZone:"America/New_York", hour12:false,
    hour:"2-digit", minute:"2-digit", second:"2-digit",
  });
  const etHour = parseInt(etTime.split(":")[0]);
  const sessionActive = etHour >= 9 && etHour < 11;

  return (
    <>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: ${T.bg}; }
        ::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        input::placeholder { color: ${T.grey4}; }
      `}</style>

      <div style={{
        minHeight:"100vh", background:T.bg, color:T.white,
        fontFamily:"'Syne', sans-serif",
        maxWidth:480, margin:"0 auto",
        display:"flex", flexDirection:"column",
      }}>

        {/* Header */}
        <div style={{
          background:T.black, borderBottom:`1px solid ${T.border}`,
          padding:"14px 16px 0",
          position:"sticky", top:0, zIndex:100,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", color:T.white }}>
                COMMAND CENTER
              </div>
              <div style={{ fontSize:9, color:T.grey3, letterSpacing:"0.2em", fontFamily:"'JetBrains Mono', monospace", marginTop:2 }}>
                {etTime} ET · {sessionActive?"SESSION LIVE":"SESSION CLOSED"}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Dot color={sessionActive?T.green:T.grey3} pulse={sessionActive} size={7} />
              <span style={{ fontSize:10, color:sessionActive?T.green:T.grey3, fontFamily:"'JetBrains Mono', monospace" }}>
                2 BOTS
              </span>
            </div>
          </div>

          {/* Ticker */}
          <div style={{ margin:"0 -16px", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, display:"flex", overflowX:"auto" }}>
            {Object.entries(prices).map(([sym,price],i) => {
              const up=changes[sym]>=0;
              return (
                <div key={sym} style={{ padding:"8px 14px", flexShrink:0, borderRight:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:8, color:T.grey3, fontFamily:"'JetBrains Mono', monospace", letterSpacing:"0.1em" }}>{sym}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.white, fontFamily:"'JetBrains Mono', monospace" }}>${price.toLocaleString()}</div>
                  <div style={{ fontSize:9, color:up?T.green:T.red, fontFamily:"'JetBrains Mono', monospace" }}>{up?"↑":"↓"}{Math.abs(changes[sym])}%</div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, margin:"0 -16px" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={()=>setTab(t.id)}
                style={{
                  flex:1, padding:"10px 4px", border:"none",
                  background:"transparent",
                  borderBottom:`2px solid ${tab===t.id?T.white:"transparent"}`,
                  color:tab===t.id?T.white:T.grey3,
                  fontSize:10, fontFamily:"'JetBrains Mono', monospace",
                  letterSpacing:"0.05em", cursor:"pointer",
                  transition:"all 0.15s",
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:"14px 16px 32px", overflowY:"auto" }}>
          {tab==="overview" && <OverviewTab />}
          {tab==="nq"       && <NQBotTab />}
          {tab==="sports"   && <SportsBotTab />}
          {tab==="ai"       && <AITab />}
          {tab==="habits"   && <HabitsTab />}
        </div>
      </div>
    </>
  );
}
