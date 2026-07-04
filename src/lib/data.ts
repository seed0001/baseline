// Baseline domain model and initial researched catalog snapshot.
// The published pricing fields are overlaid from PostgreSQL in production.
// QuoteRequest, Proposal, Project, Milestone, Task, Provider,
// ProviderQualification, PaymentSchedule, CustomServiceRequest.

export type SkillLevel = "Entry" | "Intermediate" | "Licensed Pro" | "Specialist";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  serviceCount: number;
}

export interface PriceSource {
  label: string;
  url: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  description: string;
  baselinePrice: number;
  priceUnit: string;
  estimatedDuration: string;
  skillLevel: SkillLevel;
  requiresPhotos: boolean;
  requiresMeasurements: boolean;
  requiredInfo: string[];
  /** Published market range from independent cost guides. */
  marketRange: string;
  /** How the baseline figure was derived from the sources. */
  priceBasis: string;
  sources: PriceSource[];
  lastVerified: string;
}

export type QuoteStatus = "Submitted" | "Under Review" | "Quoted" | "Accepted" | "Expired";

export interface QuoteRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  customer: string;
  location: string;
  urgency: "Standard" | "Priority" | "Emergency";
  submittedDate: string;
  status: QuoteStatus;
  estimateLow: number;
  estimateHigh: number;
}

export type MilestoneStatus = "Not Started" | "In Progress" | "Awaiting Approval" | "Complete";
export type PaymentStatus = "Not Due" | "Due" | "Paid" | "In Escrow";

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  amount: number;
  paymentStatus: PaymentStatus;
  completion: number;
}

export interface Task {
  id: string;
  name: string;
  milestone: string;
  assignee: string;
  status: "To Do" | "In Progress" | "Done";
}

export interface Provider {
  id: string;
  name: string;
  company: string;
  trade: string;
  rating: number;
  jobsCompleted: number;
  status: "Approved" | "In Screening" | "Suspended";
  qualifications: string[];
}

export interface PaymentScheduleItem {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface ActivityItem {
  id: string;
  date: string;
  actor: string;
  action: string;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  status: "Planning" | "In Progress" | "Awaiting Approval" | "Complete";
  budget: number;
  paidToDate: number;
  startDate: string;
  targetDate: string;
  location: string;
  description: string;
  milestones: Milestone[];
  tasks: Task[];
  providerIds: string[];
  payments: PaymentScheduleItem[];
  activity: ActivityItem[];
}

export interface ProposalLineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

export interface ProposalPhase {
  name: string;
  items: ProposalLineItem[];
}

export interface Proposal {
  id: string;
  projectName: string;
  preparedFor: { name: string; address: string; email: string; phone: string };
  date: string;
  validUntil: string;
  scope: string;
  phases: ProposalPhase[];
  taxRate: number;
  depositPct: number;
  paymentTerms: string[];
}

export interface CustomServiceRequest {
  id: string;
  title: string;
  customer: string;
  location: string;
  budgetRange: string;
  timeline: string;
  submittedDate: string;
  status: "Pending Review" | "Approved" | "Declined";
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories: ServiceCategory[] = [
  { id: "plumbing", name: "Plumbing", description: "Fixtures, water heaters, leaks, and pipe work", serviceCount: 3 },
  { id: "electrical", name: "Electrical", description: "Fans, panels, outlets, and lighting", serviceCount: 3 },
  { id: "remodeling", name: "Remodeling", description: "Bathrooms, kitchens, and full renovations", serviceCount: 3 },
  { id: "construction", name: "Commercial Construction", description: "Office build-outs, tenant improvements, and multi-phase commercial jobs", serviceCount: 2 },
  { id: "software", name: "Software & App Development", description: "Custom web apps, mobile apps, e-commerce, and system integrations", serviceCount: 6 },
  { id: "creative", name: "Creative & Design", description: "Branding, photography, video, and design work", serviceCount: 4 },
  { id: "marketing", name: "Marketing & Growth", description: "SEO, paid ads, social, and content programs", serviceCount: 3 },
  { id: "professional", name: "Professional Services", description: "Bookkeeping, tax prep, filings, and consulting", serviceCount: 3 },
  { id: "events", name: "Events & Catering", description: "Corporate events, catering, and AV production", serviceCount: 3 },
  { id: "automotive", name: "Automotive", description: "Brakes, batteries, and routine maintenance", serviceCount: 2 },
  { id: "lawn", name: "Lawn & Property", description: "Mowing, pressure washing, and exterior care", serviceCount: 3 },
  { id: "technology", name: "Technology", description: "Networking, smart home, and device setup", serviceCount: 2 },
  { id: "cleaning", name: "Cleaning", description: "Deep cleans, move-out cleans, and recurring service", serviceCount: 2 },
  { id: "moving", name: "Moving & Hauling", description: "Local moves, furniture, and junk removal", serviceCount: 2 },
  { id: "custom", name: "Custom Requests", description: "Don't see it? Request it and we'll price it", serviceCount: 0 },
];

// ---------------------------------------------------------------------------
// Service catalog (company-owned templates)
// ---------------------------------------------------------------------------

export const services: ServiceTemplate[] = [
  {
    id: "svc-101", name: "Replace Toilet", categoryId: "plumbing", category: "Plumbing",
    description: "Remove existing toilet, install customer-supplied or Baseline-sourced unit, new wax ring and supply line, haul away old unit.",
    baselinePrice: 425, priceUnit: "flat", estimatedDuration: "2–3 hours", skillLevel: "Licensed Pro",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Photo of existing toilet", "Rough-in distance if known", "Floor type"],
    marketRange: "$375 – $800 installed (labor $150 – $400)",
    priceBasis: "Midpoint of national installed averages for a standard two-piece unit, labor plus haul-away, customer- or Baseline-supplied toilet.",
    sources: [
      { label: "Angi — Toilet Installation Cost", url: "https://www.angi.com/articles/how-much-does-toilet-installation-cost.htm" },
      { label: "HomeAdvisor — Cost to Install a Toilet", url: "https://www.homeadvisor.com/cost/plumbing/install-a-toilet/" },
      { label: "Forbes Home — Toilet Installation Cost", url: "https://www.forbes.com/home-improvement/bathroom/toilet-installation-replacement-cost/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-102", name: "Water Heater Replacement (40–50 gal)", categoryId: "plumbing", category: "Plumbing",
    description: "Drain and remove existing tank, install new 40–50 gallon unit, code-required fittings, and disposal.",
    baselinePrice: 1650, priceUnit: "flat", estimatedDuration: "3–5 hours", skillLevel: "Licensed Pro",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Photo of current unit and connections", "Gas or electric", "Location (garage, closet, attic)"],
    marketRange: "$950 – $3,000 installed (40 gal avg ≈ $1,650)",
    priceBasis: "HomeGuide national average for a 40-gallon tank installed; 50-gallon and gas units trend toward the upper half of the range.",
    sources: [
      { label: "HomeGuide — 40-Gallon Water Heater Cost", url: "https://homeguide.com/costs/40-gallon-water-heater-cost" },
      { label: "Angi — Water Heater Replacement Cost", url: "https://www.angi.com/articles/how-much-does-water-heater-installation-cost.htm" },
      { label: "HomeAdvisor — Water Heater Replacement Cost", url: "https://www.homeadvisor.com/cost/plumbing/install-a-water-heater/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-201", name: "Install Ceiling Fan", categoryId: "electrical", category: "Electrical",
    description: "Install customer-supplied ceiling fan on existing fan-rated box, balance blades, and verify controls.",
    baselinePrice: 250, priceUnit: "flat", estimatedDuration: "1–2 hours", skillLevel: "Licensed Pro",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Photo of existing fixture", "Ceiling height", "Existing switch type"],
    marketRange: "$146 – $360 (national avg ≈ $253); new wiring $250 – $500",
    priceBasis: "Angi national average for replacement on an existing fan-rated box; new wiring or vaulted ceilings are quoted as add-ons.",
    sources: [
      { label: "Angi — Ceiling Fan Installation Cost", url: "https://www.angi.com/articles/how-much-does-ceiling-fan-installation-cost.htm" },
      { label: "HomeAdvisor — Ceiling Fan Install Cost", url: "https://www.homeadvisor.com/cost/heating-and-cooling/install-a-ceiling-fan/" },
      { label: "Fixr — Ceiling Fan Installation", url: "https://www.fixr.com/costs/ceiling-fan-installation" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-202", name: "Electrical Panel Upgrade (200A)", categoryId: "electrical", category: "Electrical",
    description: "Replace existing panel with 200A service, new breakers, permit coordination, and inspection.",
    baselinePrice: 2600, priceUnit: "flat", estimatedDuration: "1–2 days", skillLevel: "Specialist",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Photo of current panel (door open)", "Utility provider", "Home age"],
    marketRange: "$1,300 – $4,500 (most 200A jobs $1,300 – $3,000)",
    priceBasis: "Midpoint of published 200-amp upgrade ranges; service-entrance or meter-box work pushes toward the top of the range.",
    sources: [
      { label: "Angi — Cost to Upgrade to 200 Amps", url: "https://www.angi.com/articles/ask-angie-what-does-it-cost-upgrade-200-amps.htm" },
      { label: "This Old House — Electrical Panel Upgrade Cost", url: "https://www.thisoldhouse.com/electrical/cost-to-upgrade-electrical-panel" },
      { label: "PanelLoadCalc — Panel Upgrade Cost Guide", url: "https://www.panelloadcalc.com/guides/panel-upgrade-cost" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-301", name: "Repair Drywall", categoryId: "remodeling", category: "Remodeling",
    description: "Patch holes up to 2 ft², tape, mud, sand, and texture-match. Paint-ready finish.",
    baselinePrice: 175, priceUnit: "per patch", estimatedDuration: "2–4 hours", skillLevel: "Intermediate",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Photo of damage", "Approximate size", "Texture type"],
    marketRange: "$75 – $250 per patch (multi-patch projects avg ≈ $611)",
    priceBasis: "Single standard patch by a handyman or drywall pro; texture matching and ceiling work priced at the upper end.",
    sources: [
      { label: "Angi — Drywall Repair Cost", url: "https://www.angi.com/articles/how-much-does-drywall-repair-cost-small-holes.htm" },
      { label: "HomeAdvisor — Drywall Repair Cost", url: "https://www.homeadvisor.com/cost/walls-and-ceilings/repair-drywall/" },
      { label: "Taskrabbit — Drywall Repair Rates", url: "https://www.taskrabbit.com/cost-guides/drywall-repair" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-302", name: "Bathroom Remodel (Full)", categoryId: "remodeling", category: "Remodeling",
    description: "Full gut and rebuild of a standard bathroom: demo, rough plumbing/electrical, tile, fixtures, and finish.",
    baselinePrice: 12000, priceUnit: "starting at", estimatedDuration: "2–4 weeks", skillLevel: "Specialist",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Photos of all four walls", "Room dimensions", "Fixture wish list"],
    marketRange: "$6,600 – $17,600 typical (national avg ≈ $12,120); gut remodels $25,000+",
    priceBasis: "HomeAdvisor national average for a standard full bathroom remodel; primary-bath gut jobs are quoted per-project above the baseline.",
    sources: [
      { label: "HomeAdvisor — Bathroom Remodel Cost", url: "https://www.homeadvisor.com/cost/bathrooms/remodel-a-bathroom/" },
      { label: "This Old House — Bathroom Remodel Cost", url: "https://www.thisoldhouse.com/bathrooms/bathroom-remodel-cost" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-401", name: "Brake Pad Replacement", categoryId: "automotive", category: "Automotive",
    description: "Replace front or rear brake pads with quality aftermarket parts, inspect rotors, and road test.",
    baselinePrice: 250, priceUnit: "per axle", estimatedDuration: "1–2 hours", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Year / make / model", "Front, rear, or both", "Current symptoms"],
    marketRange: "$150 – $350 per axle (pads + labor); trucks/SUVs $250 – $450",
    priceBasis: "Pads-and-labor midpoint for typical passenger cars; rotors, performance pads, and electronic parking brakes quoted as add-ons.",
    sources: [
      { label: "Bosch Auto Service — Brake Pad Replacement Cost", url: "https://www.boschautoservice.com/blog/average-cost-of-brake-pad-replacement-in-2025" },
      { label: "AAA — How Much to Replace Brake Pads", url: "https://www.aaa.com/autorepair/articles/how-much-to-replace-brake-pads" },
      { label: "CarParts.com — Brake Pad Replacement Cost", url: "https://www.carparts.com/blog/brake-pad-replacement-cost-what-youll-really-pay-and-why-it-changes-quickref/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-501", name: "Pressure Wash Driveway", categoryId: "lawn", category: "Lawn & Property",
    description: "Surface clean concrete driveway up to 800 ft², pre-treat oil stains, rinse walkways.",
    baselinePrice: 210, priceUnit: "flat", estimatedDuration: "2–3 hours", skillLevel: "Entry",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Photo of driveway", "Approximate square footage", "Water spigot access"],
    marketRange: "$100 – $350 (avg ≈ $210 for 600 sq ft; $0.30 – $0.55/sq ft)",
    priceBasis: "National average for a standard 600 sq ft concrete driveway; oversized or heavily stained surfaces priced per square foot.",
    sources: [
      { label: "HomeAdvisor — Pressure Wash Driveway Cost", url: "https://www.homeadvisor.com/cost/cleaning-services/pressure-wash-driveway/" },
      { label: "Fixr — Driveway Pressure Washing Cost", url: "https://www.fixr.com/costs/pressure-wash-driveway" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-502", name: "Mow Residential Lawn", categoryId: "lawn", category: "Lawn & Property",
    description: "Mow, edge, trim, and blow clippings for lots up to ¼ acre. Recurring schedules available.",
    baselinePrice: 55, priceUnit: "per visit", estimatedDuration: "45–60 min", skillLevel: "Entry",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Lot size", "Gate access", "Pet cleanup needed"],
    marketRange: "$42 – $68 per visit (avg ≈ $55); ¼-acre lots $40 – $80",
    priceBasis: "LawnStarter national per-visit average for lots up to ¼ acre with mow, edge, trim, and blow.",
    sources: [
      { label: "LawnStarter — Lawn Mowing Price Guide", url: "https://www.lawnstarter.com/blog/cost/lawn-mowing-price/" },
      { label: "Angi — Lawn Mowing Cost", url: "https://www.angi.com/articles/how-much-does-lawn-mowing-cost.htm" },
      { label: "HomeGuide — Lawn Mowing Cost", url: "https://lawnlove.com/blog/lawn-mowing-cost/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-601", name: "Build Website Landing Page", categoryId: "software", category: "Software & App Development",
    description: "Single-page marketing site: copy layout, responsive design, contact form, analytics, and deployment.",
    baselinePrice: 1750, priceUnit: "flat", estimatedDuration: "1–2 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Business description", "Example sites you like", "Logo and brand assets"],
    marketRange: "$500 – $2,000 freelancer; $2,000 – $5,000 agency",
    priceBasis: "Midpoint between experienced-freelancer and agency pricing for a custom-designed, conversion-focused single page.",
    sources: [
      { label: "Landingi — Landing Page Cost", url: "https://landingi.com/landing-page/cost/" },
      { label: "Linear Design — Landing Page Design Cost", url: "https://lineardesign.com/blog/how-much-does-it-cost-to-design-a-landing-page/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-610", name: "Custom Web Application (MVP)", categoryId: "software", category: "Software & App Development",
    description: "Scoped MVP build delivered in 2-week sprints: discovery, UX design, development, QA, and deployment. Fixed phase pricing with demo approval at every sprint.",
    baselinePrice: 25000, priceUnit: "starting at", estimatedDuration: "6–12 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Business goals & core workflows", "Systems it must integrate with", "Who will use it and how often", "Existing tools or spreadsheets it replaces"],
    marketRange: "$15,000 – $60,000 typical web MVP; $60,000 – $120,000 advanced",
    priceBasis: "Published MVP ranges for US-managed teams; baseline reflects a simple-to-medium web app (auth, dashboard, 1–2 core workflows, one integration).",
    sources: [
      { label: "SPDLoad — Cost to Build an MVP", url: "https://spdload.com/blog/how-much-does-it-cost-to-build-an-mvp/" },
      { label: "SoftTeco — MVP Development Cost", url: "https://softteco.com/blog/mvp-development-cost" },
      { label: "The Ninja Studio — Custom Web App Cost", url: "https://www.theninjastudio.com/blog/custom-web-app-cost-what-startups-actually-pay" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-611", name: "Mobile App Development (iOS & Android)", categoryId: "software", category: "Software & App Development",
    description: "Cross-platform mobile app from design to app-store submission, including backend API, push notifications, and analytics.",
    baselinePrice: 60000, priceUnit: "starting at", estimatedDuration: "10–16 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["App concept & target users", "Required device features", "Backend or data requirements", "Comparable apps"],
    marketRange: "$50,000 – $120,000 typical SMB app; simple apps from $40,000",
    priceBasis: "Small-to-mid business range from industry surveys; baseline assumes a cross-platform (React Native/Flutter) build, which runs 30–50% below dual-native.",
    sources: [
      { label: "Business of Apps — App Development Cost", url: "https://www.businessofapps.com/app-developers/research/app-development-cost/" },
      { label: "Topflight Apps — App Development Costs", url: "https://topflightapps.com/ideas/app-development-costs/" },
      { label: "Netguru — Mobile App Development Cost", url: "https://www.netguru.com/blog/mobile-app-development-cost" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-612", name: "E-commerce Store Build", categoryId: "software", category: "Software & App Development",
    description: "Full storefront on Shopify or a custom stack: product catalog, payments, shipping rules, tax setup, and launch support.",
    baselinePrice: 5000, priceUnit: "flat", estimatedDuration: "3–5 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Product count & categories", "Payment and shipping needs", "Existing brand assets"],
    marketRange: "$2,000 – $5,000 mid-level customization; $10,000+ advanced builds",
    priceBasis: "Professional mid-level Shopify build (theme customization, product setup, payments/shipping/tax config); platform fees and apps billed separately.",
    sources: [
      { label: "DesignRush — Shopify Website Cost", url: "https://www.designrush.com/agency/ecommerce/trends/how-much-does-it-cost-to-build-a-shopify-website" },
      { label: "Viha Digital — Shopify Website Cost 2025", url: "https://www.vihadigitalcommerce.com/shopify-website-cost-2025/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-613", name: "Business Systems Integration & Automation", categoryId: "software", category: "Software & App Development",
    description: "Connect the tools you already use — accounting, CRM, inventory, e-commerce — with automated syncs and workflows that remove manual re-entry.",
    baselinePrice: 7500, priceUnit: "starting at", estimatedDuration: "2–4 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Systems to connect", "Current manual process", "Data volume estimates"],
    marketRange: "$3,000 – $7,500 single workflow; $10,000 – $25,000 multi-system",
    priceBasis: "Published automation-project ranges; baseline covers one to two connected systems with a single automated workflow.",
    sources: [
      { label: "Alltomate — Automation Consultant Costs", url: "https://alltomate.com/blogs/small-business-automation-consultant/" },
      { label: "Moxo — Automation Consulting Costs", url: "https://www.moxo.com/blog/ai-automation-consulting-services-cost" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-602", name: "Smart Thermostat Install", categoryId: "technology", category: "Technology",
    description: "Install and configure smart thermostat, verify C-wire, connect to Wi-Fi and mobile app.",
    baselinePrice: 200, priceUnit: "flat", estimatedDuration: "1 hour", skillLevel: "Intermediate",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Photo of current thermostat wiring", "HVAC system type", "Thermostat model"],
    marketRange: "$200 – $500 installed incl. device (labor $75 – $150/hr); C-wire adds $50 – $100",
    priceBasis: "Labor-only baseline for a customer-supplied thermostat with existing compatible wiring; C-wire installation quoted as an add-on.",
    sources: [
      { label: "HomeGuide — Smart Thermostat Installation Cost", url: "https://homeguide.com/costs/smart-thermostat-installation-cost" },
      { label: "HomeAdvisor — Smart Thermostat Installation", url: "https://www.homeadvisor.com/cost/heating-and-cooling/smart-thermostat-installation/" },
      { label: "Fixr — Smart Thermostat Installation Cost", url: "https://www.fixr.com/costs/smart-thermostat-installation" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-701", name: "Deep Clean — 3BR Home", categoryId: "cleaning", category: "Cleaning",
    description: "Top-to-bottom deep clean: kitchen, baths, baseboards, interior windows, and appliance exteriors.",
    baselinePrice: 300, priceUnit: "flat", estimatedDuration: "4–5 hours", skillLevel: "Entry",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Square footage", "Pets in home", "Areas of focus"],
    marketRange: "$180 – $375 national (3BR/2BA flat rates $200 – $400)",
    priceBasis: "National deep-clean average adjusted for a 3-bedroom, 2-bath single-family home.",
    sources: [
      { label: "Angi — Deep Cleaning House Cost", url: "https://www.angi.com/articles/deep-cleaning-house-cost.htm" },
      { label: "HomeGuide — House Cleaning Prices", url: "https://homeguide.com/costs/house-cleaning-prices" },
      { label: "Fixr — Deep House Cleaning Cost", url: "https://www.fixr.com/costs/deep-house-cleaning" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-311", name: "Commercial Office Build-Out", categoryId: "construction", category: "Commercial Construction",
    description: "Tenant improvement build-out: framing, electrical, HVAC coordination, finishes, and inspections. Managed in phases with staged payments and city permit coordination.",
    baselinePrice: 50000, priceUnit: "starting at", estimatedDuration: "6–12 weeks", skillLevel: "Specialist",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Floor plan or as-built drawings", "Square footage", "Landlord requirements", "Target occupancy date"],
    marketRange: "$50 – $150 per sq ft (basic); $100 – $175 mid-range; $175 – $300+ high-end",
    priceBasis: "National tenant-improvement averages; baseline reflects a ~1,000 sq ft basic build-out. Final pricing is quoted per square foot after plan review.",
    sources: [
      { label: "LoopNet — Cost to Build Out Office Space", url: "https://www.loopnet.com/cre-explained/investing/how-much-does-it-cost-to-build-out-office-space/" },
      { label: "BuildNP — Tenant Improvement Costs per Sq Ft", url: "https://buildnp.com/blogs/tenant-improvement-costs-per-square-foot/" },
      { label: "WeWork Ideas — Commercial Build-Out Costs", url: "https://www.wework.com/ideas/professional-development/business-solutions/commercial-real-estate-build-out-costs" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-901", name: "Logo & Brand Identity Package", categoryId: "creative", category: "Creative & Design",
    description: "Logo suite, color system, typography, and brand guidelines document. Includes three concept directions and two revision rounds.",
    baselinePrice: 3500, priceUnit: "flat", estimatedDuration: "2–3 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Business description & audience", "Brands you admire", "Existing assets, if any"],
    marketRange: "$2,000 – $10,000 small-business full identity; logo alone $250 – $1,000",
    priceBasis: "Lower-middle of the small-business identity-package range: logo suite, color, typography, and guidelines from an experienced independent studio.",
    sources: [
      { label: "Looka — How Much Does a Logo Cost", url: "https://looka.com/blog/how-much-does-a-logo-cost/" },
      { label: "TL Design Studios — Brand Identity Packages", url: "https://www.tldesignstudios.com/brand-identity-packages-complete-guide-for-small-businesses/" },
      { label: "DesignRush — Branding Costs Breakdown", url: "https://www.designrush.com/agency/logo-branding/trends/how-much-does-branding-cost" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-902", name: "Product Photography Session", categoryId: "creative", category: "Creative & Design",
    description: "Studio session covering up to 20 products with lighting, styling, retouching, and web-ready exports.",
    baselinePrice: 1200, priceUnit: "per session", estimatedDuration: "1 day + 3-day edit", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Product count & dimensions", "Intended use (web, print, ads)", "Style references"],
    marketRange: "$500 – $3,000 per shoot; white-background shots $25 – $50 per image",
    priceBasis: "Half-day studio session at $25–$50 per finished image for ~20–30 white-background shots, retouching included.",
    sources: [
      { label: "Squareshot — Product Photography Rates", url: "https://www.squareshot.com/post/the-essential-guide-to-product-photography-rates-for-11-50-images" },
      { label: "Mark Mendoza — Product Photography Pricing", url: "https://markmendozaphoto.com/product-photography/product-photography-pricing/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-903", name: "Promotional Video (60–90 sec)", categoryId: "creative", category: "Creative & Design",
    description: "Scripted promo video: pre-production, half-day shoot, editing, motion graphics, and licensed music.",
    baselinePrice: 4500, priceUnit: "flat", estimatedDuration: "2–4 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Goal & audience", "Filming location", "Example videos you like"],
    marketRange: "$1,000 – $16,000 (60-sec avg ≈ $2,900 – $6,400 US); pro explainers $5,000 – $15,000",
    priceBasis: "US average for a professionally produced 60–90 second live-action promo with half-day shoot, editing, and licensed music.",
    sources: [
      { label: "Advids — 60-Second Promo Video Cost", url: "https://advids.co/pricing/how-much-company-promotional-video-creation-cost" },
      { label: "Vidico — Promo Video Pricing Guide", url: "https://vidico.com/news/promo-video-pricing/" },
      { label: "Yans Media — Promo Video Pricing", url: "https://www.yansmedia.com/blog/promo-video-pricing" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-911", name: "SEO Audit & Strategy", categoryId: "marketing", category: "Marketing & Growth",
    description: "Full technical and content audit, keyword strategy, competitor analysis, and a prioritized 90-day roadmap.",
    baselinePrice: 1800, priceUnit: "flat", estimatedDuration: "1–2 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Website URL", "Target customers & regions", "Analytics access"],
    marketRange: "$500 – $2,500 freelancer/small agency; small-business sites $1,500 – $3,000",
    priceBasis: "Experienced-provider audit of a small business site (manual + automated analysis, keyword strategy, prioritized roadmap).",
    sources: [
      { label: "WebFX — SEO Audit Pricing", url: "https://www.webfx.com/seo/pricing/how-much-does-seo-audit-cost/" },
      { label: "SEOProfy — SEO Audit Pricing", url: "https://seoprofy.com/blog/seo-audit-pricing/" },
      { label: "Kleverish — 2025 SEO Audit Pricing", url: "https://www.kleverish.com/blog/2025-seo-audit-pricing-explained/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-912", name: "Paid Ads Management", categoryId: "marketing", category: "Marketing & Growth",
    description: "Google and Meta campaign setup and ongoing management: creative testing, budget optimization, and monthly reporting.",
    baselinePrice: 1200, priceUnit: "per month", estimatedDuration: "Ongoing", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Monthly ad budget", "Target audience", "Current campaigns, if any"],
    marketRange: "$800 – $2,500/mo small business, or 10 – 20% of ad spend; setup $500 – $2,000",
    priceBasis: "Flat-retainer midpoint for small-business accounts; ad spend billed directly to your ad accounts and never marked up.",
    sources: [
      { label: "OuterBox — PPC Management Pricing", url: "https://www.outerboxdesign.com/articles/paid-media/google-ads-management-agency/ppc-management-pricing-fees/" },
      { label: "AgencyAnalytics — PPC Pricing Guide", url: "https://agencyanalytics.com/blog/ppc-pricing" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-921", name: "Monthly Bookkeeping", categoryId: "professional", category: "Professional Services",
    description: "Transaction categorization, reconciliation, monthly financial statements, and quarter-end review for small businesses.",
    baselinePrice: 550, priceUnit: "per month", estimatedDuration: "Ongoing", skillLevel: "Licensed Pro",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Accounting software used", "Monthly transaction volume", "Number of accounts"],
    marketRange: "$300 – $900/mo typical small business; up to $1,200+ with high volume",
    priceBasis: "Mid-range for outsourced monthly bookkeeping with reconciliations and monthly financials at moderate transaction volume.",
    sources: [
      { label: "NerdWallet — Bookkeeping Prices", url: "https://www.nerdwallet.com/business/software/learn/bookkeeping-pricing" },
      { label: "CoCountant — Bookkeeping Cost Monthly", url: "https://cocountant.com/blog/small-business-bookkeeping-cost-monthly/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-922", name: "Business Tax Return Preparation", categoryId: "professional", category: "Professional Services",
    description: "Federal and state business return preparation and filing by a licensed CPA, including deduction review.",
    baselinePrice: 1200, priceUnit: "flat", estimatedDuration: "1–2 weeks", skillLevel: "Licensed Pro",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Entity type", "Prior-year return", "Bookkeeping status"],
    marketRange: "LLC $490 – $1,600; S-Corp $800 – $3,500 (basic filing $800 – $1,200)",
    priceBasis: "CPA-prepared federal + state return for a single-state LLC or basic S-Corp with clean books; additional K-1s and states quoted per item.",
    sources: [
      { label: "SDO CPA — Business Tax Preparation Cost", url: "https://www.sdocpa.com/business-tax-preparation-cost/" },
      { label: "BPA — Average LLC Tax Preparation Cost", url: "https://bpa.tax/average-llc-tax-preparation-cost-2025-complete-pricing-data-analysis/" },
      { label: "1-800Accountant — CPA Tax Prep Cost", url: "https://1800accountant.com/blog/cost-of-tax-preparation-by-cpa-for-small-business" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-931", name: "Corporate Event Catering", categoryId: "events", category: "Events & Catering",
    description: "Full-service catering for corporate events: menu planning, staffing, setup, service, and cleanup. Licensed and insured.",
    baselinePrice: 40, priceUnit: "per person", estimatedDuration: "Event day", skillLevel: "Licensed Pro",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Headcount", "Venue & date", "Dietary requirements", "Service style (buffet, plated)"],
    marketRange: "Buffet $25 – $50/person; plated $50 – $120; drop-off $12 – $20",
    priceBasis: "Mid-range attended buffet with setup and cleanup; service fees and tax (typically 7–9%) itemized on the proposal.",
    sources: [
      { label: "CaterCow — Corporate Catering Cost per Person", url: "https://www.catercow.com/blog/how-much-does-corporate-catering-cost-per-person" },
      { label: "Spork Bytes — Corporate Event Catering Cost", url: "https://www.sporkbytes.com/corporate-event-catering-cost/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-932", name: "Event AV & Production", categoryId: "events", category: "Events & Catering",
    description: "Sound, projection, lighting, and on-site technician for meetings and events up to 500 attendees.",
    baselinePrice: 2500, priceUnit: "per event", estimatedDuration: "Event day + setup", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Venue & room specs", "Attendee count", "Program schedule"],
    marketRange: "Basic packages $800 – $1,500; mid-size meetings $3,000 – $10,000+",
    priceBasis: "Meeting-scale package (PA, wireless mics, projection, on-site tech); multi-day conferences and video walls quoted per project.",
    sources: [
      { label: "DJC West — Event AV Cost Guide", url: "https://www.djcwest.com/how-much-does-event-av-cost/" },
      { label: "Centric Events — Conference AV Costs", url: "https://centric.events/blog/how-much-does-av-cost-for-a-conference-with-a-real-world-examples/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-801", name: "Move Furniture Locally", categoryId: "moving", category: "Moving & Hauling",
    description: "Two movers and a truck for local moves up to 15 miles. Pads, straps, and basic disassembly included.",
    baselinePrice: 420, priceUnit: "up to 3 hrs", estimatedDuration: "3 hours", skillLevel: "Entry",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Item list or photos", "Stairs or elevator", "Both addresses"],
    marketRange: "$90 – $160/hr for 2 movers + truck (avg ≈ $140/hr); 2–4 hr minimums common",
    priceBasis: "Three hours at the national average hourly rate for a two-mover crew with truck, pads, and straps.",
    sources: [
      { label: "MoveBuddha — Moving Cost Calculator", url: "https://www.movebuddha.com/moving-cost-calculator/" },
      { label: "Angi — How Much Do Movers Cost", url: "https://www.angi.com/articles/how-much-does-it-cost-hire-movers.htm" },
      { label: "Freightwaves — Local Mover Hourly Rates", url: "https://www.freightwaves.com/checkpoint/average-hourly-rate-for-local-movers/" },
    ],
    lastVerified: "2026-07-03",
  },
  {
    id: "svc-103", name: "Drain Cleaning", categoryId: "plumbing", category: "Plumbing",
    description: "Clear one clogged sink, tub, shower, or toilet drain with a professional cable machine and verify normal flow.",
    baselinePrice: 250, priceUnit: "flat", estimatedDuration: "1–2 hours", skillLevel: "Licensed Pro",
    requiresPhotos: true, requiresMeasurements: false,
    requiredInfo: ["Affected fixture", "How long it has been clogged", "Whether multiple drains are affected"],
    marketRange: "$147 – $352 for a standard fixture drain; main sewer lines cost more",
    priceBasis: "Rounded national average for clearing one accessible fixture drain during normal business hours; camera inspection and main-line work are separate.",
    sources: [
      { label: "Angi — Drain Cleaning Cost", url: "https://www.angi.com/articles/how-much-does-drain-cleaning-cost.htm" },
      { label: "HomeGuide — Drain Cleaning Cost", url: "https://homeguide.com/costs/drain-cleaning-cost" },
      { label: "Forbes Home — Drain Cleaning Cost", url: "https://www.forbes.com/home-improvement/plumbing/drain-cleaning-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-203", name: "Install Electrical Outlet or GFCI", categoryId: "electrical", category: "Electrical",
    description: "Install one new standard or GFCI receptacle near an existing circuit, including box, device, testing, and code-compliant labeling.",
    baselinePrice: 300, priceUnit: "per outlet", estimatedDuration: "1–3 hours", skillLevel: "Licensed Pro",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Desired outlet location", "Nearest existing outlet or panel", "Standard, GFCI, USB, or other type"],
    marketRange: "$100 – $450 per outlet; new wiring, permits, and wall repair may add $150 – $1,000+",
    priceBasis: "National average for one professionally installed receptacle with straightforward access to an existing circuit.",
    sources: [
      { label: "Angi — Outlet Installation Cost", url: "https://www.angi.com/articles/how-much-does-it-cost-install-outlet.htm" },
      { label: "HomeAdvisor — Electrical Outlet Installation", url: "https://www.homeadvisor.com/cost/electrical/install-an-outlet/" },
      { label: "Fixr — Electrical Outlet Installation Cost", url: "https://www.fixr.com/costs/electrical-outlet-installation" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-303", name: "Interior Painting", categoryId: "remodeling", category: "Remodeling",
    description: "Prepare and paint walls and ceilings in a furnished or vacant home with two finish coats; trim and repairs are quoted separately.",
    baselinePrice: 2000, priceUnit: "starting at", estimatedDuration: "2–4 days", skillLevel: "Intermediate",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Rooms and square footage", "Ceiling height", "Current and desired colors", "Occupied or vacant"],
    marketRange: "$960 – $3,100 for a typical home interior; about $2 – $6 per sq ft",
    priceBasis: "Rounded national average for a standard interior repaint with routine preparation and two coats.",
    sources: [
      { label: "Angi — Interior Painting Cost", url: "https://www.angi.com/articles/cost-paint-interior-house.htm" },
      { label: "HomeAdvisor — Interior Painting Cost", url: "https://www.homeadvisor.com/cost/painting/paint-a-home-interior/" },
      { label: "Forbes Home — Interior Painting Cost", url: "https://www.forbes.com/home-improvement/painting/interior-painting-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-312", name: "Commercial Tenant Improvement Package", categoryId: "construction", category: "Commercial Construction",
    description: "Design coordination, permitting, selective demolition, partitions, MEP coordination, finishes, and inspections for an occupied or vacant commercial suite.",
    baselinePrice: 100, priceUnit: "per sq ft", estimatedDuration: "8–16 weeks", skillLevel: "Specialist",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Floor plan and square footage", "Existing condition", "Landlord work letter", "Use and occupancy target"],
    marketRange: "$50 – $150 per sq ft for basic work; $100 – $250+ for mid- to high-finish projects",
    priceBasis: "Planning baseline for a conventional office or retail tenant improvement with moderate finishes; quoted after plans and landlord requirements are reviewed.",
    sources: [
      { label: "LoopNet — Office Build-Out Cost", url: "https://www.loopnet.com/cre-explained/investing/how-much-does-it-cost-to-build-out-office-space/" },
      { label: "Buildrite — Tenant Improvement Cost Guide", url: "https://buildriteconstruction.com/tenant-improvement-cost-guide/" },
      { label: "Hughes Marino — Tenant Improvement Allowance", url: "https://hughesmarino.com/blog/2024/06/11/how-much-should-your-tenant-improvement-allowance-be/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-614", name: "Website Redesign", categoryId: "software", category: "Software & App Development",
    description: "Redesign and rebuild an existing small-business website with responsive layouts, content migration, analytics, SEO foundations, and launch support.",
    baselinePrice: 6500, priceUnit: "starting at", estimatedDuration: "4–8 weeks", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Current website URL", "Page and content inventory", "Business goals", "Required integrations"],
    marketRange: "$3,000 – $15,000 for a small-business redesign; complex custom sites cost more",
    priceBasis: "Mid-market baseline for redesigning and rebuilding a 5–15 page business site with content migration and standard integrations.",
    sources: [
      { label: "WebFX — Website Redesign Cost", url: "https://www.webfx.com/web-design/pricing/website-redesign-cost/" },
      { label: "Forbes Advisor — Website Cost", url: "https://www.forbes.com/advisor/business/software/how-much-does-a-website-cost/" },
      { label: "Clutch — Web Design Pricing Guide", url: "https://clutch.co/web-designers/pricing" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-904", name: "Social Media Graphics Package", categoryId: "creative", category: "Creative & Design",
    description: "A coordinated set of 12 branded social posts with editable templates, platform-ready exports, and two revision rounds.",
    baselinePrice: 900, priceUnit: "per package", estimatedDuration: "1–2 weeks", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Brand assets", "Target platforms", "Post topics and calls to action", "Preferred visual examples"],
    marketRange: "$500 – $1,500 for a 10–15 asset package; custom illustration or animation costs more",
    priceBasis: "Midpoint for twelve professionally designed static assets using an established brand system, including editable source templates.",
    sources: [
      { label: "Upwork — Graphic Designer Rates", url: "https://www.upwork.com/hire/graphic-designers/cost/" },
      { label: "Thumbtack — Graphic Design Prices", url: "https://www.thumbtack.com/p/graphic-design-prices" },
      { label: "DesignRush — Graphic Design Cost", url: "https://www.designrush.com/agency/graphic-design/trends/graphic-design-cost" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-913", name: "Social Media Management", categoryId: "marketing", category: "Marketing & Growth",
    description: "Monthly content planning, creation, scheduling, community monitoring, and performance reporting for up to three social platforms.",
    baselinePrice: 1500, priceUnit: "per month", estimatedDuration: "Ongoing", skillLevel: "Specialist",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Platforms and account access", "Audience and goals", "Brand assets", "Approval contact"],
    marketRange: "$750 – $2,500 per month for a small business; paid media spend is separate",
    priceBasis: "Mid-range retainer for strategy, 12–16 original monthly posts, scheduling, light community management, and reporting across up to three platforms.",
    sources: [
      { label: "WebFX — Social Media Pricing", url: "https://www.webfx.com/social-media/pricing/" },
      { label: "Sprout Social — Social Media Management Cost", url: "https://sproutsocial.com/insights/social-media-management-cost/" },
      { label: "Clutch — Social Media Marketing Pricing", url: "https://clutch.co/agencies/social-media-marketing/pricing" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-923", name: "Payroll Administration", categoryId: "professional", category: "Professional Services",
    description: "Recurring payroll processing, direct-deposit coordination, payroll tax calculations and filings, and year-end W-2 or 1099 preparation.",
    baselinePrice: 150, priceUnit: "per month", estimatedDuration: "Ongoing", skillLevel: "Licensed Pro",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Employee and contractor count", "Pay frequency", "States of employment", "Current payroll system"],
    marketRange: "$40 – $200 monthly base fee plus $4 – $10 per worker",
    priceBasis: "Representative monthly cost for a small employer with up to ten workers, standard payroll runs, tax filing, and year-end forms.",
    sources: [
      { label: "Forbes Advisor — Payroll Service Cost", url: "https://www.forbes.com/advisor/business/software/payroll-services-cost/" },
      { label: "QuickBooks — Payroll Pricing", url: "https://quickbooks.intuit.com/payroll/pricing/" },
      { label: "Gusto — Payroll Pricing", url: "https://gusto.com/product/pricing" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-933", name: "Event Photography", categoryId: "events", category: "Events & Catering",
    description: "Professional photography for a corporate or private event, including four hours of coverage, edited high-resolution images, and online delivery.",
    baselinePrice: 1000, priceUnit: "up to 4 hrs", estimatedDuration: "Event + 1 week editing", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Event date and venue", "Schedule and guest count", "Priority shots", "Usage requirements"],
    marketRange: "$150 – $300 per hour; $600 – $1,500 for four-hour coverage",
    priceBasis: "Four hours of single-photographer coverage at a mid-market hourly rate, including culling, color correction, and digital delivery.",
    sources: [
      { label: "Thumbtack — Event Photography Prices", url: "https://www.thumbtack.com/p/event-photography-prices" },
      { label: "Fash — Event Photographer Cost", url: "https://fash.com/costs/event-photographer-cost" },
      { label: "Peerspace — Event Photographer Cost", url: "https://www.peerspace.com/resources/event-photographer-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-402", name: "Oil and Filter Change", categoryId: "automotive", category: "Automotive",
    description: "Replace engine oil and filter with manufacturer-specified products, inspect fluid levels and tires, and reset the maintenance reminder.",
    baselinePrice: 90, priceUnit: "flat", estimatedDuration: "30–60 minutes", skillLevel: "Intermediate",
    requiresPhotos: false, requiresMeasurements: false,
    requiredInfo: ["Year, make, model, and engine", "Current mileage", "Conventional blend or full synthetic"],
    marketRange: "$35 – $125 depending on oil type, capacity, and vehicle",
    priceBasis: "Typical full-synthetic oil and filter service for a passenger vehicle using up to five quarts.",
    sources: [
      { label: "Kelley Blue Book — Oil Change Prices", url: "https://www.kbb.com/oil-change/" },
      { label: "J.D. Power — Oil Change Cost", url: "https://www.jdpower.com/cars/shopping-guides/how-much-is-an-oil-change" },
      { label: "Car and Driver — Oil Change Cost", url: "https://www.caranddriver.com/auto-loans/a41500167/oil-change-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-503", name: "Gutter Cleaning", categoryId: "lawn", category: "Lawn & Property",
    description: "Remove roofline gutter debris, flush downspouts, bag waste, and report visible leaks or loose hardware on a one-story home.",
    baselinePrice: 170, priceUnit: "flat", estimatedDuration: "1–3 hours", skillLevel: "Intermediate",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Home stories", "Approximate linear feet", "Gutter guards", "Known downspout clogs"],
    marketRange: "$119 – $234 for a typical one-story home; height and guards increase cost",
    priceBasis: "Rounded national average for cleaning accessible gutters and flushing downspouts on a one-story home.",
    sources: [
      { label: "Angi — Gutter Cleaning Cost", url: "https://www.angi.com/articles/how-much-does-gutter-cleaning-cost.htm" },
      { label: "HomeGuide — Gutter Cleaning Cost", url: "https://homeguide.com/costs/gutter-cleaning-cost" },
      { label: "Forbes Home — Gutter Cleaning Cost", url: "https://www.forbes.com/home-improvement/gutter/gutter-cleaning-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-603", name: "Home Wi-Fi and Network Setup", categoryId: "technology", category: "Technology",
    description: "Install and configure a customer-supplied router or mesh system, optimize placement, secure the network, and connect up to ten devices.",
    baselinePrice: 225, priceUnit: "flat", estimatedDuration: "2–3 hours", skillLevel: "Intermediate",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Home square footage and levels", "Internet provider and plan", "Current equipment", "Coverage trouble spots"],
    marketRange: "$100 – $500 for setup and optimization; cabling and hardware are additional",
    priceBasis: "Mid-range labor allowance for installing and optimizing a router or small mesh system without new in-wall Ethernet cabling.",
    sources: [
      { label: "Angi — Home Network Installation Cost", url: "https://www.angi.com/articles/home-network-installation-cost.htm" },
      { label: "HomeAdvisor — Computer Network Installation", url: "https://www.homeadvisor.com/cost/home-offices/install-computer-network-or-wiring/" },
      { label: "HelloTech — Wi-Fi and Network Services", url: "https://www.hellotech.com/tech-support/wifi-network-connectivity" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-702", name: "Move-Out Cleaning", categoryId: "cleaning", category: "Cleaning",
    description: "Vacant-home cleaning for kitchens, bathrooms, floors, baseboards, cabinets, and appliance interiors, ready for a landlord or buyer walkthrough.",
    baselinePrice: 275, priceUnit: "flat", estimatedDuration: "4–6 hours", skillLevel: "Entry",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Square footage", "Bedrooms and bathrooms", "Property condition", "Required add-ons"],
    marketRange: "$120 – $420 depending on home size and condition",
    priceBasis: "Mid-range allowance for a vacant two- to three-bedroom home, including common move-out details but excluding carpet extraction and junk removal.",
    sources: [
      { label: "Angi — Move-Out Cleaning Cost", url: "https://www.angi.com/articles/how-much-cost-move-out-cleaning.htm" },
      { label: "HomeGuide — Move-Out Cleaning Cost", url: "https://homeguide.com/costs/move-out-cleaning-cost" },
      { label: "Thumbtack — Move-Out Cleaning Cost", url: "https://www.thumbtack.com/p/move-out-cleaning-cost" },
    ],
    lastVerified: "2026-07-04",
  },
  {
    id: "svc-802", name: "Junk Removal", categoryId: "moving", category: "Moving & Hauling",
    description: "Load, haul, and responsibly dispose of up to one-quarter truckload of household junk, furniture, or boxed debris.",
    baselinePrice: 250, priceUnit: "per 1/4 truck", estimatedDuration: "1–2 hours", skillLevel: "Entry",
    requiresPhotos: true, requiresMeasurements: true,
    requiredInfo: ["Photos or item list", "Access and stairs", "Hazardous or unusually heavy items", "Pickup location"],
    marketRange: "$150 – $350 for a quarter truckload; full loads commonly cost $400 – $800",
    priceBasis: "Midpoint for a small, photo-verified residential load with labor, transportation, and ordinary disposal fees included.",
    sources: [
      { label: "Angi — Junk Removal Cost", url: "https://www.angi.com/articles/how-much-does-junk-removal-cost.htm" },
      { label: "HomeGuide — Junk Removal Prices", url: "https://homeguide.com/costs/junk-removal-prices" },
      { label: "Forbes Home — Junk Removal Cost", url: "https://www.forbes.com/home-improvement/moving-services/junk-removal-cost/" },
    ],
    lastVerified: "2026-07-04",
  },
];

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export const providers: Provider[] = [
  {
    id: "prv-11", name: "Marcus Webb", company: "Webb Plumbing Co.", trade: "Plumbing",
    rating: 4.9, jobsCompleted: 142, status: "Approved",
    qualifications: ["Replace Toilet", "Water Heater Replacement (40–50 gal)"],
  },
  {
    id: "prv-12", name: "Dana Ruiz", company: "Ruiz Electric LLC", trade: "Electrical",
    rating: 4.8, jobsCompleted: 98, status: "Approved",
    qualifications: ["Install Ceiling Fan", "Electrical Panel Upgrade (200A)", "Smart Thermostat Install"],
  },
  {
    id: "prv-13", name: "Tom Askew", company: "Askew Renovations", trade: "Remodeling",
    rating: 4.7, jobsCompleted: 61, status: "Approved",
    qualifications: ["Bathroom Remodel (Full)", "Repair Drywall"],
  },
  {
    id: "prv-14", name: "Priya Nair", company: "Nair Digital", trade: "Technology",
    rating: 5.0, jobsCompleted: 37, status: "Approved",
    qualifications: ["Build Website Landing Page"],
  },
  {
    id: "prv-15", name: "Jake Moreland", company: "Moreland Outdoor", trade: "Lawn & Property",
    rating: 4.6, jobsCompleted: 210, status: "In Screening",
    qualifications: ["Pressure Wash Driveway", "Mow Residential Lawn"],
  },
  {
    id: "prv-16", name: "Alex Fontaine", company: "Codeline Studios", trade: "Software Development",
    rating: 4.9, jobsCompleted: 24, status: "Approved",
    qualifications: ["Custom Web Application (MVP)", "Business Systems Integration & Automation", "E-commerce Store Build"],
  },
  {
    id: "prv-17", name: "Maya Kessler", company: "Kestrel Software Group", trade: "Software Development",
    rating: 4.8, jobsCompleted: 0, status: "In Screening",
    qualifications: ["Mobile App Development (iOS & Android)", "Custom Web Application (MVP)"],
  },
  {
    id: "prv-18", name: "Elena Voss", company: "Harper & Voss CPA", trade: "Professional Services",
    rating: 4.9, jobsCompleted: 88, status: "Approved",
    qualifications: ["Monthly Bookkeeping", "Business Tax Return Preparation"],
  },
  {
    id: "prv-19", name: "Marcus Oduya", company: "Golden Hour Creative", trade: "Creative & Design",
    rating: 4.8, jobsCompleted: 53, status: "Approved",
    qualifications: ["Logo & Brand Identity Package", "Product Photography Session", "Promotional Video (60–90 sec)"],
  },
  {
    id: "prv-20", name: "Rosa Delgado", company: "Verde Catering Co.", trade: "Events & Catering",
    rating: 4.7, jobsCompleted: 129, status: "Approved",
    qualifications: ["Corporate Event Catering"],
  },
];

// ---------------------------------------------------------------------------
// Quote requests
// ---------------------------------------------------------------------------

export const quoteRequests: QuoteRequest[] = [
  {
    id: "QR-3021", serviceId: "svc-101", serviceName: "Replace Toilet", customer: "Sarah Mitchell",
    location: "Austin, TX 78704", urgency: "Standard", submittedDate: "2026-06-28",
    status: "Quoted", estimateLow: 295, estimateHigh: 380,
  },
  {
    id: "QR-3025", serviceId: "svc-302", serviceName: "Bathroom Remodel (Full)", customer: "Sarah Mitchell",
    location: "Austin, TX 78704", urgency: "Standard", submittedDate: "2026-06-30",
    status: "Under Review", estimateLow: 9200, estimateHigh: 14500,
  },
  {
    id: "QR-3018", serviceId: "svc-201", serviceName: "Install Ceiling Fan", customer: "David Chen",
    location: "Round Rock, TX 78665", urgency: "Priority", submittedDate: "2026-06-26",
    status: "Accepted", estimateLow: 170, estimateHigh: 220,
  },
  {
    id: "QR-3011", serviceId: "svc-601", serviceName: "Build Website Landing Page", customer: "Kelly Tran",
    location: "Remote", urgency: "Standard", submittedDate: "2026-06-21",
    status: "Submitted", estimateLow: 1300, estimateHigh: 1800,
  },
  {
    id: "QR-3026", serviceId: "svc-610", serviceName: "Custom Web Application (MVP)", customer: "Hartwell Supply Co.",
    location: "Austin, TX 78702", urgency: "Standard", submittedDate: "2026-07-01",
    status: "Under Review", estimateLow: 15800, estimateHigh: 24500,
  },
  {
    id: "QR-3023", serviceId: "svc-613", serviceName: "Business Systems Integration & Automation", customer: "Lakeline Dental",
    location: "Cedar Park, TX 78613", urgency: "Standard", submittedDate: "2026-06-29",
    status: "Submitted", estimateLow: 3600, estimateHigh: 5200,
  },
  {
    id: "QR-3028", serviceId: "svc-901", serviceName: "Logo & Brand Identity Package", customer: "Sarah Mitchell",
    location: "Austin, TX 78702", urgency: "Standard", submittedDate: "2026-07-02",
    status: "Submitted", estimateLow: 2100, estimateHigh: 2900,
  },
  {
    id: "QR-3027", serviceId: "svc-931", serviceName: "Corporate Event Catering", customer: "Stonebridge Realty",
    location: "Austin, TX 78701", urgency: "Priority", submittedDate: "2026-07-01",
    status: "Under Review", estimateLow: 4100, estimateHigh: 5300,
  },
  {
    id: "QR-3024", serviceId: "svc-311", serviceName: "Commercial Office Build-Out", customer: "Trellis Insurance Group",
    location: "Austin, TX 78746", urgency: "Standard", submittedDate: "2026-06-30",
    status: "Under Review", estimateLow: 52000, estimateHigh: 78000,
  },
  {
    id: "QR-3019", serviceId: "svc-922", serviceName: "Business Tax Return Preparation", customer: "Vega Landscaping LLC",
    location: "Buda, TX 78610", urgency: "Standard", submittedDate: "2026-06-27",
    status: "Quoted", estimateLow: 1050, estimateHigh: 1400,
  },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: "PRJ-2041",
    name: "Bathroom Remodel — Master Bath",
    customer: "Sarah Mitchell",
    status: "In Progress",
    budget: 12400,
    paidToDate: 4960,
    startDate: "2026-06-08",
    targetDate: "2026-07-24",
    location: "Austin, TX 78704",
    description:
      "Full gut remodel of 9×11 master bathroom. New walk-in shower with frameless glass, double vanity, tile flooring, and updated lighting. Permits pulled through Baseline.",
    milestones: [
      {
        id: "ms-1", name: "Phase 1 — Planning & Measurements",
        description: "Site measurement, fixture selection sign-off, permit filing, and material ordering.",
        status: "Complete", dueDate: "2026-06-12", amount: 1240, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-2", name: "Phase 2 — Demolition",
        description: "Remove existing fixtures, tile, vanity, and drywall. Debris haul-away and site protection.",
        status: "Complete", dueDate: "2026-06-19", amount: 1860, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-3", name: "Phase 3 — Rough Plumbing & Electrical",
        description: "Relocate shower drain, new supply lines, GFCI circuits, and vent fan wiring. City rough-in inspection.",
        status: "In Progress", dueDate: "2026-07-03", amount: 3100, paymentStatus: "In Escrow", completion: 65,
      },
      {
        id: "ms-4", name: "Phase 4 — Walls, Flooring & Tile",
        description: "Cement board, waterproofing, porcelain floor tile, and shower surround tile with niche.",
        status: "Not Started", dueDate: "2026-07-15", amount: 3720, paymentStatus: "Not Due", completion: 0,
      },
      {
        id: "ms-5", name: "Phase 5 — Fixture Install & Final Walkthrough",
        description: "Set vanity, toilet, glass, lighting, and hardware. Final inspection and customer sign-off.",
        status: "Not Started", dueDate: "2026-07-24", amount: 2480, paymentStatus: "Not Due", completion: 0,
      },
    ],
    tasks: [
      { id: "t-1", name: "City rough-in inspection scheduled", milestone: "Phase 3", assignee: "Marcus Webb", status: "In Progress" },
      { id: "t-2", name: "Confirm tile delivery (July 8)", milestone: "Phase 4", assignee: "Baseline Ops", status: "To Do" },
      { id: "t-3", name: "GFCI circuit install", milestone: "Phase 3", assignee: "Dana Ruiz", status: "Done" },
      { id: "t-4", name: "Shower drain relocation", milestone: "Phase 3", assignee: "Marcus Webb", status: "In Progress" },
    ],
    providerIds: ["prv-11", "prv-12", "prv-13"],
    payments: [
      { id: "p-1", label: "Deposit (Phase 1)", amount: 1240, dueDate: "2026-06-08", status: "Paid" },
      { id: "p-2", label: "Phase 2 — Demolition", amount: 1860, dueDate: "2026-06-19", status: "Paid" },
      { id: "p-3", label: "Phase 3 — Rough-in", amount: 3100, dueDate: "2026-07-03", status: "In Escrow" },
      { id: "p-4", label: "Phase 4 — Tile & Flooring", amount: 3720, dueDate: "2026-07-15", status: "Not Due" },
      { id: "p-5", label: "Phase 5 — Final", amount: 2480, dueDate: "2026-07-24", status: "Not Due" },
    ],
    activity: [
      { id: "a-1", date: "2026-07-01", actor: "Dana Ruiz", action: "Marked task “GFCI circuit install” complete." },
      { id: "a-2", date: "2026-06-30", actor: "Baseline Ops", action: "Rough-in inspection scheduled with City of Austin for July 3." },
      { id: "a-3", date: "2026-06-27", actor: "Sarah Mitchell", action: "Approved Phase 2 completion and released payment." },
      { id: "a-4", date: "2026-06-24", actor: "Tom Askew", action: "Uploaded 6 photos of demolition completion." },
    ],
  },
  {
    id: "PRJ-2047",
    name: "Inventory Management System — Mitchell Outfitters",
    customer: "Mitchell Outfitters (Sarah Mitchell)",
    status: "In Progress",
    budget: 38400,
    paidToDate: 9600,
    startDate: "2026-05-18",
    targetDate: "2026-08-28",
    location: "Austin, TX / Remote",
    description:
      "Custom web-based inventory and order management system for three retail locations. Replaces spreadsheet workflows, adds barcode scanning, and syncs with QuickBooks and Shopify. Delivered in 2-week sprints with demo approval at each sprint.",
    milestones: [
      {
        id: "ms-1", name: "Phase 1 — Discovery & Requirements",
        description: "Stakeholder interviews, current-process mapping, requirements specification, and success metrics sign-off.",
        status: "Complete", dueDate: "2026-05-29", amount: 3840, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-2", name: "Phase 2 — UX Design & Technical Architecture",
        description: "Wireframes, clickable prototype, data model, and integration architecture approved by customer.",
        status: "Complete", dueDate: "2026-06-12", amount: 5760, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-3", name: "Phase 3 — Core Development (Sprints 1–3)",
        description: "Product catalog, inventory tracking, and order workflows. Sprint demo every two weeks; customer accepts each demo before the next sprint starts.",
        status: "In Progress", dueDate: "2026-07-17", amount: 11520, paymentStatus: "In Escrow", completion: 55,
      },
      {
        id: "ms-4", name: "Phase 4 — Integrations & Data Migration",
        description: "Two-way QuickBooks and Shopify sync, plus migration and validation of legacy inventory data.",
        status: "Not Started", dueDate: "2026-08-07", amount: 7680, paymentStatus: "Not Due", completion: 0,
      },
      {
        id: "ms-5", name: "Phase 5 — QA, Security Review & UAT",
        description: "Automated test suite, security review, and user acceptance testing with store managers.",
        status: "Not Started", dueDate: "2026-08-21", amount: 5760, paymentStatus: "Not Due", completion: 0,
      },
      {
        id: "ms-6", name: "Phase 6 — Deployment & Training",
        description: "Production deployment, monitoring setup, and on-site training at all three locations.",
        status: "Not Started", dueDate: "2026-08-28", amount: 3840, paymentStatus: "Not Due", completion: 0,
      },
    ],
    tasks: [
      { id: "t-1", name: "Sprint 2 demo — order workflow walkthrough", milestone: "Phase 3", assignee: "Alex Fontaine", status: "In Progress" },
      { id: "t-2", name: "Barcode scanning module", milestone: "Phase 3", assignee: "Codeline Studios", status: "In Progress" },
      { id: "t-3", name: "Provide QuickBooks sandbox credentials", milestone: "Phase 4", assignee: "Baseline Ops", status: "To Do" },
      { id: "t-4", name: "Data model review & sign-off", milestone: "Phase 2", assignee: "Priya Nair", status: "Done" },
      { id: "t-5", name: "Export legacy inventory spreadsheets", milestone: "Phase 4", assignee: "Mitchell Outfitters", status: "To Do" },
    ],
    providerIds: ["prv-16", "prv-14"],
    payments: [
      { id: "p-1", label: "Deposit — Phase 1 Discovery", amount: 3840, dueDate: "2026-05-18", status: "Paid" },
      { id: "p-2", label: "Phase 2 — Design & Architecture", amount: 5760, dueDate: "2026-06-12", status: "Paid" },
      { id: "p-3", label: "Phase 3 — Development Sprints 1–3", amount: 11520, dueDate: "2026-07-17", status: "In Escrow" },
      { id: "p-4", label: "Phase 4 — Integrations & Migration", amount: 7680, dueDate: "2026-08-07", status: "Not Due" },
      { id: "p-5", label: "Phase 5 — QA & Security", amount: 5760, dueDate: "2026-08-21", status: "Not Due" },
      { id: "p-6", label: "Phase 6 — Deployment & Training", amount: 3840, dueDate: "2026-08-28", status: "Not Due" },
    ],
    activity: [
      { id: "a-1", date: "2026-07-01", actor: "Alex Fontaine", action: "Posted Sprint 2 progress update — order workflow 80% complete, demo scheduled July 10." },
      { id: "a-2", date: "2026-06-26", actor: "Sarah Mitchell", action: "Accepted Sprint 1 demo (product catalog & inventory tracking)." },
      { id: "a-3", date: "2026-06-13", actor: "Sarah Mitchell", action: "Approved Phase 2 deliverables and released payment from escrow." },
      { id: "a-4", date: "2026-06-10", actor: "Codeline Studios", action: "Uploaded final wireframes and integration architecture document." },
    ],
  },
  {
    id: "PRJ-2052",
    name: "Brand Refresh & Launch Campaign — Mitchell Outfitters",
    customer: "Mitchell Outfitters (Sarah Mitchell)",
    status: "In Progress",
    budget: 9500,
    paidToDate: 1150,
    startDate: "2026-06-15",
    targetDate: "2026-09-05",
    location: "Austin, TX / Remote",
    description:
      "Complete brand refresh for Mitchell Outfitters ahead of the fall season: new visual identity, refreshed website and collateral, and a six-week paid launch campaign coordinated with the new inventory system rollout.",
    milestones: [
      {
        id: "ms-1", name: "Phase 1 — Discovery & Brand Strategy",
        description: "Brand audit, customer interviews, positioning workshop, and creative brief sign-off.",
        status: "Complete", dueDate: "2026-06-26", amount: 1150, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-2", name: "Phase 2 — Logo & Visual Identity",
        description: "Three concept directions, refinement rounds, final logo suite, and brand guidelines.",
        status: "In Progress", dueDate: "2026-07-17", amount: 2400, paymentStatus: "In Escrow", completion: 70,
      },
      {
        id: "ms-3", name: "Phase 3 — Website Refresh & Collateral",
        description: "Apply new identity across the website, signage, packaging, and print collateral.",
        status: "Not Started", dueDate: "2026-08-14", amount: 3100, paymentStatus: "Not Due", completion: 0,
      },
      {
        id: "ms-4", name: "Phase 4 — Launch Campaign (6 weeks)",
        description: "Paid ads, social rollout, and email sequence with weekly performance reporting.",
        status: "Not Started", dueDate: "2026-09-05", amount: 2850, paymentStatus: "Not Due", completion: 0,
      },
    ],
    tasks: [
      { id: "t-1", name: "Review concept direction B revisions", milestone: "Phase 2", assignee: "Sarah Mitchell", status: "To Do" },
      { id: "t-2", name: "Finalize color system & typography", milestone: "Phase 2", assignee: "Marcus Oduya", status: "In Progress" },
      { id: "t-3", name: "Positioning workshop & creative brief", milestone: "Phase 1", assignee: "Golden Hour Creative", status: "Done" },
      { id: "t-4", name: "Book product photography session", milestone: "Phase 3", assignee: "Baseline Ops", status: "To Do" },
    ],
    providerIds: ["prv-19"],
    payments: [
      { id: "p-1", label: "Phase 1 — Discovery & Strategy", amount: 1150, dueDate: "2026-06-15", status: "Paid" },
      { id: "p-2", label: "Phase 2 — Visual Identity", amount: 2400, dueDate: "2026-07-17", status: "In Escrow" },
      { id: "p-3", label: "Phase 3 — Website & Collateral", amount: 3100, dueDate: "2026-08-14", status: "Not Due" },
      { id: "p-4", label: "Phase 4 — Launch Campaign", amount: 2850, dueDate: "2026-09-05", status: "Not Due" },
    ],
    activity: [
      { id: "a-1", date: "2026-07-02", actor: "Marcus Oduya", action: "Uploaded revised concept direction B with updated color system." },
      { id: "a-2", date: "2026-06-29", actor: "Sarah Mitchell", action: "Selected concept direction B for refinement." },
      { id: "a-3", date: "2026-06-26", actor: "Sarah Mitchell", action: "Approved Phase 1 and released payment from escrow." },
    ],
  },
  {
    id: "PRJ-2033",
    name: "Toilet Replacement — Hall Bath",
    customer: "Sarah Mitchell",
    status: "Complete",
    budget: 340,
    paidToDate: 340,
    startDate: "2026-05-14",
    targetDate: "2026-05-14",
    location: "Austin, TX 78704",
    description: "Replace hall bathroom toilet with customer-selected Kohler Highline. Haul away old unit.",
    milestones: [
      {
        id: "ms-1", name: "Milestone 1 — Remove Old Toilet",
        description: "Shut off supply, drain, remove unit and old wax ring, inspect flange.",
        status: "Complete", dueDate: "2026-05-14", amount: 85, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-2", name: "Milestone 2 — Install New Toilet",
        description: "Set new wax ring, mount and level unit, connect supply, and seal base.",
        status: "Complete", dueDate: "2026-05-14", amount: 170, paymentStatus: "Paid", completion: 100,
      },
      {
        id: "ms-3", name: "Milestone 3 — Test, Cleanup & Sign-off",
        description: "Leak test, flush cycles, site cleanup, haul-away, and customer walkthrough.",
        status: "Complete", dueDate: "2026-05-14", amount: 85, paymentStatus: "Paid", completion: 100,
      },
    ],
    tasks: [
      { id: "t-1", name: "Verify flange condition", milestone: "Milestone 1", assignee: "Marcus Webb", status: "Done" },
      { id: "t-2", name: "Customer walkthrough", milestone: "Milestone 3", assignee: "Marcus Webb", status: "Done" },
    ],
    providerIds: ["prv-11"],
    payments: [
      { id: "p-1", label: "Full payment on completion", amount: 340, dueDate: "2026-05-14", status: "Paid" },
    ],
    activity: [
      { id: "a-1", date: "2026-05-14", actor: "Sarah Mitchell", action: "Approved completion and released payment." },
      { id: "a-2", date: "2026-05-14", actor: "Marcus Webb", action: "Marked all milestones complete." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

export const proposals: Proposal[] = [
  {
    id: "PRO-1188",
    projectName: "Bathroom Remodel — Master Bath",
    preparedFor: {
      name: "Sarah Mitchell",
      address: "2114 Brookhaven Ln, Austin, TX 78704",
      email: "s.mitchell@example.com",
      phone: "(512) 555-0184",
    },
    date: "2026-06-02",
    validUntil: "2026-07-02",
    scope:
      "Full remodel of the 9×11 master bathroom including demolition, rough plumbing and electrical, waterproofing, tile, and fixture installation. All work performed by Baseline-screened providers with permits and inspections coordinated by Baseline.",
    phases: [
      {
        name: "Phase 1 — Planning & Measurements",
        items: [
          { description: "Site survey, measurements & design confirmation", qty: 1, unit: "service", unitPrice: 450 },
          { description: "Permit filing & coordination (City of Austin)", qty: 1, unit: "service", unitPrice: 390 },
          { description: "Material ordering & staging", qty: 1, unit: "service", unitPrice: 400 },
        ],
      },
      {
        name: "Phase 2 — Demolition",
        items: [
          { description: "Demolition labor (fixtures, tile, drywall)", qty: 16, unit: "hrs", unitPrice: 85 },
          { description: "Debris haul-away & disposal", qty: 1, unit: "load", unitPrice: 500 },
        ],
      },
      {
        name: "Phase 3 — Rough Plumbing & Electrical",
        items: [
          { description: "Rough plumbing — drain relocation & supply lines", qty: 1, unit: "service", unitPrice: 1850 },
          { description: "Electrical — GFCI circuits, vent fan, lighting rough-in", qty: 1, unit: "service", unitPrice: 1250 },
        ],
      },
      {
        name: "Phase 4 — Walls, Flooring & Tile",
        items: [
          { description: "Cement board & waterproofing membrane", qty: 1, unit: "service", unitPrice: 980 },
          { description: "Porcelain floor tile — installed", qty: 99, unit: "ft²", unitPrice: 14 },
          { description: "Shower surround tile with niche — installed", qty: 1, unit: "service", unitPrice: 1354 },
        ],
      },
      {
        name: "Phase 5 — Fixture Install & Final Walkthrough",
        items: [
          { description: "Vanity, toilet & hardware installation", qty: 1, unit: "service", unitPrice: 1130 },
          { description: "Frameless glass shower enclosure — installed", qty: 1, unit: "service", unitPrice: 1350 },
        ],
      },
    ],
    taxRate: 0.0825,
    depositPct: 0.1,
    paymentTerms: [
      "10% deposit due at acceptance to schedule the project.",
      "Each phase is invoiced on completion and released only after customer approval.",
      "Funds are held in escrow per phase and released upon your sign-off.",
      "Change requests are quoted and approved in writing before work proceeds.",
      "Proposal pricing is valid through the date listed above.",
    ],
  },
  {
    id: "PRO-1201",
    projectName: "Toilet Replacement — Hall Bath",
    preparedFor: {
      name: "James Porter",
      address: "807 Ridgeway Dr, Pflugerville, TX 78660",
      email: "j.porter@example.com",
      phone: "(512) 555-0139",
    },
    date: "2026-06-29",
    validUntil: "2026-07-29",
    scope:
      "Remove and haul away existing toilet, supply and install new Kohler Highline two-piece unit with new wax ring and supply line, leak test, and cleanup.",
    phases: [
      {
        name: "Milestone 1 — Remove Old Toilet",
        items: [{ description: "Removal, flange inspection & disposal", qty: 1, unit: "service", unitPrice: 85 }],
      },
      {
        name: "Milestone 2 — Install New Toilet",
        items: [
          { description: "Kohler Highline two-piece toilet (supplied)", qty: 1, unit: "unit", unitPrice: 189 },
          { description: "Installation labor, wax ring & supply line", qty: 1, unit: "service", unitPrice: 170 },
        ],
      },
      {
        name: "Milestone 3 — Test, Cleanup & Sign-off",
        items: [{ description: "Leak test, cleanup & customer walkthrough", qty: 1, unit: "service", unitPrice: 85 }],
      },
    ],
    taxRate: 0.0825,
    depositPct: 0,
    paymentTerms: [
      "No deposit required for single-visit services.",
      "Full payment is due on completion after your sign-off.",
      "All work is backed by the Baseline 90-day workmanship guarantee.",
    ],
  },
  {
    id: "PRO-1195",
    projectName: "Inventory Management System — Mitchell Outfitters",
    preparedFor: {
      name: "Sarah Mitchell — Mitchell Outfitters",
      address: "900 E 5th St, Suite 210, Austin, TX 78702",
      email: "sarah@mitchelloutfitters.com",
      phone: "(512) 555-0184",
    },
    date: "2026-05-04",
    validUntil: "2026-06-04",
    scope:
      "Design and build a custom web-based inventory and order management system for three retail locations, replacing spreadsheet workflows. Includes barcode scanning, role-based access, two-way QuickBooks and Shopify sync, legacy data migration, QA and security review, and on-site staff training. Work is delivered in 2-week sprints; each sprint demo requires customer acceptance before the next begins.",
    phases: [
      {
        name: "Phase 1 — Discovery & Requirements",
        items: [
          { description: "Stakeholder interviews & current-process mapping", qty: 1, unit: "service", unitPrice: 2400 },
          { description: "Requirements specification & success metrics", qty: 1, unit: "service", unitPrice: 1440 },
        ],
      },
      {
        name: "Phase 2 — UX Design & Technical Architecture",
        items: [
          { description: "Wireframes & clickable prototype", qty: 1, unit: "service", unitPrice: 3200 },
          { description: "Data model & integration architecture", qty: 1, unit: "service", unitPrice: 2560 },
        ],
      },
      {
        name: "Phase 3 — Core Development",
        items: [
          { description: "Development sprint (2-week, incl. demo & acceptance)", qty: 3, unit: "sprint", unitPrice: 3840 },
        ],
      },
      {
        name: "Phase 4 — Integrations & Data Migration",
        items: [
          { description: "QuickBooks & Shopify two-way sync", qty: 1, unit: "service", unitPrice: 4800 },
          { description: "Legacy inventory data migration & validation", qty: 1, unit: "service", unitPrice: 2880 },
        ],
      },
      {
        name: "Phase 5 — QA, Security Review & UAT",
        items: [
          { description: "Automated test suite & QA pass", qty: 1, unit: "service", unitPrice: 3600 },
          { description: "Security review & penetration test", qty: 1, unit: "service", unitPrice: 2160 },
        ],
      },
      {
        name: "Phase 6 — Deployment & Training",
        items: [
          { description: "Production deployment, monitoring & handoff docs", qty: 1, unit: "service", unitPrice: 2140 },
          { description: "On-site staff training (3 locations)", qty: 1, unit: "service", unitPrice: 1700 },
        ],
      },
    ],
    taxRate: 0,
    depositPct: 0.1,
    paymentTerms: [
      "10% deposit due at acceptance; applied to Phase 1.",
      "Each phase is funded into escrow before work begins and released on your approval.",
      "Sprint demos require written acceptance before the next sprint starts.",
      "Change requests are estimated in sprint units and approved in writing before scheduling.",
      "All source code and IP transfer to you upon final payment; 30-day post-launch warranty included.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Custom service requests
// ---------------------------------------------------------------------------

export const customRequests: CustomServiceRequest[] = [
  {
    id: "CSR-114", title: "Install EV charger in detached garage", customer: "Alan Reyes",
    location: "Cedar Park, TX", budgetRange: "$800 – $1,500", timeline: "Within a month",
    submittedDate: "2026-06-27", status: "Pending Review",
  },
  {
    id: "CSR-112", title: "Koi pond cleaning and pump replacement", customer: "Mei Watanabe",
    location: "Austin, TX", budgetRange: "$300 – $600", timeline: "Flexible",
    submittedDate: "2026-06-24", status: "Approved",
  },
  {
    id: "CSR-118", title: "Weekly office meal program for 40 staff", customer: "Stonebridge Realty",
    location: "Austin, TX", budgetRange: "$1,500 – $2,500 / month", timeline: "Within 2 weeks",
    submittedDate: "2026-07-01", status: "Pending Review",
  },
  {
    id: "CSR-116", title: "Patient scheduling portal for dental practice", customer: "Lakeline Dental",
    location: "Cedar Park, TX", budgetRange: "$15,000 – $30,000", timeline: "1–3 months",
    submittedDate: "2026-06-30", status: "Pending Review",
  },
  {
    id: "CSR-109", title: "Custom closet build-out with LED lighting", customer: "Renee Fields",
    location: "Georgetown, TX", budgetRange: "$2,000 – $4,000", timeline: "1–2 months",
    submittedDate: "2026-06-18", status: "Pending Review",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function proposalTotals(p: Proposal) {
  const base = p.phases.reduce(
    (sum, ph) => sum + ph.items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    0
  );
  const tax = base * p.taxRate;
  const total = base + tax;
  const deposit = total * p.depositPct;
  return { base, tax, total, deposit };
}

export function getService(id: string): ServiceTemplate | undefined {
  return services.find((s) => s.id === id);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getProposal(id: string): Proposal | undefined {
  return proposals.find((p) => p.id === id);
}
