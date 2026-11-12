export type ProductCategory = 'Cloaks' | 'Accessories' | 'Interface';

export interface StoreProduct {
  id: string;
  name: string;
  category: ProductCategory;
  collection: string;
  edition: string;
  visual: string;
  description: string;
}

export const products: StoreProduct[] = [
  {id:'nocturne', name:'Nocturne Cloak', category:'Cloaks', collection:'Foundations', edition:'Concept 01', visual:'product-nocturne', description:'A restrained charcoal cloak with the Opus insignia.'},
  {id:'silverline', name:'Silverline Cloak', category:'Cloaks', collection:'Foundations', edition:'Concept 02', visual:'product-silver', description:'A minimal pale-silver interpretation of the Opus identity.'},
  {id:'monogram', name:'Monogram Emblem', category:'Accessories', collection:'Identity', edition:'Concept 03', visual:'product-monogram', description:'A compact mark for your in-game identity.'},
  {id:'graphite', name:'Graphite Theme', category:'Interface', collection:'Interfaces', edition:'Concept 04', visual:'product-graphite', description:'A low-distraction arrangement for the Opus interface.'},
  {id:'aperture', name:'Aperture Cloak', category:'Cloaks', collection:'Identity', edition:'Concept 05', visual:'product-aperture', description:'Interlocking lines drawn from the launcher geometry.'},
  {id:'signal', name:'Signal Emblem', category:'Accessories', collection:'Identity', edition:'Concept 06', visual:'product-signal', description:'An understated symbol designed to feel at home in the client.'},
];

export const features = [
  {id:'01',name:'Performance HUD',category:'Interface',tag:'In client',description:'Readable FPS information and configurable presentation, without getting in the way of play.',detail:'The FPS module exposes text, background, border and display controls. The website reflects the existing module settings, not an invented benchmark.'},
  {id:'02',name:'Keystrokes',category:'Interface',tag:'In client',description:'A customizable input display built around the way you play.',detail:'Adjust mouse-button and jump-key visibility through the client module settings.'},
  {id:'03',name:'Toggle Movement',category:'Gameplay',tag:'In client',description:'Sprint, sneak and movement preferences in one focused place.',detail:'Toggle Sprint, Toggle Sneak and related keybind controls appear in the current client source.'},
  {id:'04',name:'Armor Status',category:'Gameplay',tag:'In client',description:'Keep critical equipment information visible.',detail:'Armor Status includes display controls, including durability information.'},
  {id:'05',name:'Chat Tools',category:'Utility',tag:'In client',description:'More control over timestamps, history, highlights and chat presentation.',detail:'The source contains settings for timestamps, highlighting, anti-spam, chat history and image previews.'},
  {id:'06',name:'Lighting Controls',category:'Utility',tag:'In client',description:'A dedicated interface for lighting preferences.',detail:'Lighting settings and the control surface are part of the current client implementation.'},
  {id:'07',name:'Launcher Experience',category:'Platform',tag:'In launcher',description:'A dedicated desktop launcher with accounts, installation and launch controls.',detail:'The launcher has account management, installer status, settings and a media-backed launch surface.'},
  {id:'08',name:'Graphics Pipeline',category:'Performance',tag:'In development',description:'Ongoing work on frame pacing, rendering stability and platform-level optimizations.',detail:'This is an active engineering area. No performance uplift or platform support is promised without measured verification.'},
] as const;

export interface JournalEntry {
  slug: string;
  eyebrow: string;
  title: string;
  excerpt: string;
  readingTime: string;
  body: string[];
}

export const journal: JournalEntry[] = [
  {
    slug:'the-opus-approach',
    eyebrow:'DESIGN NOTES / 001',
    title:'The Opus approach',
    excerpt:'Why the best interface is often the one that gets out of your way.',
    readingTime:'4 MIN READ',
    body:[
      'A client should be designed around the moments when you are actually using it. Settings need to be discoverable, but not constantly present. Motion should communicate relationships, not decorate empty space.',
      'We have been exploring a visual language built from precisely joined surfaces, quiet contrast, and carefully measured transitions. The launcher and in-game interface share the same structural ideas while adapting to their individual contexts.',
      'This website carries those ideas into a larger canvas. Photography and motion establish atmosphere. Geometry explains hierarchy. The product remains the focal point.',
    ],
  },
  {
    slug:'behind-the-launcher',
    eyebrow:'ENGINEERING NOTES / 002',
    title:'Behind the launcher',
    excerpt:'A closer look at the desktop experience and its connected surfaces.',
    readingTime:'5 MIN READ',
    body:[
      'The desktop launcher is a distinct part of Opus: it handles the steps before the game begins. Account selection, installation state, configuration and launch readiness need to work together without competing for attention.',
      'The current interface uses background media, a segmented navigation system and concave transitions between surfaces. These are implemented as layout primitives rather than decorative overlays.',
      'Keeping those decisions consistent across the website, launcher and client gives the product a recognizable identity even as each surface has different responsibilities.',
    ],
  },
  {
    slug:'built-for-clarity',
    eyebrow:'PRODUCT NOTES / 003',
    title:'Built for clarity',
    excerpt:'The role of small decisions in a more deliberate in-game interface.',
    readingTime:'3 MIN READ',
    body:[
      'Every extra control introduces a decision. A good settings experience makes the necessary decisions easy and removes the unnecessary ones.',
      'Modules such as the performance overlay, keystrokes, movement controls and chat tools all benefit from readable groups, stable navigation and clear state.',
      'The goal is not to make everything disappear. It is to make every part of the interface feel intentional.',
    ],
  },
];
