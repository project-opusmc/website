import {useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode} from 'react';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Download, ExternalLink, Heart, LockKeyhole, LogOut, Menu, Minus, Monitor, Search, ShoppingBag, SlidersHorizontal, UserRound, X} from 'lucide-react';
import {journal, features, products, type StoreProduct} from './data';
import './styles.css';
import './approved-web.css';

type Route = '/' | '/download' | '/features' | '/store' | '/premium' | '/journal' | '/account';
type Member = {id: number; username: string; email: string; plan: string; createdAt: string};
type APIError = {error?: string; message?: string};

const mainNavigation: {label: string; href: Route}[] = [
  {label: 'Discover', href: '/'},
  {label: 'Features', href: '/features'},
  {label: 'Store', href: '/store'},
  {label: 'Premium', href: '/premium'},
  {label: 'Journal', href: '/journal'},
];

const plans = [
  {name:'Opus Free', tone:'base', overline:'THE ESSENTIALS', description:'Everything you need to find your rhythm.', benefits:['Client & launcher access','Core interface modules','Performance and quality-of-life controls','Essential personalization'], status:'Foundation'},
  {name:'Aether', tone:'aether', overline:'BEYOND THE BASICS', description:'A more personal Opus experience.', benefits:['Everything in Opus Free','Expanded customization tools','Premium profile identity','Additional experiences as released'], status:'Planned tier'},
  {name:'Elysium', tone:'elysium', overline:'THE COMPLETE EXPERIENCE', description:'Built for those who want every detail.', benefits:['Everything in Aether','Expanded creative experiences','Priority access to future features','Premium identity and personalization'], status:'Planned tier'},
] as const;

const downloadOptions = [
  {key:'windows',label:'Windows',subtitle:'Windows 10 / 11',detail:'Windows desktop launcher',url:import.meta.env.VITE_DOWNLOAD_WINDOWS_URL || ''},
  {key:'macos',label:'macOS',subtitle:'Apple Silicon / Intel',detail:'macOS desktop launcher',url:import.meta.env.VITE_DOWNLOAD_MACOS_URL || ''},
  {key:'linux',label:'Linux',subtitle:'Desktop Linux',detail:'Linux desktop launcher',url:import.meta.env.VITE_DOWNLOAD_LINUX_URL || ''},
];

function pathNow() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function readSaved(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

async function api<T>(endpoint: string, method: string = 'GET', payload?: unknown): Promise<T> {
  const response = await fetch(endpoint, {
    method,
    credentials:'same-origin',
    headers: payload === undefined ? undefined : {'Content-Type':'application/json'},
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const result = await response.json() as T & APIError;
  if (!response.ok) throw new Error(result.error || result.message || 'Unable to complete your request.');
  return result;
}

function Brand({go,compact=false}: {go:(path:string)=>void;compact?:boolean}) {
  return <a href="/" className={'brand' + (compact ? ' brand-compact' : '')} aria-label="Opus Client — Home" onClick={event=>{event.preventDefault();go('/');}}>
    <img src="/brand/opus.svg" alt="" />
    <span>OPUS<span className="brand-dot">.</span></span>
  </a>;
}

function LinkTo({href,go,children,className='',onClick}: {href:string;go:(path:string)=>void;children:ReactNode;className?:string;onClick?:()=>void}) {
  return <a href={href} className={className} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();onClick?.();go(href);}}>{children}</a>;
}

function PageIntro({index,kicker,title,description}: {index:string;kicker:string;title:string;description:string}) {
  return <header className="page-intro reveal">
    <span className="page-index">{index} / OPUS CLIENT</span>
    <span className="page-intro-copy"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{description}</p></span>
  </header>;
}

function SiteHeader({go,path,cartCount,openCart,member}: {go:(path:string)=>void;path:string;cartCount:number;openCart:()=>void;member:Member|null}) {
  const [open,setOpen]=useState(false);
  useEffect(()=>setOpen(false),[path]);
  return <header className="site-header">
    <span className="header-inner">
      <Brand go={go}/>
      <nav className={'primary-navigation' + (open ? ' is-open':'')} aria-label="Primary navigation">
        {mainNavigation.map(item=><LinkTo key={item.href} href={item.href} go={go} className={'nav-link'+(path===item.href?' is-current':'')}>{item.label}</LinkTo>)}
        <LinkTo href="/download" go={go} className="mobile-download">Download <ArrowUpRight size={15}/></LinkTo>
      </nav>
      <span className="header-actions">
        <button className="header-icon" type="button" aria-label={'Shopping bag, '+cartCount+' items'} onClick={openCart}><ShoppingBag size={18}/>{cartCount>0&&<span className="cart-count">{cartCount}</span>}</button>
        <LinkTo href="/account" go={go} className={'header-icon header-account'+(path==='/account'?' is-current':'')}><UserRound size={18}/><span>{member?member.username:'Account'}</span></LinkTo>
        <LinkTo href="/download" go={go} className="header-download">Download <ArrowUpRight size={16}/></LinkTo>
        <button className="menu-button" type="button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?<X size={23}/>:<Menu size={23}/>}</button>
      </span>
    </span>
  </header>;
}

function SiteFooter({go,openWaitlist}: {go:(path:string)=>void;openWaitlist:(interest:string)=>void}) {
  return <footer className="site-footer">
    <span className="footer-top">
      <span className="footer-callout"><span className="eyebrow">THERE IS MORE TO COME</span><strong>Stay in<br/>the loop<span className="punctuation">.</span></strong><button type="button" className="text-action" onClick={()=>openWaitlist('Product updates')}>Get product updates <ArrowUpRight size={18}/></button></span>
      <span className="footer-columns">
        <span className="footer-column"><b>Explore</b><LinkTo href="/" go={go}>Home</LinkTo><LinkTo href="/features" go={go}>Features</LinkTo><LinkTo href="/download" go={go}>Download</LinkTo><LinkTo href="/journal" go={go}>Journal</LinkTo></span>
        <span className="footer-column"><b>Opus</b><LinkTo href="/premium" go={go}>Premium</LinkTo><LinkTo href="/store" go={go}>Store</LinkTo><LinkTo href="/account" go={go}>Account</LinkTo><a href="https://github.com/project-opusmc" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12}/></a></span>
        <span className="footer-column"><b>Community</b><a href="https://discord.opusmc.com" target="_blank" rel="noreferrer">Discord <ArrowUpRight size={12}/></a><button onClick={()=>openWaitlist('Product updates')}>Updates <ArrowUpRight size={12}/></button><a href="https://github.com/project-opusmc/website" target="_blank" rel="noreferrer">Website source <ArrowUpRight size={12}/></a></span>
      </span>
    </span>
    <span className="footer-bottom"><Brand go={go} compact/><span>© {new Date().getFullYear()} OPUS CLIENT. INDEPENDENTLY BUILT.</span><span>NOT AFFILIATED WITH MOJANG OR MICROSOFT.</span><a href="#top" onClick={event=>{event.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}}>BACK TO TOP ↑</a></span>
  </footer>;
}


function SceneVideo({src,poster,type='video/mp4'}:{src:string;poster:string;type?:string}){
  const ref=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const video=ref.current;
    if(!video)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=true;
    const sync=()=>{
      if(visible&&!document.hidden&&!motion.matches)void video.play().catch(()=>undefined);
      else video.pause();
    };
    const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync();},{threshold:.12});
    observer.observe(video);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',sync);
    sync();
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);video.pause();};
  },[]);
  return <video ref={ref} className="scene-video" muted loop playsInline preload="metadata" poster={poster} aria-hidden="true"><source src={src} type={type}/></video>;
}

function Hero({go}:{go:(path:string)=>void}){
  return <section className="hero hero-current" aria-label="Introduction to Opus Client">
    <SceneVideo src="/media/launcher-miyabi.mp4" poster="/media/launcher-miyabi-poster.jpg"/>
    <span className="hero-curtain" aria-hidden="true"/>
    <span className="hero-current-content">
      <span className="hero-current-top"><span>OPUS CLIENT <span className="hero-separator">/</span> AN INDEPENDENT MINECRAFT CLIENT</span><span className="hero-current-index">01 / INTRODUCING OPUS</span></span>
      <span className="hero-current-center">
        <span className="hero-current-kicker"><span className="status-pip"/> CURRENTLY IN DEVELOPMENT</span>
        <h1>Opus<br/><em>Client.</em></h1>
        <p className="hero-current-signature">THE EIDOS OF APEIRON.</p>
        <p className="hero-current-description">One connected experience, from launcher to game. Made for Minecraft. Built around the way you play.</p>
        <span className="hero-current-buttons"><LinkTo href="/features" go={go} className="hero-main-action">Discover Opus <ArrowUpRight size={18}/></LinkTo><LinkTo href="/journal" go={go} className="hero-secondary-action">Read the journal <ArrowUpRight size={16}/></LinkTo></span>
      </span>
      <span className="hero-current-bottom"><span>OPUS / A DIFFERENT KIND OF CLIENT</span><span>SCROLL TO EXPLORE <ArrowDown size={14}/></span></span>
    </span>
    <LinkTo href="/download" go={go} className="hero-notch"><span className="notch-icon"><Download size={23}/></span><span><b>Get Opus Client</b><small>Launcher &amp; downloads</small></span><ArrowUpRight className="notch-arrow" size={18}/></LinkTo>
  </section>;
}

function Home({go,openWaitlist}:{go:(path:string)=>void;openWaitlist:(interest:string)=>void}){
  return <>
    <Hero go={go}/>
    <section className="home-intro content-width">
      <span className="section-ordinal"><span>01</span><span>WHAT IS OPUS?</span></span>
      <span className="home-intro-core"><h2>The interface belongs<br/>to <em>the experience.</em></h2><p>Opus Client brings its own launcher, in-game interface and everyday tools together. Every control has a place. Every transition has a purpose.</p></span>
      <LinkTo href="/features" go={go} className="inline-link">Explore the features <ArrowUpRight size={16}/></LinkTo>
    </section>
    <section className="product-panels content-width" aria-label="Client and launcher preview">
      <article className="product-panel">
        <span className="product-panel-media product-panel-media-launcher"><img src="/previews/launcher-home.png" alt="Opus Launcher current approved design, captured from the active React interface" loading="lazy"/><span className="media-corner-label">FIG. 01 <span>/</span> LAUNCHER</span></span>
        <span className="product-panel-copy"><span className="eyebrow">THE DESKTOP LAUNCHER</span><h3>Before you play.</h3><p>Accounts, installation, settings and your next launch. A dedicated space for everything before Minecraft opens.</p><LinkTo href="/download" go={go} className="inline-link">About the launcher <ArrowUpRight size={16}/></LinkTo></span>
      </article>
      <article className="product-panel">
        <span className="product-panel-media product-panel-media-client"><img src="/previews/client-home.png" alt="Current approved Opus Client main menu, captured directly from the active React interface" loading="lazy"/><span className="media-corner-label">FIG. 02 <span>/</span> CLIENT</span></span>
        <span className="product-panel-copy"><span className="eyebrow">THE IN-GAME EXPERIENCE</span><h3>Once you're there.</h3><p>A game-facing interface for your worlds, servers, modules and controls. The experience stays consistent wherever you are.</p><LinkTo href="/features" go={go} className="inline-link">Client features <ArrowUpRight size={16}/></LinkTo></span>
      </article>
    </section>
    <section className="home-feature-section content-width">
      <span className="section-ordinal"><span>02</span><span>BUILT INTO THE CLIENT</span></span>
      <span className="section-heading"><span className="eyebrow">UNDER YOUR CONTROL</span><h2>The tools you need.<br/><em>Nothing in the way.</em></h2><LinkTo href="/features" go={go} className="inline-link">View all features <ArrowUpRight size={16}/></LinkTo></span>
      <div className="feature-editorial">
        <span className="feature-editorial-media"><img src="/previews/client-control-center.png" alt="Approved Opus module and HUD interface captured from the current source" loading="lazy"/><span className="media-corner-label">FIG. 03 <span>/</span> MODULE SETTINGS</span></span>
        <span className="feature-editorial-side"><span className="eyebrow">YOUR INTERFACE, YOUR RULES</span><h3>Fine-tuned for the everyday.</h3><p>HUD information, movement controls and configurable modules. Built directly into the Opus experience.</p><span className="feature-editorial-list"><span><b>01</b> Keystrokes &amp; FPS</span><span><b>02</b> Toggle Movement</span><span><b>03</b> Armor Status</span><span><b>04</b> Chat &amp; Lighting</span></span><LinkTo href="/features" go={go} className="inline-link">Explore modules <ArrowUpRight size={16}/></LinkTo></span>
      </div>
    </section>
    <section className="home-philosophy content-width"><span className="section-ordinal"><span>03</span><span>DESIGN LANGUAGE</span></span><span className="home-philosophy-content"><span className="eyebrow">A COHERENT PRODUCT</span><h2>Designed to feel<br/><em>like Opus.</em></h2><p>Quiet materials. Precise joins. Deliberate motion. The launcher, client and website share one visual identity, without unnecessary glow or visual noise.</p></span><span className="philosophy-mark"><img src="/brand/opus.svg" alt=""/></span></section>
    <section className="premium-home content-width">
      <span className="premium-home-copy"><span className="eyebrow">04 / MEMBERSHIP</span><span className="edition-type">OPUS <i>PREMIUM</i></span><h2>Every detail,<br/>your own.</h2><p>Aether and Elysium are planned ways to take your Opus experience further. Explore the membership preview.</p><LinkTo href="/premium" go={go} className="button-light">Explore premium <ArrowUpRight size={17}/></LinkTo></span>
      <span className="premium-home-symbol"><img src="/brand/opus.svg" alt=""/></span>
      <span className="premium-home-footer"><span>AETHER / ELYSIUM</span><span>PLANNED MEMBERSHIP TIERS</span></span>
    </section>
    <section className="journal-preview content-width">
      <span className="section-ordinal"><span>05</span><span>FROM THE STUDIO</span></span>
      <span className="section-heading"><span className="eyebrow">THE OPUS JOURNAL</span><h2>Notes from<br/>the inside.</h2><LinkTo href="/journal" go={go} className="inline-link">All entries <ArrowUpRight size={16}/></LinkTo></span>
      <span className="journal-preview-grid">{journal.map((entry,index)=><LinkTo key={entry.slug} href={'/journal/'+entry.slug} go={go} className="journal-preview-card"><span className={'journal-art journal-art-'+index}><img src={index===0?'/media/client-tsundere-poster.jpg':index===1?'/previews/launcher-home.png':'/previews/client-control-center.png'} alt="" loading="lazy"/></span><span className="journal-meta">{entry.eyebrow}<span>{entry.readingTime}</span></span><h3>{entry.title}</h3><p>{entry.excerpt}</p><ArrowUpRight size={18}/></LinkTo>)}</span>
    </section>
    <section className="final-cta content-width"><span><span className="eyebrow">START WITH OPUS</span><h2>Everything starts<br/>with a click.</h2></span><span className="final-actions"><LinkTo href="/download" go={go} className="button-light">Explore downloads <ArrowUpRight size={17}/></LinkTo><button onClick={()=>openWaitlist('Product updates')} className="underlined-action">Get updates <ArrowUpRight size={16}/></button></span></section>
  </>;
}

function Downloads({go,openWaitlist}: {go:(path:string)=>void;openWaitlist:(interest:string)=>void}) {
  const defaultPlatform = /Mac/i.test(navigator.userAgent)?'macos':/Win/i.test(navigator.userAgent)?'windows':'linux';
  const [selected,setSelected]=useState(defaultPlatform);
  const active=downloadOptions.find(p=>p.key===selected)!;
  return <section className="page-shell content-width">
    <PageIntro index="02" kicker="GETTING STARTED" title="Made to play." description="One place to start. Choose your operating system, explore the launcher, and get ready for Opus."/>
    <span className="download-layout">
      <span className="download-body"><span className="eyebrow">SELECT YOUR PLATFORM</span><span className="platform-list">{downloadOptions.map(item=><button key={item.key} className={'platform-row'+(selected===item.key?' selected':'')} type="button" aria-pressed={selected===item.key} onClick={()=>setSelected(item.key)}><Monitor size={25}/><span><b>{item.label}</b><small>{item.subtitle}</small></span><span className="platform-select">{selected===item.key?<Check size={17}/>:null}</span></button>)}</span><span className="download-selection"><span className="eyebrow">SELECTED / {active.label.toUpperCase()}</span><h2>{active.detail}</h2><p>{active.url?'A release link has been configured for this platform.':'A public download has not been linked for this platform yet. Follow the release updates to know when one is available.'}</p>{active.url?<a href={active.url} className="button-light" rel="noopener noreferrer">Download for {active.label} <Download size={18}/></a>:<button type="button" className="button-light" onClick={()=>openWaitlist('Download · '+active.label)}>Notify me at release <ArrowUpRight size={17}/></button>}</span><span className="download-note">OPUS CLIENT IS IN ACTIVE DEVELOPMENT. SYSTEM REQUIREMENTS AND PUBLIC RELEASE FILES WILL BE LISTED HERE WHEN CONFIRMED.</span></span>
      <span className="download-visual"><img src="/previews/launcher-home.png" alt="Opus desktop launcher preview"/><span className="download-visual-caption"><span>THE OPUS DESKTOP EXPERIENCE</span><span>FIG. 02 / PREVIEW</span></span></span>
    </span>
    <span className="info-rows"><span><b>01</b><strong>Install</strong><p>Download the launcher for your operating system when a build is published.</p></span><span><b>02</b><strong>Sign in</strong><p>Set up your Opus identity and connect your Minecraft account through the launcher.</p></span><span><b>03</b><strong>Make it yours</strong><p>Explore the client settings, features and personalization.</p></span></span>
    <section className="page-end-cta"><span className="eyebrow">WANT TO LEARN MORE?</span><h2>See what Opus is made of.</h2><LinkTo href="/features" go={go} className="inline-link">Explore features <ArrowUpRight size={16}/></LinkTo></section>
  </section>;
}

function Features({go}: {go:(path:string)=>void}) {
  const [filter,setFilter]=useState('All');
  const [selected,setSelected]=useState<(typeof features)[number]|null>(null);
  const categories=['All','Interface','Gameplay','Utility','Platform','Performance'];
  const filtered=filter==='All'?features:features.filter(feature=>feature.category===filter);
  return <section className="page-shell content-width">
    <PageIntro index="03" kicker="THE EXPERIENCE" title="It's in the details." description="From movement controls to the interface around them, every part of Opus has a purpose."/>
    <span className="feature-intro-art"><img src="/previews/client-control-center.png" alt="Real Opus Client configuration screen"/><span className="feature-intro-caption"><span>IN-GAME CONTROL CENTER</span><span>LIVE DESIGN REFERENCE / OPUS UI</span></span></span>
    <span className="catalog-heading"><span><span className="eyebrow">EXPLORE THE TOOLKIT</span><h2>Made for your playstyle.</h2></span><span className="catalog-count">{String(filtered.length).padStart(2,'0')} MODULES & SYSTEMS</span></span>
    <span className="filter-row">{categories.map(category=><button className={'filter-chip'+(category===filter?' active':'')} type="button" key={category} onClick={()=>setFilter(category)} aria-pressed={category===filter}>{category}</button>)}</span>
    <span className="feature-directory">{filtered.map(feature=><button className="feature-directory-item" type="button" key={feature.id} onClick={()=>setSelected(feature)}><span className="directory-num">{feature.id}</span><span className="directory-main"><span className="directory-tag">{feature.category} / {feature.tag}</span><strong>{feature.name}</strong><small>{feature.description}</small></span><ArrowUpRight size={20}/></button>)}</span>
    <section className="page-end-cta"><span className="eyebrow">DESIGNED TO GROW</span><h2>The best things evolve.</h2><p>Opus is being developed and refined. The feature directory distinguishes existing controls from work in progress.</p><LinkTo href="/journal" go={go} className="inline-link">Development notes <ArrowUpRight size={16}/></LinkTo></section>
    {selected&&<span className="dialog-backdrop" onMouseDown={()=>setSelected(null)}><section className="feature-dialog" role="dialog" aria-modal="true" aria-labelledby="feature-dialog-title" onMouseDown={event=>event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close details" onClick={()=>setSelected(null)}><X size={20}/></button><span className="eyebrow">{selected.category} / {selected.tag}</span><h2 id="feature-dialog-title">{selected.name}</h2><p>{selected.detail}</p><span className="dialog-foot"><span>OPUS / FEATURE {selected.id}</span><button className="inline-link" onClick={()=>setSelected(null)}>Close <ArrowRight size={15}/></button></span></section></span>}
  </section>;
}

function ProductIllustration({product}: {product:StoreProduct}) {
  return <span className={'product-image '+product.visual}><span className="product-frame"><span className="product-frame-top">OPUS / {product.collection.toUpperCase()}</span><img src="/brand/opus.svg" alt=""/><span className="product-frame-bottom">{product.edition.toUpperCase()}</span></span></span>;
}

function Store({openWaitlist,cart,addCart,removeCart,openCart}: {openWaitlist:(interest:string)=>void;cart:string[];addCart:(id:string)=>void;removeCart:(id:string)=>void;openCart:()=>void}) {
  const [category,setCategory]=useState('All');
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState('Featured');
  const [view,setView]=useState<StoreProduct|null>(null);
  const [saved,setSaved]=useState<string[]>(()=>readSaved('opus-web-wishlist'));
  useEffect(()=>localStorage.setItem('opus-web-wishlist',JSON.stringify(saved)),[saved]);
  const filtered=useMemo(()=>{
    const matching=products.filter(product=>(category==='All'||product.category===category)&&(product.name+' '+product.collection).toLowerCase().includes(query.toLowerCase().trim()));
    return sort==='Name'?[...matching].sort((a,b)=>a.name.localeCompare(b.name)):matching;
  },[category,query,sort]);
  return <section className="page-shell content-width store-page">
    <PageIntro index="04" kicker="OPUS STORE" title="The collection." description="An exploration of identity beyond the interface. Early concepts from the Opus Store."/>
    <span className="store-disclosure"><span>STORE PREVIEW / NOT AVAILABLE FOR PURCHASE</span><span>PRODUCT DESIGNS, PRICES AND AVAILABILITY ARE SUBJECT TO CHANGE.</span></span>
    <section className="store-banner"><span className="store-banner-copy"><span className="eyebrow">COLLECTION 001 / FOUNDATIONS</span><h2>Defined by<br/>the details.</h2><p>A collection of expressive, understated ideas for the world of Opus.</p><button type="button" className="button-light" onClick={()=>openWaitlist('Store opening')}>Store opening updates <ArrowUpRight size={16}/></button></span><img src="/media/launcher-miyabi-poster.jpg" alt="" /></section>
    <span className="catalog-heading"><span><span className="eyebrow">THE CATALOGUE</span><h2>Find your signature.</h2></span><span className="catalog-count">{filtered.length} CONCEPTS</span></span>
    <span className="store-controls"><span className="filter-row">{['All','Cloaks','Accessories','Interface'].map(name=><button type="button" key={name} className={'filter-chip'+(name===category?' active':'')} aria-pressed={name===category} onClick={()=>setCategory(name)}>{name}</button>)}</span><span className="store-tools"><label className="search-input"><Search size={17}/><input aria-label="Search collection" placeholder="Search collection" value={query} onChange={event=>setQuery(event.target.value)}/></label><label className="sort-select"><SlidersHorizontal size={16}/><select value={sort} aria-label="Sort products" onChange={event=>setSort(event.target.value)}><option>Featured</option><option>Name</option></select><ChevronDown size={14}/></label></span></span>
    <span className="product-grid">{filtered.map(product=><article className="product-card" key={product.id}><button className="product-click" type="button" onClick={()=>setView(product)} aria-label={'View '+product.name}><ProductIllustration product={product}/></button><span className="product-meta"><span>{product.category.toUpperCase()} / {product.edition.toUpperCase()}</span><button aria-label={saved.includes(product.id)?'Remove from saved':'Save product'} title="Save concept" className={'wish-button'+(saved.includes(product.id)?' liked':'')} onClick={()=>setSaved(previous=>previous.includes(product.id)?previous.filter(id=>id!==product.id):[...previous,product.id])}><Heart size={18} fill={saved.includes(product.id)?'currentColor':'none'}/></button></span><h3>{product.name}</h3><span className="product-bottom"><span>PRICING TO BE ANNOUNCED</span><button type="button" aria-label={'Add '+product.name+' to preview bag'} onClick={()=>{addCart(product.id);openCart();}}><ShoppingBag size={17}/></button></span></article>)}</span>
    {filtered.length===0&&<span className="no-results"><Search size={26}/><h3>No concepts found.</h3><p>Try another collection or search term.</p><button className="inline-link" onClick={()=>{setQuery('');setCategory('All');}}>Clear filters <ArrowRight size={15}/></button></span>}
    {view&&<span className="dialog-backdrop" onMouseDown={()=>setView(null)}><section className="product-dialog" role="dialog" aria-modal="true" aria-label={view.name} onMouseDown={event=>event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close product" onClick={()=>setView(null)}><X size={20}/></button><ProductIllustration product={view}/><span className="product-dialog-copy"><span className="eyebrow">{view.collection.toUpperCase()} / {view.edition.toUpperCase()}</span><h2>{view.name}</h2><p>{view.description}</p><span className="product-dialog-note">CONCEPT PREVIEW — NOT YET FOR SALE</span><button type="button" className="button-light" onClick={()=>{if(!cart.includes(view.id))addCart(view.id);setView(null);openCart();}}>{cart.includes(view.id)?'View preview bag':'Add to preview bag'} <ArrowRight size={17}/></button></span></section></span>}
  </section>;
}

function Premium({go,openWaitlist}: {go:(path:string)=>void;openWaitlist:(interest:string)=>void}) {
  return <section className="page-shell content-width premium-page">
    <PageIntro index="05" kicker="OPUS MEMBERSHIP" title="A little more Opus." description="Find the experience that fits you. The essentials are free; premium tiers bring more ways to make the client yours."/>
    <section className="premium-banner"><span className="eyebrow">THE OPUS EDITIONS</span><h2>Yours, in every detail.</h2><p>Aether and Elysium are part of our planned premium offering. Availability, final benefits and pricing have not been announced.</p><img src="/brand/opus.svg" alt="" /></section>
    <span className="plan-grid">{plans.map((plan,index)=><article className={'plan-card plan-'+plan.tone} key={plan.name}><span className="plan-header"><span className="eyebrow">{String(index+1).padStart(2,'0')} / {plan.overline}</span><span className="plan-status">{plan.status}</span></span><h2>{plan.name}</h2><p className="plan-desc">{plan.description}</p><span className="plan-price">{index===0?'Free':'To be announced'}</span><span className="plan-divider"/><span className="plan-benefits">{plan.benefits.map(benefit=><span key={benefit}><Check size={16}/>{benefit}</span>)}</span>{index===0?<LinkTo href="/download" go={go} className="plan-action">Explore downloads <ArrowUpRight size={17}/></LinkTo>:<button type="button" className="plan-action" onClick={()=>openWaitlist('Membership · '+plan.name)}>Get membership updates <ArrowUpRight size={17}/></button>}</article>)}</span>
    <section className="membership-notes"><span><span className="eyebrow">WHAT TO EXPECT</span><h2>Considered, not complicated.</h2></span><span><p>Membership is being designed around clarity and tangible value. The benefits shown above are a roadmap preview, not a currently available subscription contract.</p><p>Final terms, payment options and renewal details will be published before memberships become purchasable.</p></span></section>
  </section>;
}

function Journal({go}: {go:(path:string)=>void}) {
  const [query,setQuery]=useState('');
  const posts=journal.filter(item=>(item.title+' '+item.excerpt).toLowerCase().includes(query.toLowerCase()));
  return <section className="page-shell content-width journal-page">
    <PageIntro index="06" kicker="THE OPUS JOURNAL" title="From the inside." description="A closer look at the decisions, experiments and ideas behind Opus."/>
    <span className="journal-note"><span>EDITORIAL PREVIEWS</span><span>WORKING NOTES FROM THE PRODUCT / NOT OFFICIAL RELEASE ANNOUNCEMENTS</span></span>
    <span className="journal-topline"><span className="eyebrow">LATEST STORIES</span><label className="search-input"><Search size={17}/><input placeholder="Search articles" aria-label="Search articles" value={query} onChange={event=>setQuery(event.target.value)}/></label></span>
    <span className="journal-list">{posts.map((item,index)=><LinkTo key={item.slug} href={'/journal/'+item.slug} go={go} className="journal-list-item"><span className="journal-list-num">{String(index+1).padStart(2,'0')}</span><span className={'journal-list-image journal-art-'+index}><img src={index===1?'/media/client-tsundere-poster.jpg':'/media/launcher-miyabi-poster.jpg'} alt="" loading="lazy"/></span><span className="journal-list-copy"><span className="eyebrow">{item.eyebrow}</span><h2>{item.title}</h2><p>{item.excerpt}</p><small>{item.readingTime}</small></span><ArrowUpRight size={22}/></LinkTo>)}</span>
    {posts.length===0&&<span className="no-results"><h3>No articles matched your search.</h3><button className="inline-link" onClick={()=>setQuery('')}>Show all articles <ArrowRight size={15}/></button></span>}
  </section>;
}

function Article({go,slug}: {go:(path:string)=>void;slug:string}) {
  const entry=journal.find(item=>item.slug===slug);
  if(!entry)return <section className="page-shell content-width not-found"><h1>Story not found.</h1><LinkTo href="/journal" go={go} className="inline-link">Back to journal <ArrowLeft size={17}/></LinkTo></section>;
  return <article className="article-page content-width">
    <LinkTo href="/journal" go={go} className="article-back"><ArrowLeft size={17}/> All stories</LinkTo>
    <span className="article-header"><span className="eyebrow">{entry.eyebrow}</span><h1>{entry.title}</h1><span className="article-metadata"><span>{entry.readingTime}</span><span>OPUS EDITORIAL / DRAFT</span></span></span>
    <span className="article-cover"><img src="/media/launcher-miyabi-poster.jpg" alt="" /></span>
    <span className="article-content">{entry.body.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<span className="article-end">— OPUS CLIENT</span></span>
    <span className="article-footer"><LinkTo href="/journal" go={go} className="inline-link">More from the journal <ArrowRight size={17}/></LinkTo><LinkTo href="/features" go={go} className="inline-link">Explore the client <ArrowUpRight size={17}/></LinkTo></span>
  </article>;
}

function Account({member,onAuthenticated,onLogout}: {member:Member|null;onAuthenticated:(account:Member)=>void;onLogout:()=>void}) {
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [username,setUsername]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setError('');setNotice('');
    if(mode==='register'&&password!==confirmPassword){setError('Passwords do not match.');return;}
    setBusy(true);
    try{
      const result=await api<{account:Member}>('/api/auth/'+mode,'POST',mode==='login'?{email,password}:{username,email,password});
      onAuthenticated(result.account);setPassword('');setConfirmPassword('');
    }catch(cause){setError(cause instanceof Error?cause.message:'Something went wrong.');}
    finally{setBusy(false);}
  };
  const signOut=async()=>{
    setBusy(true);setError('');
    try{await api('/api/auth/logout','POST',{});onLogout();setNotice('You have signed out.');}catch(cause){setError(cause instanceof Error?cause.message:'Could not sign out.');}
    finally{setBusy(false);}
  };
  return <section className="page-shell content-width account-page">
    <PageIntro index="07" kicker="YOUR OPUS IDENTITY" title={member?'Welcome back.':'Your place in Opus.'} description={member?'Your account. Your identity. Your experience.':'Create your Opus account or sign in to an existing one.'}/>
    <span className="account-layout">
      <section className="account-panel">
        {member?<><span className="eyebrow">ACCOUNT OVERVIEW</span><span className="account-avatar-large"><UserRound size={38}/></span><h2>{member.username}</h2><p className="account-email">{member.email}</p><span className="account-info-list"><span><small>MEMBERSHIP</small><strong>{member.plan}</strong></span><span><small>ACCOUNT CREATED</small><strong>{new Date(member.createdAt).toLocaleDateString()}</strong></span><span><small>ACCOUNT STATUS</small><strong>Active</strong></span></span><button className="outline-action" type="button" disabled={busy} onClick={signOut}><LogOut size={17}/> Sign out</button>{error&&<p className="form-error" role="alert">{error}</p>}</>:<>
          <span className="account-tabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');}}>Sign in</button><button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');}}>Create account</button></span>
          <span className="account-form-heading"><span className="eyebrow">OPUS ACCOUNT</span><h2>{mode==='login'?'Good to see you again.':'Start with an account.'}</h2><p>{mode==='login'?'Sign in with the credentials you created for Opus.':'Your account keeps your Opus identity in one place.'}</p></span>
          <form className="account-form" onSubmit={submit}>
            {mode==='register'&&<label>Username<input name="username" type="text" autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder="Choose a username" value={username} onChange={event=>setUsername(event.target.value)}/></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={event=>setEmail(event.target.value)}/></label>
            <label>Password<input name="password" type="password" autoComplete={mode==='register'?'new-password':'current-password'} required minLength={10} placeholder="Enter your password" value={password} onChange={event=>setPassword(event.target.value)}/></label>
            {mode==='register'&&<label>Confirm password<input name="confirm-password" type="password" autoComplete="new-password" required minLength={10} placeholder="Repeat your password" value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)}/></label>}
            {error&&<p className="form-error" role="alert">{error}</p>}
            {notice&&<p className="form-success" role="status">{notice}</p>}
            <button type="submit" className="button-light" disabled={busy}>{busy?'Working…':mode==='login'?'Sign in':'Create account'} <ArrowRight size={17}/></button>
          </form>
          <span className="auth-disclaimer"><LockKeyhole size={15}/> Opus account credentials are separate from your Microsoft / Minecraft credentials.</span>
        </>}
      </section>
      <aside className="account-side"><img src="/media/client-tsundere-poster.jpg" alt="" /><span><span className="eyebrow">YOUR OWN SPACE</span><h2>Make it yours.</h2><p>An identity that stays with you across the Opus experience.</p></span></aside>
    </span>
  </section>;
}

function CartDrawer({items,remove,close,openWaitlist}: {items:string[];remove:(id:string)=>void;close:()=>void;openWaitlist:(interest:string)=>void}) {
  const selected=products.filter(item=>items.includes(item.id));
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};
    document.addEventListener('keydown',key);
    return ()=>document.removeEventListener('keydown',key);
  },[close]);
  return <span className="drawer-screen" onMouseDown={close}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Preview bag" onMouseDown={event=>event.stopPropagation()}><span className="drawer-head"><span><span className="eyebrow">OPUS STORE</span><h2>Your preview bag <small>({selected.length})</small></h2></span><button className="dialog-close" type="button" onClick={close} aria-label="Close bag"><X size={20}/></button></span>{selected.length? <span className="cart-list">{selected.map(item=><span className="cart-entry" key={item.id}><span className={'cart-art '+item.visual}><img src="/brand/opus.svg" alt=""/></span><span><strong>{item.name}</strong><small>{item.category} / Preview concept</small><button type="button" onClick={()=>remove(item.id)}>Remove <Minus size={12}/></button></span></span>)}</span>:<span className="cart-empty"><ShoppingBag size={35}/><h3>Your bag is empty.</h3><p>Browse the collection and save a few ideas.</p><button className="inline-link" type="button" onClick={close}>Continue exploring <ArrowRight size={16}/></button></span>}<span className="drawer-bottom"><p>This is a preview bag. Products are concepts and no checkout or payment is available yet.</p><button type="button" className="button-light" onClick={()=>{close();openWaitlist('Store opening');}}>Notify me when the store opens <ArrowUpRight size={17}/></button></span></aside></span>;
}

function WaitlistDialog({close,interest}: {close:()=>void;interest:string}) {
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [complete,setComplete]=useState(false);
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setError('');setBusy(true);
    try{await api('/api/waitlist','POST',{email,interest});setComplete(true);}catch(cause){setError(cause instanceof Error?cause.message:'Could not subscribe.');}finally{setBusy(false);}
  };
  return <span className="dialog-backdrop" onMouseDown={close}><section className="waitlist-dialog" role="dialog" aria-modal="true" aria-labelledby="waitlist-title" onMouseDown={event=>event.stopPropagation()}><button type="button" className="dialog-close" aria-label="Close" onClick={close}><X size={19}/></button>{complete?<><span className="eyebrow">REQUEST RECEIVED</span><h2 id="waitlist-title">You're on the list.</h2><p>We saved your interest in {interest.toLowerCase()}. Future updates depend on the product's launch communications.</p><button className="button-light" onClick={close}>Done <Check size={16}/></button></>:<><span className="eyebrow">STAY IN THE LOOP / OPUS CLIENT</span><h2 id="waitlist-title">Hear it first.</h2><p>Leave your email to register interest in {interest.toLowerCase()}. No release dates are promised.</p><form onSubmit={submit}><label>Email address<input type="email" required placeholder="you@example.com" value={email} onChange={event=>setEmail(event.target.value)}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={busy} className="button-light">{busy?'Saving…':'Register interest'} <ArrowRight size={17}/></button></form></>}</section></span>;
}

export default function App() {
  const [path,setPath]=useState(pathNow);
  const [member,setMember]=useState<Member|null>(null);
  const [cart,setCart]=useState<string[]>(()=>readSaved('opus-web-cart'));
  const [cartOpen,setCartOpen]=useState(false);
  const [waitlist,setWaitlist]=useState<string|null>(null);
  useEffect(()=>{
    const handler=()=>{setPath(pathNow());window.scrollTo({top:0,behavior:'instant'});};
    window.addEventListener('popstate',handler);
    void api<{account:Member|null}>('/api/auth/session').then(value=>setMember(value.account)).catch(()=>undefined);
    return ()=>window.removeEventListener('popstate',handler);
  },[]);
  useEffect(()=>{localStorage.setItem('opus-web-cart',JSON.stringify(cart));},[cart]);
  useEffect(()=>{document.title=(path==='/'?'Opus Client':path.split('/').filter(Boolean).map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' / ')+' — Opus Client');},[path]);
  const go=(to:string)=>{
    if(to===path){window.scrollTo({top:0,behavior:'smooth'});return;}
    history.pushState(null,'',to);setPath(to);window.scrollTo({top:0,behavior:'instant'});
  };
  const addCart=(id:string)=>setCart(previous=>previous.includes(id)?previous:[...previous,id]);
  const removeCart=(id:string)=>setCart(previous=>previous.filter(x=>x!==id));
  const page: ReactNode = path==='/'?<Home go={go} openWaitlist={setWaitlist}/>
    :path==='/download'?<Downloads go={go} openWaitlist={setWaitlist}/>
    :path==='/features'?<Features go={go}/>
    :path==='/store'?<Store openWaitlist={setWaitlist} cart={cart} addCart={addCart} removeCart={removeCart} openCart={()=>setCartOpen(true)}/>
    :path==='/premium'?<Premium go={go} openWaitlist={setWaitlist}/>
    :path==='/journal'?<Journal go={go}/>
    :path.startsWith('/journal/')?<Article go={go} slug={path.slice('/journal/'.length)}/>
    :path==='/account'?<Account member={member} onAuthenticated={setMember} onLogout={()=>setMember(null)}/>
    :<section className="page-shell content-width not-found"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>This isn't where<br/>you meant to go.</h1><LinkTo href="/" go={go} className="button-light">Back to home <ArrowRight size={17}/></LinkTo></section>;
  return <span className="opus-site" id="top">
    <SiteHeader go={go} path={path} member={member} cartCount={cart.length} openCart={()=>setCartOpen(true)}/>
    <main className="site-main" key={path}>{page}</main>
    <SiteFooter go={go} openWaitlist={setWaitlist}/>
    {cartOpen&&<CartDrawer items={cart} remove={removeCart} close={()=>setCartOpen(false)} openWaitlist={setWaitlist}/>}
    {waitlist&&<WaitlistDialog interest={waitlist} close={()=>setWaitlist(null)}/>}
  </span>;
}
