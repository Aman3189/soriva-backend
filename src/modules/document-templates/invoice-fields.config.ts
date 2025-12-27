/**
 * ============================================================================
 * SORIVA TEMPLATES - INVOICE FIELDS CONFIGURATION
 * ============================================================================
 * 
 * @fileoverview Comprehensive field configuration for all invoice templates
 * @version 2.0.0
 * @author Soriva AI (Risenex Dynamics)
 * @copyright 2025 Risenex Dynamics. All rights reserved.
 * 
 * SUPPORTED INVOICE TYPES:
 * - Standard Invoice (invoice-standard.hbs)
 * - Tax Invoice / GST Invoice (invoice-tax.hbs)
 * - Proforma Invoice (invoice-proforma.hbs)
 * - Commercial Invoice (invoice-commercial.hbs)
 * - Service Invoice (invoice-service.hbs)
 * - Freelance Invoice (invoice-freelance.hbs)
 * 
 * FEATURES:
 * - Full TypeScript type safety
 * - Bilingual support (English + Hindi)
 * - GST/Tax compliant for India
 * - Multi-currency support
 * - A4 print-ready formatting
 * - Comprehensive validation
 * ============================================================================
 */

// ============================================================================
// SECTION 1: ENUMS & CONSTANTS
// ============================================================================

/**
 * Invoice type identifiers - COMPREHENSIVE LIST
 */
export enum InvoiceType {
    // Basic Types
    STANDARD = 'standard',
    TAX = 'tax',
    PROFORMA = 'proforma',
    COMMERCIAL = 'commercial',
    SERVICE = 'service',
    FREELANCE = 'freelance',
    
    // Credit/Debit
    CREDIT_NOTE = 'credit_note',
    DEBIT_NOTE = 'debit_note',
    
    // Recurring & Subscription
    RECURRING = 'recurring',
    SUBSCRIPTION = 'subscription',
    
    // Industry Specific
    RETAIL = 'retail',
    RESTAURANT = 'restaurant',
    HOTEL = 'hotel',
    MEDICAL = 'medical',
    PHARMACY = 'pharmacy',
    EDUCATION = 'education',
    RENT = 'rent',
    LEASE = 'lease',
    TRANSPORT = 'transport',
    LOGISTICS = 'logistics',
    CONSTRUCTION = 'construction',
    MANUFACTURING = 'manufacturing',
    LEGAL = 'legal',
    CONSULTING = 'consulting',
    UTILITY = 'utility',
    TELECOM = 'telecom',
    INSURANCE = 'insurance',
    
    // Specialized
    TIMESHEET = 'timesheet',
    MILESTONE = 'milestone',
    PROGRESS_BILLING = 'progress_billing',
    RETAINER = 'retainer',
    DEPOSIT = 'deposit',
    ADVANCE = 'advance',
    FINAL = 'final',
    
    // E-commerce
    ECOMMERCE = 'ecommerce',
    MARKETPLACE = 'marketplace',
    
    // Government/Compliance
    GOVERNMENT = 'government',
    TENDER = 'tender',
    
    // International
    EXPORT = 'export',
    IMPORT = 'import'
}

/**
 * Invoice status options - COMPREHENSIVE
 */
export enum InvoiceStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    SENT = 'sent',
    VIEWED = 'viewed',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded',
    DISPUTED = 'disputed',
    WRITTEN_OFF = 'written_off',
    ON_HOLD = 'on_hold',
    SCHEDULED = 'scheduled',
    PROCESSING = 'processing',
    VOID = 'void',
    ARCHIVED = 'archived'
}

/**
 * Payment status options - COMPREHENSIVE
 */
export enum PaymentStatus {
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    PAID = 'paid',
    OVERDUE = 'overdue',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded',
    PENDING_VERIFICATION = 'pending_verification',
    FAILED = 'failed',
    PROCESSING = 'processing',
    SCHEDULED = 'scheduled',
    DISPUTED = 'disputed',
    CHARGEBACK = 'chargeback',
    WRITTEN_OFF = 'written_off'
}

/**
 * Payment method options - COMPREHENSIVE
 */
export enum PaymentMethod {
    // Cash & Traditional
    CASH = 'cash',
    CHEQUE = 'cheque',
    DD = 'demand_draft',
    MONEY_ORDER = 'money_order',
    
    // Bank Transfer
    BANK_TRANSFER = 'bank_transfer',
    NEFT = 'neft',
    RTGS = 'rtgs',
    IMPS = 'imps',
    WIRE_TRANSFER = 'wire_transfer',
    
    // Digital India
    UPI = 'upi',
    BHIM = 'bhim',
    PAYTM = 'paytm',
    PHONEPE = 'phonepe',
    GPAY = 'gpay',
    
    // Cards
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PREPAID_CARD = 'prepaid_card',
    CORPORATE_CARD = 'corporate_card',
    
    // Net Banking & Wallets
    NET_BANKING = 'net_banking',
    WALLET = 'wallet',
    
    // EMI & Credit
    EMI = 'emi',
    BNPL = 'buy_now_pay_later',
    CREDIT_LINE = 'credit_line',
    
    // International
    PAYPAL = 'paypal',
    STRIPE = 'stripe',
    RAZORPAY = 'razorpay',
    SWIFT = 'swift',
    LC = 'letter_of_credit',
    
    // Crypto (emerging)
    CRYPTO = 'crypto',
    
    // Other
    COD = 'cod',
    ADJUSTMENT = 'adjustment',
    BARTER = 'barter',
    OFFSET = 'offset',
    OTHER = 'other'
}

/**
 * Currency codes - COMPREHENSIVE INTERNATIONAL
 */
export enum CurrencyCode {
    // Indian
    INR = 'INR',
    
    // Major World Currencies
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    CNY = 'CNY',
    CHF = 'CHF',
    
    // Asia Pacific
    AED = 'AED',
    SGD = 'SGD',
    AUD = 'AUD',
    NZD = 'NZD',
    HKD = 'HKD',
    MYR = 'MYR',
    THB = 'THB',
    IDR = 'IDR',
    PHP = 'PHP',
    VND = 'VND',
    KRW = 'KRW',
    TWD = 'TWD',
    BDT = 'BDT',
    PKR = 'PKR',
    LKR = 'LKR',
    NPR = 'NPR',
    MMK = 'MMK',
    
    // Middle East
    SAR = 'SAR',
    QAR = 'QAR',
    KWD = 'KWD',
    BHD = 'BHD',
    OMR = 'OMR',
    JOD = 'JOD',
    ILS = 'ILS',
    TRY = 'TRY',
    
    // Americas
    CAD = 'CAD',
    MXN = 'MXN',
    BRL = 'BRL',
    ARS = 'ARS',
    CLP = 'CLP',
    COP = 'COP',
    PEN = 'PEN',
    
    // Europe
    SEK = 'SEK',
    NOK = 'NOK',
    DKK = 'DKK',
    PLN = 'PLN',
    CZK = 'CZK',
    HUF = 'HUF',
    RON = 'RON',
    RUB = 'RUB',
    UAH = 'UAH',
    
    // Africa
    ZAR = 'ZAR',
    EGP = 'EGP',
    NGN = 'NGN',
    KES = 'KES',
    GHS = 'GHS',
    MAD = 'MAD',
    TND = 'TND'
}

/**
 * Tax type options - COMPREHENSIVE GLOBAL
 */
export enum TaxType {
    // Indian GST
    GST = 'gst',
    IGST = 'igst',
    CGST = 'cgst',
    SGST = 'sgst',
    UTGST = 'utgst',
    CGST_SGST = 'cgst_sgst',
    CESS = 'cess',
    GST_COMP = 'gst_composition',
    
    // Indian Other Taxes
    TDS = 'tds',
    TCS = 'tcs',
    SERVICE_TAX = 'service_tax',
    EXCISE = 'excise',
    CUSTOMS = 'customs',
    OCTROI = 'octroi',
    ENTRY_TAX = 'entry_tax',
    PROFESSIONAL_TAX = 'professional_tax',
    STAMP_DUTY = 'stamp_duty',
    
    // International
    VAT = 'vat',
    SALES_TAX = 'sales_tax',
    PURCHASE_TAX = 'purchase_tax',
    USE_TAX = 'use_tax',
    WITHHOLDING_TAX = 'withholding_tax',
    INCOME_TAX = 'income_tax',
    CORPORATE_TAX = 'corporate_tax',
    CAPITAL_GAINS = 'capital_gains',
    
    // Special
    LUXURY_TAX = 'luxury_tax',
    SIN_TAX = 'sin_tax',
    CARBON_TAX = 'carbon_tax',
    DIGITAL_TAX = 'digital_tax',
    TOURIST_TAX = 'tourist_tax',
    
    // Exemptions
    EXEMPT = 'exempt',
    ZERO_RATED = 'zero_rated',
    NIL_RATED = 'nil_rated',
    NON_TAXABLE = 'non_taxable',
    
    NONE = 'none'
}

/**
 * TDS Section codes (India)
 */
export enum TDSSection {
    SEC_192 = '192',      // Salary
    SEC_194A = '194A',    // Interest other than securities
    SEC_194C = '194C',    // Contractor/Sub-contractor
    SEC_194H = '194H',    // Commission/Brokerage
    SEC_194I = '194I',    // Rent
    SEC_194IA = '194IA',  // Property transfer
    SEC_194IB = '194IB',  // Rent by Individual/HUF
    SEC_194J = '194J',    // Professional/Technical fees
    SEC_194K = '194K',    // Dividend
    SEC_194M = '194M',    // Contractor payment by Individual/HUF
    SEC_194N = '194N',    // Cash withdrawal
    SEC_194O = '194O',    // E-commerce
    SEC_194Q = '194Q',    // Purchase of goods
    SEC_195 = '195',      // NRI payments
    SEC_206C = '206C'     // TCS
}

/**
 * TCS Section codes (India)
 */
export enum TCSSection {
    SEC_206C_1 = '206C(1)',     // Scrap, minerals, etc.
    SEC_206C_1G = '206C(1G)',   // Foreign remittance/Tour package
    SEC_206C_1H = '206C(1H)',   // Sale of goods over 50L
    SEC_206C_1F = '206C(1F)'    // Motor vehicle over 10L
}

/**
 * GST rate slabs in India - ALL RATES
 */
export enum GSTRate {
    EXEMPT = 0,
    NIL = 0,
    RATE_0 = 0,
    RATE_0_1 = 0.1,
    RATE_0_25 = 0.25,
    RATE_1 = 1,
    RATE_1_5 = 1.5,
    RATE_3 = 3,
    RATE_5 = 5,
    RATE_6 = 6,
    RATE_7_5 = 7.5,
    RATE_12 = 12,
    RATE_14 = 14,
    RATE_18 = 18,
    RATE_28 = 28
}

/**
 * Cess rates (specific items)
 */
export enum CessRate {
    RATE_0 = 0,
    RATE_1 = 1,
    RATE_3 = 3,
    RATE_5 = 5,
    RATE_12 = 12,
    RATE_15 = 15,
    RATE_17 = 17,
    RATE_20 = 20,
    RATE_22 = 22,
    RATE_36 = 36,
    RATE_65 = 65,     // Tobacco
    RATE_145 = 145,   // Pan masala
    RATE_204 = 204    // Certain motor vehicles
}

/**
 * Unit of measurement - COMPREHENSIVE
 */
export enum UnitOfMeasurement {
    // Count Units
    NOS = 'nos',
    PCS = 'pcs',
    UNITS = 'units',
    PAIRS = 'pairs',
    SETS = 'sets',
    DOZEN = 'dozen',
    GROSS = 'gross',
    HUNDRED = 'hundred',
    THOUSAND = 'thousand',
    ITEMS = 'items',
    
    // Weight Units - Metric
    KG = 'kg',
    GM = 'gm',
    MG = 'mg',
    TONNE = 'tonne',
    METRIC_TON = 'metric_ton',
    QUINTAL = 'quintal',
    
    // Weight Units - Imperial
    LB = 'lb',
    OZ = 'oz',
    STONE = 'stone',
    TON_US = 'ton_us',
    TON_UK = 'ton_uk',
    
    // Length Units - Metric
    MTR = 'mtr',
    CM = 'cm',
    MM = 'mm',
    KM = 'km',
    
    // Length Units - Imperial
    FT = 'ft',
    INCH = 'inch',
    YARD = 'yard',
    MILE = 'mile',
    
    // Area Units
    SQM = 'sqm',
    SQCM = 'sqcm',
    SQFT = 'sqft',
    SQYD = 'sqyd',
    SQIN = 'sqin',
    ACRE = 'acre',
    HECTARE = 'hectare',
    BIGHA = 'bigha',
    KATHA = 'katha',
    MARLA = 'marla',
    KANAL = 'kanal',
    
    // Volume Units - Metric
    LTR = 'ltr',
    ML = 'ml',
    CBM = 'cbm',
    CU_CM = 'cu_cm',
    
    // Volume Units - Imperial
    GAL = 'gal',
    GAL_US = 'gal_us',
    QUART = 'quart',
    PINT = 'pint',
    FL_OZ = 'fl_oz',
    CU_FT = 'cu_ft',
    CU_IN = 'cu_in',
    BARREL = 'barrel',
    
    // Time Units
    SECOND = 'second',
    MINUTE = 'minute',
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    FORTNIGHT = 'fortnight',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year',
    
    // Service/Work Units
    JOB = 'job',
    PROJECT = 'project',
    TASK = 'task',
    SESSION = 'session',
    VISIT = 'visit',
    TRIP = 'trip',
    CONSULTATION = 'consultation',
    CALL = 'call',
    TICKET = 'ticket',
    CASE = 'case',
    
    // IT/Digital Units
    USER = 'user',
    LICENSE = 'license',
    SEAT = 'seat',
    INSTANCE = 'instance',
    API_CALL = 'api_call',
    TRANSACTION = 'transaction',
    GB = 'gb',
    MB = 'mb',
    TB = 'tb',
    RECORD = 'record',
    PAGE = 'page',
    WORD = 'word',
    CHARACTER = 'character',
    
    // Packaging Units
    BOX = 'box',
    CARTON = 'carton',
    CASE_BOX = 'case_box',
    CRATE = 'crate',
    PACK = 'pack',
    PACKET = 'packet',
    BUNDLE = 'bundle',
    ROLL = 'roll',
    REEL = 'reel',
    BAG = 'bag',
    SACK = 'sack',
    DRUM = 'drum',
    CYLINDER = 'cylinder',
    CAN = 'can',
    TIN = 'tin',
    JAR = 'jar',
    BOTTLE = 'bottle',
    TUBE = 'tube',
    POUCH = 'pouch',
    SACHET = 'sachet',
    STRIP = 'strip',
    BLISTER = 'blister',
    PALLET = 'pallet',
    CONTAINER = 'container',
    
    // Textile Units
    METER_FABRIC = 'meter_fabric',
    YARD_FABRIC = 'yard_fabric',
    BOLT = 'bolt',
    CONE = 'cone',
    HANK = 'hank',
    
    // Paper/Printing
    REAM = 'ream',
    SHEET = 'sheet',
    COPY = 'copy',
    IMPRESSION = 'impression',
    
    // Energy Units
    KWH = 'kwh',
    MWH = 'mwh',
    UNIT_ELECTRICITY = 'unit_electricity',
    BTU = 'btu',
    THERM = 'therm',
    JOULE = 'joule',
    CALORIE = 'calorie',
    
    // Construction
    CFT = 'cft',
    BRASS = 'brass',
    LOAD = 'load',
    BAG_CEMENT = 'bag_cement',
    
    // Medical/Pharma
    TABLET = 'tablet',
    CAPSULE = 'capsule',
    VIAL = 'vial',
    AMPOULE = 'ampoule',
    DOSE = 'dose',
    INJECTION = 'injection',
    
    // Food/Agriculture
    BUNCH = 'bunch',
    HEAD = 'head',
    CARAT = 'carat',
    
    // Miscellaneous
    EACH = 'each',
    LOT = 'lot',
    BATCH = 'batch',
    ASSORTMENT = 'assortment',
    KIT = 'kit',
    FLAT = 'flat',
    LUMP_SUM = 'lump_sum',
    RUNNING_METER = 'running_meter',
    RUNNING_FEET = 'running_feet',
    OTHER = 'other'
}

/**
 * Supply type for GST - COMPREHENSIVE
 */
export enum SupplyType {
    B2B = 'b2b',                   // Business to Business
    B2C = 'b2c',                   // Business to Consumer
    B2B_LARGE = 'b2b_large',       // B2B Large Invoice (> 2.5L)
    B2CS = 'b2cs',                 // B2C Small (Inter-state < 2.5L)
    B2CL = 'b2cl',                 // B2C Large (Inter-state > 2.5L)
    EXPORT = 'export',             // Export with payment
    EXPORT_WOP = 'export_wop',     // Export without payment
    EXPORT_WPAY = 'export_wpay',   // Export with payment
    SEZ = 'sez',                   // Special Economic Zone
    SEZ_WOP = 'sez_wop',          // SEZ without payment
    SEZ_WPAY = 'sez_wpay',        // SEZ with payment
    DEEMED_EXPORT = 'deemed_export',
    IMPORT = 'import',
    IMPORT_GOODS = 'import_goods',
    IMPORT_SERVICES = 'import_services',
    NIL_RATED = 'nil_rated',
    EXEMPTED = 'exempted',
    NON_GST = 'non_gst',
    REVERSE_CHARGE = 'reverse_charge',
    COMPOSITE = 'composite',
    INTRA_STATE = 'intra_state',
    INTER_STATE = 'inter_state'
}

/**
 * Document type for E-Invoice/GST Returns
 */
export enum DocumentType {
    INV = 'INV',      // Invoice
    CRN = 'CRN',      // Credit Note
    DBN = 'DBN',      // Debit Note
    BIL = 'BIL',      // Bill of Supply
    BOE = 'BOE',      // Bill of Entry
    SHP = 'SHP',      // Shipping Bill
    OTH = 'OTH'       // Others
}

/**
 * Incoterms (International Commercial Terms)
 */
export enum Incoterms {
    // Any Mode of Transport
    EXW = 'EXW',      // Ex Works
    FCA = 'FCA',      // Free Carrier
    CPT = 'CPT',      // Carriage Paid To
    CIP = 'CIP',      // Carriage and Insurance Paid To
    DAP = 'DAP',      // Delivered at Place
    DPU = 'DPU',      // Delivered at Place Unloaded
    DDP = 'DDP',      // Delivered Duty Paid
    
    // Sea and Inland Waterway Only
    FAS = 'FAS',      // Free Alongside Ship
    FOB = 'FOB',      // Free on Board
    CFR = 'CFR',      // Cost and Freight
    CIF = 'CIF'       // Cost, Insurance and Freight
}

/**
 * Transport mode
 */
export enum TransportMode {
    ROAD = 'road',
    RAIL = 'rail',
    AIR = 'air',
    SHIP = 'ship',
    MULTIMODAL = 'multimodal',
    COURIER = 'courier',
    HAND_DELIVERY = 'hand_delivery',
    PIPELINE = 'pipeline',
    POSTAL = 'postal'
}

/**
 * Vehicle type for E-Way Bill
 */
export enum VehicleType {
    REGULAR = 'regular',
    ODC = 'odc',           // Over Dimensional Cargo
    BONDED = 'bonded',
    LCV = 'lcv',           // Light Commercial Vehicle
    HCV = 'hcv',           // Heavy Commercial Vehicle
    TRAILER = 'trailer',
    CONTAINER = 'container'
}

/**
 * Business entity types (India)
 */
export enum BusinessEntityType {
    PROPRIETORSHIP = 'proprietorship',
    PARTNERSHIP = 'partnership',
    LLP = 'llp',
    PRIVATE_LIMITED = 'private_limited',
    PUBLIC_LIMITED = 'public_limited',
    ONE_PERSON_COMPANY = 'one_person_company',
    HUF = 'huf',
    TRUST = 'trust',
    SOCIETY = 'society',
    COOPERATIVE = 'cooperative',
    GOVERNMENT = 'government',
    PSU = 'psu',
    FOREIGN_COMPANY = 'foreign_company',
    NGO = 'ngo',
    INDIVIDUAL = 'individual',
    AOP = 'aop',           // Association of Persons
    BOI = 'boi',           // Body of Individuals
    LOCAL_AUTHORITY = 'local_authority',
    STATUTORY_BODY = 'statutory_body'
}

/**
 * GST registration type
 */
export enum GSTRegistrationType {
    REGULAR = 'regular',
    COMPOSITION = 'composition',
    ISD = 'isd',           // Input Service Distributor
    TDS = 'tds',
    TCS = 'tcs',
    CASUAL = 'casual',
    NRTP = 'nrtp',         // Non-Resident Taxable Person
    SEZ_UNIT = 'sez_unit',
    SEZ_DEVELOPER = 'sez_developer',
    UIN = 'uin',           // Unique Identification Number
    EMBASSY = 'embassy',
    UNREGISTERED = 'unregistered'
}

/**
 * Place of supply states (India)
 */
export const INDIAN_STATES: Record<string, string> = {
    '01': 'Jammu & Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra & Nagar Haveli and Daman & Diu',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh (Old)',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman & Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
    '38': 'Ladakh',
    '97': 'Other Territory'
};

// ============================================================================
// SECTION 2: BILINGUAL LABELS
// ============================================================================

/**
 * Bilingual label interface
 */
export interface BilingualLabel {
    en: string;
    hi: string;
}

/**
 * Invoice field labels
 */
export const INVOICE_LABELS: Record<string, BilingualLabel> = {
    // Document Labels
    invoice: { en: 'Invoice', hi: 'बीजक' },
    taxInvoice: { en: 'Tax Invoice', hi: 'कर बीजक' },
    proformaInvoice: { en: 'Proforma Invoice', hi: 'प्रोफार्मा बीजक' },
    commercialInvoice: { en: 'Commercial Invoice', hi: 'वाणिज्यिक बीजक' },
    serviceInvoice: { en: 'Service Invoice', hi: 'सेवा बीजक' },
    
    // Header Labels
    invoiceNumber: { en: 'Invoice No.', hi: 'बीजक संख्या' },
    invoiceDate: { en: 'Invoice Date', hi: 'बीजक दिनांक' },
    dueDate: { en: 'Due Date', hi: 'देय तिथि' },
    referenceNumber: { en: 'Reference No.', hi: 'संदर्भ संख्या' },
    orderNumber: { en: 'Order No.', hi: 'आदेश संख्या' },
    poNumber: { en: 'PO No.', hi: 'पीओ संख्या' },
    
    // Party Labels
    from: { en: 'From', hi: 'प्रेषक' },
    to: { en: 'To', hi: 'प्राप्तकर्ता' },
    billTo: { en: 'Bill To', hi: 'बिल प्राप्तकर्ता' },
    shipTo: { en: 'Ship To', hi: 'शिपिंग पता' },
    seller: { en: 'Seller', hi: 'विक्रेता' },
    buyer: { en: 'Buyer', hi: 'खरीदार' },
    
    // Company Info Labels
    companyName: { en: 'Company Name', hi: 'कंपनी का नाम' },
    address: { en: 'Address', hi: 'पता' },
    phone: { en: 'Phone', hi: 'फोन' },
    email: { en: 'Email', hi: 'ईमेल' },
    website: { en: 'Website', hi: 'वेबसाइट' },
    gstin: { en: 'GSTIN', hi: 'जीएसटीआईएन' },
    pan: { en: 'PAN', hi: 'पैन' },
    cin: { en: 'CIN', hi: 'सीआईएन' },
    stateCode: { en: 'State Code', hi: 'राज्य कोड' },
    
    // Item Table Labels
    sno: { en: 'S.No.', hi: 'क्र.सं.' },
    itemDescription: { en: 'Description', hi: 'विवरण' },
    hsnSac: { en: 'HSN/SAC', hi: 'एचएसएन/एसएसी' },
    quantity: { en: 'Qty', hi: 'मात्रा' },
    unit: { en: 'Unit', hi: 'इकाई' },
    rate: { en: 'Rate', hi: 'दर' },
    discount: { en: 'Discount', hi: 'छूट' },
    taxableValue: { en: 'Taxable Value', hi: 'कर योग्य मूल्य' },
    gstRate: { en: 'GST Rate', hi: 'जीएसटी दर' },
    cgst: { en: 'CGST', hi: 'सीजीएसटी' },
    sgst: { en: 'SGST', hi: 'एसजीएसटी' },
    igst: { en: 'IGST', hi: 'आईजीएसटी' },
    cess: { en: 'Cess', hi: 'सेस' },
    amount: { en: 'Amount', hi: 'राशि' },
    total: { en: 'Total', hi: 'कुल' },
    
    // Summary Labels
    subtotal: { en: 'Subtotal', hi: 'उप-योग' },
    totalDiscount: { en: 'Total Discount', hi: 'कुल छूट' },
    totalTax: { en: 'Total Tax', hi: 'कुल कर' },
    grandTotal: { en: 'Grand Total', hi: 'कुल योग' },
    roundOff: { en: 'Round Off', hi: 'पूर्णांकन' },
    amountInWords: { en: 'Amount in Words', hi: 'शब्दों में राशि' },
    
    // Payment Labels
    paymentTerms: { en: 'Payment Terms', hi: 'भुगतान शर्तें' },
    paymentMethod: { en: 'Payment Method', hi: 'भुगतान विधि' },
    bankDetails: { en: 'Bank Details', hi: 'बैंक विवरण' },
    accountName: { en: 'Account Name', hi: 'खाता नाम' },
    accountNumber: { en: 'Account No.', hi: 'खाता संख्या' },
    bankName: { en: 'Bank Name', hi: 'बैंक का नाम' },
    branch: { en: 'Branch', hi: 'शाखा' },
    ifscCode: { en: 'IFSC Code', hi: 'आईएफएससी कोड' },
    swiftCode: { en: 'SWIFT Code', hi: 'स्विफ्ट कोड' },
    upiId: { en: 'UPI ID', hi: 'यूपीआई आईडी' },
    
    // Other Labels
    termsConditions: { en: 'Terms & Conditions', hi: 'नियम और शर्तें' },
    notes: { en: 'Notes', hi: 'टिप्पणी' },
    remarks: { en: 'Remarks', hi: 'टिप्पणियां' },
    signature: { en: 'Signature', hi: 'हस्ताक्षर' },
    authorizedSignatory: { en: 'Authorized Signatory', hi: 'अधिकृत हस्ताक्षरकर्ता' },
    forCompany: { en: 'For', hi: 'के लिए' },
    thankYou: { en: 'Thank you for your business!', hi: 'आपके व्यापार के लिए धन्यवाद!' },
    
    // Status Labels
    status: { en: 'Status', hi: 'स्थिति' },
    paid: { en: 'PAID', hi: 'भुगतान हो गया' },
    unpaid: { en: 'UNPAID', hi: 'अदत्त' },
    overdue: { en: 'OVERDUE', hi: 'अतिदेय' },
    partiallyPaid: { en: 'PARTIALLY PAID', hi: 'आंशिक भुगतान' },
    cancelled: { en: 'CANCELLED', hi: 'रद्द' },
    draft: { en: 'DRAFT', hi: 'मसौदा' },
    
    // Supply Labels
    placeOfSupply: { en: 'Place of Supply', hi: 'आपूर्ति का स्थान' },
    supplyType: { en: 'Supply Type', hi: 'आपूर्ति का प्रकार' },
    reverseCharge: { en: 'Reverse Charge', hi: 'रिवर्स चार्ज' },
    
    // Export Labels
    exporterRef: { en: "Exporter's Ref", hi: 'निर्यातक का संदर्भ' },
    buyerRef: { en: "Buyer's Ref", hi: 'खरीदार का संदर्भ' },
    countryOfOrigin: { en: 'Country of Origin', hi: 'मूल देश' },
    portOfLoading: { en: 'Port of Loading', hi: 'लोडिंग का बंदरगाह' },
    portOfDischarge: { en: 'Port of Discharge', hi: 'डिस्चार्ज का बंदरगाह' },
    finalDestination: { en: 'Final Destination', hi: 'अंतिम गंतव्य' },
    termsOfDelivery: { en: 'Terms of Delivery', hi: 'डिलीवरी की शर्तें' },
    
    // Service Labels
    serviceDescription: { en: 'Service Description', hi: 'सेवा विवरण' },
    servicePeriod: { en: 'Service Period', hi: 'सेवा अवधि' },
    hourlyRate: { en: 'Hourly Rate', hi: 'प्रति घंटा दर' },
    hoursWorked: { en: 'Hours Worked', hi: 'काम के घंटे' },
    
    // Credit/Debit Note Labels
    creditNote: { en: 'Credit Note', hi: 'क्रेडिट नोट' },
    debitNote: { en: 'Debit Note', hi: 'डेबिट नोट' },
    originalInvoice: { en: 'Original Invoice', hi: 'मूल बीजक' },
    reasonForCredit: { en: 'Reason for Credit', hi: 'क्रेडिट का कारण' },
    reasonForDebit: { en: 'Reason for Debit', hi: 'डेबिट का कारण' },
    
    // Recurring Invoice Labels
    recurringInvoice: { en: 'Recurring Invoice', hi: 'आवर्ती बीजक' },
    frequency: { en: 'Frequency', hi: 'आवृत्ति' },
    nextInvoiceDate: { en: 'Next Invoice Date', hi: 'अगली बीजक तिथि' },
    billingCycle: { en: 'Billing Cycle', hi: 'बिलिंग चक्र' },
    
    // Medical/Healthcare Labels
    patientName: { en: 'Patient Name', hi: 'रोगी का नाम' },
    patientId: { en: 'Patient ID', hi: 'रोगी आईडी' },
    doctorName: { en: 'Doctor Name', hi: 'डॉक्टर का नाम' },
    hospitalName: { en: 'Hospital Name', hi: 'अस्पताल का नाम' },
    diagnosis: { en: 'Diagnosis', hi: 'निदान' },
    treatment: { en: 'Treatment', hi: 'उपचार' },
    roomCharges: { en: 'Room Charges', hi: 'कमरा शुल्क' },
    consultationFee: { en: 'Consultation Fee', hi: 'परामर्श शुल्क' },
    medicineCost: { en: 'Medicine Cost', hi: 'दवाई का खर्च' },
    labTestCharges: { en: 'Lab Test Charges', hi: 'लैब परीक्षण शुल्क' },
    insuranceClaim: { en: 'Insurance Claim', hi: 'बीमा दावा' },
    tpaName: { en: 'TPA Name', hi: 'टीपीए का नाम' },
    policyNumber: { en: 'Policy Number', hi: 'पॉलिसी नंबर' },
    preAuthNumber: { en: 'Pre-Auth Number', hi: 'प्री-ऑथ नंबर' },
    
    // Education Labels
    studentName: { en: 'Student Name', hi: 'छात्र का नाम' },
    studentId: { en: 'Student ID/Roll No.', hi: 'छात्र आईडी/रोल नं.' },
    className: { en: 'Class/Course', hi: 'कक्षा/कोर्स' },
    academicYear: { en: 'Academic Year', hi: 'शैक्षणिक वर्ष' },
    semester: { en: 'Semester/Term', hi: 'सेमेस्टर/टर्म' },
    tuitionFee: { en: 'Tuition Fee', hi: 'शिक्षण शुल्क' },
    examFee: { en: 'Exam Fee', hi: 'परीक्षा शुल्क' },
    libraryFee: { en: 'Library Fee', hi: 'पुस्तकालय शुल्क' },
    transportFee: { en: 'Transport Fee', hi: 'परिवहन शुल्क' },
    hostelFee: { en: 'Hostel Fee', hi: 'छात्रावास शुल्क' },
    admissionFee: { en: 'Admission Fee', hi: 'प्रवेश शुल्क' },
    developmentFee: { en: 'Development Fee', hi: 'विकास शुल्क' },
    
    // Rent/Lease Labels
    rentInvoice: { en: 'Rent Invoice', hi: 'किराया बीजक' },
    propertyAddress: { en: 'Property Address', hi: 'संपत्ति का पता' },
    tenantName: { en: 'Tenant Name', hi: 'किरायेदार का नाम' },
    landlordName: { en: 'Landlord Name', hi: 'मकान मालिक का नाम' },
    rentPeriod: { en: 'Rent Period', hi: 'किराया अवधि' },
    monthlyRent: { en: 'Monthly Rent', hi: 'मासिक किराया' },
    securityDeposit: { en: 'Security Deposit', hi: 'सुरक्षा जमा' },
    maintenanceCharges: { en: 'Maintenance Charges', hi: 'रखरखाव शुल्क' },
    waterCharges: { en: 'Water Charges', hi: 'पानी का शुल्क' },
    electricityCharges: { en: 'Electricity Charges', hi: 'बिजली शुल्क' },
    parkingCharges: { en: 'Parking Charges', hi: 'पार्किंग शुल्क' },
    agreementNumber: { en: 'Agreement No.', hi: 'समझौता संख्या' },
    leaseStartDate: { en: 'Lease Start Date', hi: 'लीज प्रारंभ तिथि' },
    leaseEndDate: { en: 'Lease End Date', hi: 'लीज समाप्ति तिथि' },
    
    // Restaurant/Hotel Labels
    tableNumber: { en: 'Table No.', hi: 'टेबल नं.' },
    waiterName: { en: 'Served By', hi: 'द्वारा परोसा गया' },
    restaurantOrderNo: { en: 'Order No.', hi: 'ऑर्डर नं.' },
    coverCharges: { en: 'Cover Charges', hi: 'कवर चार्ज' },
    serviceCharge: { en: 'Service Charge', hi: 'सेवा शुल्क' },
    tip: { en: 'Tip', hi: 'टिप' },
    foodItems: { en: 'Food Items', hi: 'खाद्य पदार्थ' },
    beverages: { en: 'Beverages', hi: 'पेय पदार्थ' },
    roomNumber: { en: 'Room No.', hi: 'कमरा नं.' },
    checkInDate: { en: 'Check-In Date', hi: 'चेक-इन तिथि' },
    checkOutDate: { en: 'Check-Out Date', hi: 'चेक-आउट तिथि' },
    numberOfNights: { en: 'No. of Nights', hi: 'रातों की संख्या' },
    roomTariff: { en: 'Room Tariff', hi: 'कमरा किराया' },
    extraBed: { en: 'Extra Bed', hi: 'अतिरिक्त बिस्तर' },
    laundryCharges: { en: 'Laundry Charges', hi: 'लॉन्ड्री शुल्क' },
    minibarCharges: { en: 'Minibar Charges', hi: 'मिनीबार शुल्क' },
    
    // Transport/Logistics Labels
    vehicleNumber: { en: 'Vehicle No.', hi: 'वाहन संख्या' },
    driverName: { en: 'Driver Name', hi: 'ड्राइवर का नाम' },
    lrNumber: { en: 'LR/GR No.', hi: 'एलआर/जीआर नं.' },
    eWayBillNo: { en: 'E-Way Bill No.', hi: 'ई-वे बिल नं.' },
    fromLocation: { en: 'From', hi: 'से' },
    toLocation: { en: 'To', hi: 'तक' },
    distance: { en: 'Distance', hi: 'दूरी' },
    freightCharges: { en: 'Freight Charges', hi: 'भाड़ा शुल्क' },
    loadingCharges: { en: 'Loading Charges', hi: 'लोडिंग शुल्क' },
    unloadingCharges: { en: 'Unloading Charges', hi: 'अनलोडिंग शुल्क' },
    weightCharges: { en: 'Weight Charges', hi: 'वजन शुल्क' },
    handlingCharges: { en: 'Handling Charges', hi: 'हैंडलिंग शुल्क' },
    insuranceCharges: { en: 'Insurance Charges', hi: 'बीमा शुल्क' },
    consignorName: { en: 'Consignor Name', hi: 'प्रेषक का नाम' },
    consigneeName: { en: 'Consignee Name', hi: 'प्राप्तकर्ता का नाम' },
    
    // Construction Labels
    projectName: { en: 'Project Name', hi: 'प्रोजेक्ट का नाम' },
    workOrderNo: { en: 'Work Order No.', hi: 'कार्य आदेश संख्या' },
    raNumber: { en: 'RA Bill No.', hi: 'आरए बिल नं.' },
    mileStone: { en: 'Milestone', hi: 'मील का पत्थर' },
    percentComplete: { en: '% Complete', hi: '% पूर्ण' },
    retentionAmount: { en: 'Retention Amount', hi: 'प्रतिधारण राशि' },
    mobilizationAdvance: { en: 'Mobilization Advance', hi: 'मोबिलाइजेशन अग्रिम' },
    materialOnSite: { en: 'Material on Site', hi: 'साइट पर सामग्री' },
    laborCharges: { en: 'Labor Charges', hi: 'श्रम शुल्क' },
    contractorName: { en: 'Contractor Name', hi: 'ठेकेदार का नाम' },
    
    // Legal/Consulting Labels
    matterName: { en: 'Matter/Case Name', hi: 'मामले का नाम' },
    caseNumber: { en: 'Case Number', hi: 'केस नंबर' },
    retainerFee: { en: 'Retainer Fee', hi: 'रिटेनर शुल्क' },
    appearanceFee: { en: 'Appearance Fee', hi: 'उपस्थिति शुल्क' },
    documentDrafting: { en: 'Document Drafting', hi: 'दस्तावेज प्रारूपण' },
    courtFee: { en: 'Court Fee', hi: 'कोर्ट फीस' },
    filingCharges: { en: 'Filing Charges', hi: 'फाइलिंग शुल्क' },
    travelExpenses: { en: 'Travel Expenses', hi: 'यात्रा व्यय' },
    
    // Utility Labels
    connectionNumber: { en: 'Connection No.', hi: 'कनेक्शन नं.' },
    meterNumber: { en: 'Meter No.', hi: 'मीटर नं.' },
    previousReading: { en: 'Previous Reading', hi: 'पिछली रीडिंग' },
    currentReading: { en: 'Current Reading', hi: 'वर्तमान रीडिंग' },
    unitsConsumed: { en: 'Units Consumed', hi: 'उपभोग की गई इकाइयां' },
    ratePerUnit: { en: 'Rate per Unit', hi: 'प्रति यूनिट दर' },
    fixedCharges: { en: 'Fixed Charges', hi: 'निश्चित शुल्क' },
    fuelSurcharge: { en: 'Fuel Surcharge', hi: 'ईंधन अधिभार' },
    demandCharges: { en: 'Demand Charges', hi: 'डिमांड चार्ज' },
    subsidyAmount: { en: 'Subsidy Amount', hi: 'सब्सिडी राशि' },
    
    // E-Invoice Labels
    irn: { en: 'IRN', hi: 'आईआरएन' },
    ackNumber: { en: 'Acknowledgement No.', hi: 'पावती संख्या' },
    ackDate: { en: 'Acknowledgement Date', hi: 'पावती तिथि' },
    signedQrCode: { en: 'Signed QR Code', hi: 'हस्ताक्षरित क्यूआर कोड' },
    
    // TDS/TCS Labels
    tdsApplicable: { en: 'TDS Applicable', hi: 'टीडीएस लागू' },
    tdsSection: { en: 'TDS Section', hi: 'टीडीएस धारा' },
    tdsRate: { en: 'TDS Rate', hi: 'टीडीएस दर' },
    tdsAmount: { en: 'TDS Amount', hi: 'टीडीएस राशि' },
    tcsApplicable: { en: 'TCS Applicable', hi: 'टीसीएस लागू' },
    tcsSection: { en: 'TCS Section', hi: 'टीसीएस धारा' },
    tcsRate: { en: 'TCS Rate', hi: 'टीसीएस दर' },
    tcsAmount: { en: 'TCS Amount', hi: 'टीसीएस राशि' },
    lowerDeductionCert: { en: 'Lower Deduction Certificate', hi: 'कम कटौती प्रमाण पत्र' },
    certNumber: { en: 'Certificate No.', hi: 'प्रमाण पत्र संख्या' },
    
    // Digital Signature Labels
    digitalSignature: { en: 'Digital Signature', hi: 'डिजिटल हस्ताक्षर' },
    signedBy: { en: 'Signed By', hi: 'द्वारा हस्ताक्षरित' },
    signedOn: { en: 'Signed On', hi: 'हस्ताक्षर तिथि' },
    certificateIssuer: { en: 'Certificate Issuer', hi: 'प्रमाण पत्र जारीकर्ता' },
    validFrom: { en: 'Valid From', hi: 'से मान्य' },
    validTo: { en: 'Valid To', hi: 'तक मान्य' }
};

// ============================================================================
// SECTION 3: TYPE DEFINITIONS
// ============================================================================

/**
 * Address interface
 */
export interface AddressInfo {
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    state: string;
    stateCode?: string;
    country: string;
    countryCode?: string;
    pincode: string;
    landmark?: string;
}

/**
 * Contact info interface
 */
export interface ContactInfo {
    phone?: string;
    mobile?: string;
    email?: string;
    website?: string;
    fax?: string;
}

/**
 * Tax registration info
 */
export interface TaxRegistration {
    gstin?: string;
    pan?: string;
    cin?: string;
    tan?: string;
    iec?: string;  // Import Export Code
    vatNumber?: string;
    servicesTaxNumber?: string;
}

/**
 * Bank account details
 */
export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch?: string;
    ifscCode: string;
    swiftCode?: string;
    micrCode?: string;
    accountType?: 'savings' | 'current' | 'overdraft';
}

/**
 * UPI payment details
 */
export interface UPIDetails {
    upiId: string;
    payeeName?: string;
    qrCode?: string;  // Base64 encoded QR code image
}

/**
 * Party (Seller/Buyer) info
 */
export interface PartyInfo {
    name: string;
    nameHindi?: string;
    tradeName?: string;
    logo?: string;
    address: AddressInfo;
    contact: ContactInfo;
    taxRegistration: TaxRegistration;
    bankDetails?: BankDetails;
    upiDetails?: UPIDetails;
}

/**
 * Line item discount
 */
export interface ItemDiscount {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
    reason?: string;
}

/**
 * Tax breakdown per item
 */
export interface ItemTax {
    taxType: TaxType;
    rate: number;
    taxableAmount: number;
    taxAmount: number;
}

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
    id: string;
    slNo: number;
    itemCode?: string;
    description: string;
    descriptionHindi?: string;
    hsnCode?: string;       // HSN for goods
    sacCode?: string;       // SAC for services
    quantity: number;
    unit: UnitOfMeasurement;
    unitPrice: number;
    grossAmount: number;
    discount?: ItemDiscount;
    taxableAmount: number;
    taxes: ItemTax[];
    totalTax: number;
    netAmount: number;
    notes?: string;
}

/**
 * Tax summary by rate
 */
export interface TaxSummary {
    taxType: TaxType;
    rate: number;
    taxableAmount: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    cessAmount?: number;
    totalTaxAmount: number;
}

/**
 * Invoice totals
 */
export interface InvoiceTotals {
    itemCount: number;
    totalQuantity: number;
    grossAmount: number;
    totalDiscount: number;
    taxableAmount: number;
    cgstTotal?: number;
    sgstTotal?: number;
    igstTotal?: number;
    cessTotal?: number;
    totalTax: number;
    roundOff?: number;
    grandTotal: number;
    amountInWords: string;
    amountInWordsHindi?: string;
}

/**
 * Payment record
 */
export interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    transactionId?: string;
    notes?: string;
    receivedBy?: string;
}

/**
 * Payment terms
 */
export interface PaymentTerms {
    dueDays: number;
    dueDate: string;
    lateFeePercent?: number;
    lateFeeAmount?: number;
    earlyPaymentDiscount?: number;
    earlyPaymentDays?: number;
    notes?: string;
}

/**
 * Shipping details
 */
export interface ShippingDetails {
    shipTo: PartyInfo;
    shippingMethod?: string;
    trackingNumber?: string;
    carrier?: string;
    expectedDelivery?: string;
    shippingCost?: number;
    weight?: number;
    weightUnit?: string;
    dimensions?: string;
    packages?: number;
}

/**
 * Export/Import details for commercial invoices
 */
export interface ExportDetails {
    exporterRef?: string;
    buyerRef?: string;
    contractNumber?: string;
    lcNumber?: string;
    lcDate?: string;
    preCarriage?: string;
    placeOfReceipt?: string;
    vesselFlightNo?: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    finalDestination?: string;
    countryOfOrigin?: string;
    countryOfFinalDestination?: string;
    termsOfDelivery?: string;  // Incoterms
    paymentTerms?: string;
    currency?: CurrencyCode;
    exchangeRate?: number;
    grossWeight?: string;
    netWeight?: string;
    packages?: string;
    containerNo?: string;
    marks?: string;
}

// ============================================================================
// SECTION 4: INVOICE DATA INTERFACES
// ============================================================================

/**
 * Base invoice data (common to all invoice types)
 */
export interface BaseInvoiceData {
    // Invoice Identification
    invoiceType: InvoiceType;
    invoiceNumber: string;
    invoiceDate: string;
    
    // References
    referenceNumber?: string;
    orderNumber?: string;
    poNumber?: string;
    quotationNumber?: string;
    deliveryChallanNumber?: string;
    
    // Status
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    
    // Parties
    seller: PartyInfo;
    buyer: PartyInfo;
    
    // Items
    lineItems: InvoiceLineItem[];
    
    // Totals
    totals: InvoiceTotals;
    currency: CurrencyCode;
    
    // Tax Info
    taxSummary: TaxSummary[];
    reverseCharge: boolean;
    
    // Payment
    paymentTerms: PaymentTerms;
    payments?: PaymentRecord[];
    balanceDue: number;
    
    // Other
    notes?: string;
    termsAndConditions?: string[];
    internalNotes?: string;
    
    // Branding
    brandColor?: string;
    brandColorLight?: string;
    brandColorDark?: string;
    watermark?: string;
    
    // Signatures
    preparedBy?: string;
    authorizedSignatory?: string;
    signature?: string;
    signatureDate?: string;
}

/**
 * Standard Invoice Data
 */
export interface StandardInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.STANDARD;
}

/**
 * Tax Invoice Data (GST compliant)
 */
export interface TaxInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.TAX;
    
    // GST Specific
    supplyType: SupplyType;
    placeOfSupply: string;
    placeOfSupplyCode: string;
    isInterState: boolean;
    
    // E-Invoice
    eInvoiceIrn?: string;
    eInvoiceAckNo?: string;
    eInvoiceAckDate?: string;
    eInvoiceQrCode?: string;
    
    // E-Way Bill
    eWayBillNo?: string;
    eWayBillDate?: string;
    eWayBillValidTill?: string;
    vehicleNo?: string;
    transporterId?: string;
    transporterName?: string;
    transportMode?: 'road' | 'rail' | 'air' | 'ship';
    distanceKm?: number;
}

/**
 * Proforma Invoice Data
 */
export interface ProformaInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.PROFORMA;
    
    // Validity
    validUntil: string;
    validDays: number;
    
    // Conversion
    convertedToInvoice?: boolean;
    finalInvoiceNumber?: string;
    finalInvoiceDate?: string;
    
    // Terms
    deliveryTerms?: string;
    deliveryTimeline?: string;
    warrantyTerms?: string;
}

/**
 * Commercial Invoice Data (Export)
 */
export interface CommercialInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.COMMERCIAL;
    
    // Export Details
    exportDetails: ExportDetails;
    
    // Shipping
    shipping: ShippingDetails;
    
    // Declaration
    declaration?: string;
    
    // Certifications
    certificateOfOrigin?: boolean;
    coNumber?: string;
    coDate?: string;
    phytosanitaryCert?: boolean;
    fumigationCert?: boolean;
    inspectionCert?: boolean;
    otherCertificates?: string[];
}

/**
 * Service Invoice Data
 */
export interface ServiceInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.SERVICE;
    
    // Service Specific
    servicePeriod?: {
        from: string;
        to: string;
    };
    projectName?: string;
    projectCode?: string;
    milestones?: {
        name: string;
        amount: number;
        status: 'pending' | 'completed' | 'invoiced';
    }[];
    
    // Time Tracking
    timeEntries?: {
        date: string;
        description: string;
        hours: number;
        rate: number;
        amount: number;
    }[];
    totalHours?: number;
}

/**
 * Freelance Invoice Data
 */
export interface FreelanceInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.FREELANCE;
    
    // Freelancer Info
    freelancerTitle?: string;
    portfolioUrl?: string;
    
    // Project Details
    projectName?: string;
    projectDescription?: string;
    projectTimeline?: string;
    
    // Deliverables
    deliverables?: {
        name: string;
        description?: string;
        status: 'pending' | 'in_progress' | 'completed' | 'approved';
        amount: number;
    }[];
    
    // Revisions
    revisionsIncluded?: number;
    additionalRevisionRate?: number;
    
    // License/Usage
    usageRights?: string;
    copyrightTransfer?: boolean;
}

// ============================================================================
// SECTION 4B: INDUSTRY-SPECIFIC INVOICE INTERFACES
// ============================================================================

/**
 * Credit Note Data
 */
export interface CreditNoteData extends BaseInvoiceData {
    invoiceType: InvoiceType.CREDIT_NOTE;
    
    // Original Invoice Reference
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    originalInvoiceAmount: number;
    
    // Reason
    reason: 'return' | 'discount' | 'correction' | 'cancellation' | 'quality_issue' | 'short_supply' | 'price_difference' | 'other';
    reasonDetails?: string;
    
    // Credit Details
    creditAmount: number;
    adjustedToInvoice?: string;
    refundIssued?: boolean;
    refundDate?: string;
    refundMethod?: PaymentMethod;
    refundReference?: string;
}

/**
 * Debit Note Data
 */
export interface DebitNoteData extends BaseInvoiceData {
    invoiceType: InvoiceType.DEBIT_NOTE;
    
    // Original Invoice Reference
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    originalInvoiceAmount: number;
    
    // Reason
    reason: 'price_increase' | 'additional_charges' | 'tax_revision' | 'undercharge' | 'interest' | 'penalty' | 'other';
    reasonDetails?: string;
    
    // Debit Details
    debitAmount: number;
}

/**
 * Recurring Invoice Data
 */
export interface RecurringInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.RECURRING;
    
    // Recurrence Details
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
    startDate: string;
    endDate?: string;
    nextInvoiceDate: string;
    lastInvoiceDate?: string;
    invoiceCount?: number;
    totalInvoicesGenerated?: number;
    
    // Auto Settings
    autoSend: boolean;
    autoReminder: boolean;
    reminderDays?: number[];
    
    // Template
    templateId?: string;
}

/**
 * Medical/Healthcare Invoice Data
 */
export interface MedicalInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.MEDICAL;
    
    // Patient Info
    patient: {
        name: string;
        id?: string;
        age?: number;
        gender?: 'male' | 'female' | 'other';
        contactNumber?: string;
        address?: AddressInfo;
        bloodGroup?: string;
        allergies?: string[];
    };
    
    // Admission/Visit Details
    admissionType: 'opd' | 'ipd' | 'emergency' | 'daycare';
    admissionNumber?: string;
    admissionDate?: string;
    dischargeDate?: string;
    wardName?: string;
    bedNumber?: string;
    
    // Doctor Details
    doctor: {
        name: string;
        specialization?: string;
        registrationNumber?: string;
        department?: string;
    };
    referringDoctor?: string;
    
    // Medical Details
    diagnosis?: string[];
    procedures?: {
        code?: string;
        name: string;
        date?: string;
        doctor?: string;
        amount: number;
    }[];
    
    // Charges Breakdown
    charges: {
        consultationFee?: number;
        roomCharges?: number;
        nursingCharges?: number;
        otCharges?: number;
        icuCharges?: number;
        medicineCharges?: number;
        consumableCharges?: number;
        labCharges?: number;
        radiologyCharges?: number;
        physiotherapyCharges?: number;
        ambulanceCharges?: number;
        otherCharges?: number;
    };
    
    // Insurance
    insurance?: {
        hasInsurance: boolean;
        companyName?: string;
        policyNumber?: string;
        tpaName?: string;
        tpaId?: string;
        preAuthNumber?: string;
        preAuthAmount?: number;
        claimNumber?: string;
        claimAmount?: number;
        claimStatus?: 'pending' | 'approved' | 'rejected' | 'partial';
        copayAmount?: number;
        deductible?: number;
        patientPayable?: number;
    };
}

/**
 * Pharmacy Invoice Data
 */
export interface PharmacyInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.PHARMACY;
    
    // Patient/Customer
    patientName?: string;
    doctorName?: string;
    prescriptionNumber?: string;
    prescriptionDate?: string;
    
    // Medicine Items
    medicines: {
        slNo: number;
        drugName: string;
        genericName?: string;
        manufacturer?: string;
        batchNumber: string;
        expiryDate: string;
        schedule?: 'H' | 'H1' | 'X' | 'G' | 'OTC';
        quantity: number;
        unit: string;
        mrp: number;
        discount?: number;
        gstRate: number;
        amount: number;
    }[];
    
    // Compliance
    drugLicenseNo: string;
    pharmacistName?: string;
    pharmacistRegNo?: string;
}

/**
 * Education Invoice Data
 */
export interface EducationInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.EDUCATION;
    
    // Student Info
    student: {
        name: string;
        rollNumber?: string;
        admissionNumber?: string;
        className: string;
        section?: string;
        academicYear: string;
        semester?: string;
        parentName?: string;
        contactNumber?: string;
    };
    
    // Fee Type
    feeType: 'admission' | 'tuition' | 'exam' | 'hostel' | 'transport' | 'annual' | 'miscellaneous';
    feePeriod: string;
    
    // Fee Breakdown
    fees: {
        tuitionFee?: number;
        admissionFee?: number;
        registrationFee?: number;
        examFee?: number;
        libraryFee?: number;
        laboratoryFee?: number;
        computerFee?: number;
        sportsFee?: number;
        transportFee?: number;
        hostelFee?: number;
        messFee?: number;
        developmentFee?: number;
        activityFee?: number;
        uniformFee?: number;
        booksFee?: number;
        cautionDeposit?: number;
        lateFee?: number;
        otherFees?: number;
    };
    
    // Scholarship/Concession
    scholarship?: {
        type: string;
        amount: number;
        reference?: string;
    };
    concession?: {
        type: string;
        percentage?: number;
        amount: number;
        reason?: string;
    };
}

/**
 * Rent Invoice Data
 */
export interface RentInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.RENT;
    
    // Property Details
    property: {
        type: 'residential' | 'commercial' | 'industrial' | 'land';
        address: AddressInfo;
        area?: number;
        areaUnit?: 'sqft' | 'sqm';
        unitNumber?: string;
        floorNumber?: string;
    };
    
    // Agreement Details
    agreement: {
        number?: string;
        startDate: string;
        endDate: string;
        lockInPeriod?: number;
        noticePeriod?: number;
        escalationClause?: string;
        escalationPercentage?: number;
    };
    
    // Landlord & Tenant
    landlord: PartyInfo;
    tenant: PartyInfo;
    
    // Rent Details
    rentPeriod: {
        from: string;
        to: string;
    };
    
    // Charges
    charges: {
        baseRent: number;
        maintenanceCharges?: number;
        waterCharges?: number;
        electricityCharges?: number;
        parkingCharges?: number;
        securityCharges?: number;
        clubCharges?: number;
        otherCharges?: number;
    };
    
    // Deductions
    tdsDeducted?: number;
    tdsRate?: number;
    tdsSection?: string;
}

/**
 * Restaurant Invoice Data
 */
export interface RestaurantInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.RESTAURANT;
    
    // Order Details
    orderType: 'dine_in' | 'takeaway' | 'delivery' | 'drive_through';
    tableNumber?: string;
    orderNumber: string;
    serverName?: string;
    numberOfGuests?: number;
    
    // Timing
    orderTime: string;
    servedTime?: string;
    
    // Food Items
    items: {
        slNo: number;
        name: string;
        category?: 'appetizer' | 'main_course' | 'dessert' | 'beverage' | 'other';
        variant?: string;
        quantity: number;
        unitPrice: number;
        isVeg?: boolean;
        spiceLevel?: string;
        addOns?: { name: string; price: number }[];
        specialInstructions?: string;
        amount: number;
    }[];
    
    // Additional Charges
    serviceCharge?: number;
    serviceChargePercent?: number;
    packagingCharges?: number;
    deliveryCharges?: number;
    containerCharges?: number;
    
    // Tips
    tip?: number;
    
    // Loyalty
    loyaltyPointsEarned?: number;
    loyaltyPointsRedeemed?: number;
    loyaltyDiscount?: number;
}

/**
 * Hotel Invoice Data
 */
export interface HotelInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.HOTEL;
    
    // Guest Details
    guest: {
        name: string;
        nationality?: string;
        idType?: string;
        idNumber?: string;
        contactNumber?: string;
        email?: string;
        company?: string;
        gstNumber?: string;
    };
    
    // Reservation
    reservationNumber?: string;
    bookingSource?: 'direct' | 'ota' | 'corporate' | 'agent' | 'walk_in';
    
    // Stay Details
    checkIn: string;
    checkOut: string;
    numberOfNights: number;
    roomNumber: string;
    roomType: string;
    roomCategory?: string;
    mealPlan?: 'ep' | 'cp' | 'map' | 'ap';  // European/Continental/Modified American/American
    numberOfAdults?: number;
    numberOfChildren?: number;
    
    // Room Charges
    roomCharges: {
        date: string;
        rate: number;
        tax: number;
        amount: number;
    }[];
    
    // Additional Charges
    additionalCharges: {
        category: 'restaurant' | 'bar' | 'minibar' | 'laundry' | 'spa' | 'room_service' | 'telephone' | 'internet' | 'parking' | 'transport' | 'other';
        description: string;
        date: string;
        quantity?: number;
        rate: number;
        amount: number;
    }[];
    
    // Advance/Deposit
    advanceReceived?: number;
    advanceDate?: string;
    advanceMethod?: PaymentMethod;
}

/**
 * Transport/Logistics Invoice Data
 */
export interface TransportInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.TRANSPORT;
    
    // Consignment Details
    consignment: {
        lrNumber: string;
        lrDate: string;
        consignorName: string;
        consignorAddress: AddressInfo;
        consignorGstin?: string;
        consigneeName: string;
        consigneeAddress: AddressInfo;
        consigneeGstin?: string;
    };
    
    // Route
    route: {
        from: string;
        to: string;
        via?: string[];
        distance: number;
        distanceUnit: 'km' | 'miles';
    };
    
    // Vehicle
    vehicle: {
        number: string;
        type: string;
        ownerName?: string;
        driverName?: string;
        driverLicense?: string;
        driverPhone?: string;
    };
    
    // Goods Details
    goods: {
        description: string;
        invoiceNumber?: string;
        invoiceDate?: string;
        invoiceValue?: number;
        packages: number;
        packagingType?: string;
        actualWeight: number;
        chargedWeight: number;
        weightUnit: 'kg' | 'ton';
        declaredValue?: number;
    };
    
    // E-Way Bill
    eWayBill?: {
        number: string;
        date: string;
        validUpto: string;
    };
    
    // Charges
    charges: {
        freightCharges: number;
        loadingCharges?: number;
        unloadingCharges?: number;
        detentionCharges?: number;
        hamaliCharges?: number;
        octroi?: number;
        tollCharges?: number;
        statisticalCharges?: number;
        doorDeliveryCharges?: number;
        insuranceCharges?: number;
        otherCharges?: number;
    };
    
    // Payment Terms
    freightPayment: 'prepaid' | 'to_pay' | 'to_be_billed';
}

/**
 * Construction Invoice Data (RA Bill)
 */
export interface ConstructionInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.CONSTRUCTION;
    
    // Project Details
    project: {
        name: string;
        code?: string;
        location: AddressInfo;
        client: PartyInfo;
        consultant?: PartyInfo;
    };
    
    // Contract Details
    contract: {
        number: string;
        date: string;
        value: number;
        type: 'lump_sum' | 'item_rate' | 'percentage' | 'cost_plus';
        workOrderNumber?: string;
        workOrderDate?: string;
    };
    
    // RA Bill Details
    raBillNumber: number;
    billType: 'running' | 'final' | 'supplementary';
    billPeriod: {
        from: string;
        to: string;
    };
    
    // Work Items (BOQ)
    workItems: {
        slNo: number;
        itemCode?: string;
        description: string;
        unit: string;
        contractQuantity: number;
        contractRate: number;
        previousQuantity: number;
        currentQuantity: number;
        cumulativeQuantity: number;
        amount: number;
        deviationQuantity?: number;
        deviationAmount?: number;
    }[];
    
    // Summary
    summary: {
        grossAmount: number;
        previousBilledAmount: number;
        currentBilledAmount: number;
        cumulativeBilledAmount: number;
    };
    
    // Deductions
    deductions: {
        retentionMoney?: number;
        retentionPercent?: number;
        securityDeposit?: number;
        advanceRecovery?: number;
        materialRecovery?: number;
        labourCessRecovery?: number;
        otherDeductions?: number;
        tds?: number;
        gst?: number;
    };
    
    // Certifications
    measurementBook?: {
        number: string;
        pageFrom: number;
        pageTo: number;
    };
}

/**
 * Legal/Consulting Invoice Data
 */
export interface LegalInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.LEGAL;
    
    // Matter Details
    matter: {
        name: string;
        number?: string;
        type: 'litigation' | 'corporate' | 'ipr' | 'tax' | 'compliance' | 'advisory' | 'documentation' | 'other';
        court?: string;
        caseNumber?: string;
        opposingParty?: string;
    };
    
    // Engagement
    engagement: {
        type: 'retainer' | 'hourly' | 'fixed' | 'contingency' | 'hybrid';
        retainerAmount?: number;
        retainerPeriod?: string;
        hourlyRate?: number;
        fixedFee?: number;
        contingencyPercent?: number;
        startDate: string;
        endDate?: string;
    };
    
    // Time Entries
    timeEntries?: {
        date: string;
        professional: string;
        designation?: string;
        description: string;
        hours: number;
        rate: number;
        amount: number;
    }[];
    
    // Fee Breakdown
    fees: {
        professionalFees: number;
        retainerFees?: number;
        appearanceFees?: number;
        draftingFees?: number;
        consultationFees?: number;
        notaryFees?: number;
        stampDuty?: number;
        courtFees?: number;
        filingFees?: number;
    };
    
    // Disbursements
    disbursements?: {
        description: string;
        date?: string;
        amount: number;
        receipt?: string;
    }[];
    
    // Trust Account (IOLTA)
    trustAccount?: {
        openingBalance: number;
        deposits: number;
        withdrawals: number;
        closingBalance: number;
    };
}

/**
 * Utility Invoice Data
 */
export interface UtilityInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.UTILITY;
    
    // Connection Details
    connection: {
        type: 'electricity' | 'water' | 'gas' | 'internet' | 'telephone' | 'cable';
        number: string;
        category?: 'domestic' | 'commercial' | 'industrial' | 'agricultural';
        sanctionedLoad?: number;
        loadUnit?: string;
        meterNumber?: string;
        meterType?: string;
    };
    
    // Consumer Info
    consumer: {
        name: string;
        address: AddressInfo;
        contactNumber?: string;
    };
    
    // Billing Period
    billingPeriod: {
        from: string;
        to: string;
        readingDate?: string;
        dueDate: string;
    };
    
    // Meter Reading
    reading?: {
        previous: number;
        current: number;
        unitsConsumed: number;
        mfMultiplier?: number;
    };
    
    // Charges (for electricity)
    electricityCharges?: {
        energyCharges: number;
        demandCharges?: number;
        fixedCharges: number;
        meterRent?: number;
        fuelAdjustmentCharges?: number;
        electricityDuty?: number;
        wheelingCharges?: number;
        crossSubsidy?: number;
        otherCharges?: number;
    };
    
    // Subsidies/Adjustments
    subsidy?: number;
    previousArrears?: number;
    previousAdvance?: number;
    latePaymentSurcharge?: number;
    
    // Consumption Analysis
    consumptionHistory?: {
        period: string;
        units: number;
        amount: number;
    }[];
}

/**
 * E-commerce Invoice Data
 */
export interface EcommerceInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.ECOMMERCE;
    
    // Order Details
    order: {
        number: string;
        date: string;
        platform?: string;
        sellerId?: string;
        sellerName?: string;
    };
    
    // Fulfillment
    fulfillment: {
        type: 'seller' | 'marketplace' | 'dropship';
        warehouseId?: string;
        warehouseLocation?: string;
        shippingPartner?: string;
        awbNumber?: string;
        trackingUrl?: string;
    };
    
    // Items
    items: {
        slNo: number;
        sku: string;
        productName: string;
        variant?: string;
        asin?: string;
        quantity: number;
        mrp: number;
        sellingPrice: number;
        discount: number;
        taxableValue: number;
        gstRate: number;
        gstAmount: number;
        totalAmount: number;
    }[];
    
    // Charges
    platformCharges?: {
        commissionPercent?: number;
        commissionAmount?: number;
        fixedFee?: number;
        closingFee?: number;
        shippingFee?: number;
        pickAndPackFee?: number;
        storageFee?: number;
        tcsAmount?: number;
        tdsAmount?: number;
    };
    
    // Returns
    returns?: {
        orderId: string;
        returnReason?: string;
        returnDate?: string;
        refundAmount?: number;
        refundStatus?: string;
    };
}

/**
 * Insurance Invoice/Receipt Data
 */
export interface InsuranceInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.INSURANCE;
    
    // Policy Details
    policy: {
        number: string;
        type: 'life' | 'health' | 'motor' | 'property' | 'travel' | 'business' | 'other';
        product: string;
        sumAssured: number;
        startDate: string;
        endDate: string;
        policyTerm?: number;
        premiumPayingTerm?: number;
    };
    
    // Policyholder
    policyholder: {
        name: string;
        dateOfBirth?: string;
        pan?: string;
        email?: string;
        phone?: string;
    };
    
    // Premium Details
    premium: {
        basePremium: number;
        riderPremium?: number;
        loadingCharges?: number;
        gst: number;
        totalPremium: number;
        frequency: 'single' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
        installmentNumber?: number;
        totalInstallments?: number;
    };
    
    // Riders
    riders?: {
        name: string;
        sumAssured: number;
        premium: number;
    }[];
    
    // Tax Benefits
    taxBenefits?: {
        section80C?: number;
        section80D?: number;
        section10_10D?: number;
    };
}

/**
 * Subscription Invoice Data
 */
export interface SubscriptionInvoiceData extends BaseInvoiceData {
    invoiceType: InvoiceType.SUBSCRIPTION;
    
    // Subscription Details
    subscription: {
        id: string;
        planName: string;
        planCode?: string;
        tier?: string;
        startDate: string;
        endDate?: string;
        renewalDate?: string;
        status: 'active' | 'paused' | 'cancelled' | 'expired';
    };
    
    // Billing
    billing: {
        cycle: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
        periodStart: string;
        periodEnd: string;
        nextBillingDate?: string;
    };
    
    // Plan Charges
    planCharges: {
        basePrice: number;
        addOns?: { name: string; price: number }[];
        usageCharges?: { metric: string; quantity: number; rate: number; amount: number }[];
        overageCharges?: number;
    };
    
    // Credits/Adjustments
    credits?: {
        type: string;
        amount: number;
        reason?: string;
    }[];
    
    // Proration
    prorated?: boolean;
    proratedAmount?: number;
    proratedDays?: number;
}

/**
 * Field type enum
 */
export enum FieldType {
    TEXT = 'text',
    TEXTAREA = 'textarea',
    NUMBER = 'number',
    CURRENCY = 'currency',
    DATE = 'date',
    SELECT = 'select',
    MULTISELECT = 'multiselect',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    EMAIL = 'email',
    PHONE = 'phone',
    URL = 'url',
    FILE = 'file',
    IMAGE = 'image',
    SIGNATURE = 'signature',
    ADDRESS = 'address',
    TABLE = 'table',
    CALCULATED = 'calculated',
    HIDDEN = 'hidden'
}

/**
 * Field validation rules
 */
export interface FieldValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
    custom?: (value: any) => boolean | string;
}

/**
 * Field configuration
 */
export interface FieldConfig {
    id: string;
    name: string;
    label: BilingualLabel;
    type: FieldType;
    placeholder?: BilingualLabel;
    helpText?: BilingualLabel;
    defaultValue?: any;
    validation?: FieldValidation;
    options?: { value: string; label: BilingualLabel }[];
    dependsOn?: string;
    showIf?: (formData: any) => boolean;
    computeValue?: (formData: any) => any;
    gridColumn?: string;
    className?: string;
}

/**
 * Field group configuration
 */
export interface FieldGroup {
    id: string;
    name: string;
    label: BilingualLabel;
    description?: BilingualLabel;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    order: number;
    fields: string[];
    icon?: string;
}

// ============================================================================
// SECTION 6: INVOICE TYPE CONFIGURATIONS
// ============================================================================

/**
 * Standard Invoice Configuration
 */
export const STANDARD_INVOICE_CONFIG = {
    type: InvoiceType.STANDARD,
    name: 'Standard Invoice',
    label: { en: 'Standard Invoice', hi: 'मानक बीजक' },
    description: { 
        en: 'Basic invoice for goods and services without detailed tax breakdown',
        hi: 'वस्तुओं और सेवाओं के लिए बिना विस्तृत कर विवरण के मूल बीजक'
    },
    features: [
        'Basic line items',
        'Simple tax calculation',
        'Payment terms',
        'Bank details'
    ],
    template: 'invoice-standard.hbs'
};

/**
 * Tax Invoice Configuration
 */
export const TAX_INVOICE_CONFIG = {
    type: InvoiceType.TAX,
    name: 'Tax Invoice / GST Invoice',
    label: { en: 'Tax Invoice', hi: 'कर बीजक' },
    description: {
        en: 'GST compliant tax invoice with CGST/SGST/IGST breakdown',
        hi: 'सीजीएसटी/एसजीएसटी/आईजीएसटी विवरण के साथ जीएसटी अनुपालक कर बीजक'
    },
    features: [
        'GST compliant format',
        'CGST/SGST/IGST split',
        'HSN/SAC codes',
        'Place of supply',
        'E-Invoice support',
        'E-Way Bill support'
    ],
    template: 'invoice-tax.hbs'
};

/**
 * Proforma Invoice Configuration
 */
export const PROFORMA_INVOICE_CONFIG = {
    type: InvoiceType.PROFORMA,
    name: 'Proforma Invoice',
    label: { en: 'Proforma Invoice', hi: 'प्रोफार्मा बीजक' },
    description: {
        en: 'Preliminary invoice sent before delivery of goods/services',
        hi: 'वस्तुओं/सेवाओं की डिलीवरी से पहले भेजा गया प्रारंभिक बीजक'
    },
    features: [
        'Validity period',
        'Delivery terms',
        'Convert to final invoice',
        'Quotation reference'
    ],
    template: 'invoice-proforma.hbs'
};

/**
 * Commercial Invoice Configuration
 */
export const COMMERCIAL_INVOICE_CONFIG = {
    type: InvoiceType.COMMERCIAL,
    name: 'Commercial Invoice',
    label: { en: 'Commercial Invoice', hi: 'वाणिज्यिक बीजक' },
    description: {
        en: 'Invoice for international trade and customs clearance',
        hi: 'अंतर्राष्ट्रीय व्यापार और सीमा शुल्क निकासी के लिए बीजक'
    },
    features: [
        'Export details',
        'Incoterms',
        'Shipping information',
        'Customs declarations',
        'Certificate references'
    ],
    template: 'invoice-commercial.hbs'
};

/**
 * Service Invoice Configuration
 */
export const SERVICE_INVOICE_CONFIG = {
    type: InvoiceType.SERVICE,
    name: 'Service Invoice',
    label: { en: 'Service Invoice', hi: 'सेवा बीजक' },
    description: {
        en: 'Invoice for professional and consulting services',
        hi: 'पेशेवर और परामर्श सेवाओं के लिए बीजक'
    },
    features: [
        'Service period',
        'Time tracking',
        'Project milestones',
        'Hourly billing',
        'SAC codes'
    ],
    template: 'invoice-service.hbs'
};

/**
 * Freelance Invoice Configuration
 */
export const FREELANCE_INVOICE_CONFIG = {
    type: InvoiceType.FREELANCE,
    name: 'Freelance Invoice',
    label: { en: 'Freelance Invoice', hi: 'फ्रीलांस बीजक' },
    description: {
        en: 'Invoice for freelancers and independent contractors',
        hi: 'फ्रीलांसरों और स्वतंत्र ठेकेदारों के लिए बीजक'
    },
    features: [
        'Project details',
        'Deliverables',
        'Revision tracking',
        'Usage rights',
        'Portfolio link'
    ],
    template: 'invoice-freelance.hbs'
};

// ============================================================================
// SECTION 7: TABLE CONFIGURATIONS
// ============================================================================

/**
 * Standard item table columns
 */
export const STANDARD_ITEM_COLUMNS = [
    { id: 'slNo', label: INVOICE_LABELS.sno, width: '5%', align: 'center' },
    { id: 'description', label: INVOICE_LABELS.itemDescription, width: '35%', align: 'left' },
    { id: 'quantity', label: INVOICE_LABELS.quantity, width: '10%', align: 'center' },
    { id: 'unit', label: INVOICE_LABELS.unit, width: '8%', align: 'center' },
    { id: 'rate', label: INVOICE_LABELS.rate, width: '12%', align: 'right' },
    { id: 'discount', label: INVOICE_LABELS.discount, width: '10%', align: 'right' },
    { id: 'amount', label: INVOICE_LABELS.amount, width: '15%', align: 'right' }
];

/**
 * GST item table columns
 */
export const GST_ITEM_COLUMNS = [
    { id: 'slNo', label: INVOICE_LABELS.sno, width: '4%', align: 'center' },
    { id: 'description', label: INVOICE_LABELS.itemDescription, width: '22%', align: 'left' },
    { id: 'hsnSac', label: INVOICE_LABELS.hsnSac, width: '8%', align: 'center' },
    { id: 'quantity', label: INVOICE_LABELS.quantity, width: '7%', align: 'center' },
    { id: 'unit', label: INVOICE_LABELS.unit, width: '5%', align: 'center' },
    { id: 'rate', label: INVOICE_LABELS.rate, width: '9%', align: 'right' },
    { id: 'discount', label: INVOICE_LABELS.discount, width: '7%', align: 'right' },
    { id: 'taxableValue', label: INVOICE_LABELS.taxableValue, width: '10%', align: 'right' },
    { id: 'gstRate', label: INVOICE_LABELS.gstRate, width: '6%', align: 'center' },
    { id: 'cgst', label: INVOICE_LABELS.cgst, width: '7%', align: 'right' },
    { id: 'sgst', label: INVOICE_LABELS.sgst, width: '7%', align: 'right' },
    { id: 'amount', label: INVOICE_LABELS.total, width: '10%', align: 'right' }
];

/**
 * IGST item table columns (Inter-state)
 */
export const IGST_ITEM_COLUMNS = [
    { id: 'slNo', label: INVOICE_LABELS.sno, width: '4%', align: 'center' },
    { id: 'description', label: INVOICE_LABELS.itemDescription, width: '28%', align: 'left' },
    { id: 'hsnSac', label: INVOICE_LABELS.hsnSac, width: '8%', align: 'center' },
    { id: 'quantity', label: INVOICE_LABELS.quantity, width: '8%', align: 'center' },
    { id: 'unit', label: INVOICE_LABELS.unit, width: '5%', align: 'center' },
    { id: 'rate', label: INVOICE_LABELS.rate, width: '10%', align: 'right' },
    { id: 'discount', label: INVOICE_LABELS.discount, width: '7%', align: 'right' },
    { id: 'taxableValue', label: INVOICE_LABELS.taxableValue, width: '10%', align: 'right' },
    { id: 'igst', label: INVOICE_LABELS.igst, width: '10%', align: 'right' },
    { id: 'amount', label: INVOICE_LABELS.total, width: '10%', align: 'right' }
];

// ============================================================================
// SECTION 8: HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: CurrencyCode = CurrencyCode.INR): string {
    const symbols: Partial<Record<CurrencyCode, string>> = {
        [CurrencyCode.INR]: '₹',
        [CurrencyCode.USD]: '$',
        [CurrencyCode.EUR]: '€',
        [CurrencyCode.GBP]: '£',
        [CurrencyCode.AED]: 'د.إ',
        [CurrencyCode.SGD]: 'S$',
        [CurrencyCode.AUD]: 'A$',
        [CurrencyCode.CAD]: 'C$',
        [CurrencyCode.JPY]: '¥',
        [CurrencyCode.CNY]: '¥',
        [CurrencyCode.CHF]: 'CHF',
        [CurrencyCode.SAR]: '﷼',
        [CurrencyCode.QAR]: '﷼',
        [CurrencyCode.MYR]: 'RM',
        [CurrencyCode.THB]: '฿',
        [CurrencyCode.KRW]: '₩',
        [CurrencyCode.BRL]: 'R$',
        [CurrencyCode.ZAR]: 'R',
        [CurrencyCode.RUB]: '₽'
    };
    
    const symbol = symbols[currency] || currency;
    
    if (currency === CurrencyCode.INR) {
        return `${symbol}${formatIndianNumber(amount)}`;
    }
    
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format number in Indian numbering system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    
    if (absNum < 1000) {
        return sign + absNum.toFixed(2);
    }
    
    const [intPart, decPart] = absNum.toFixed(2).split('.');
    const lastThree = intPart.slice(-3);
    const otherDigits = intPart.slice(0, -3);
    
    const formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + 
                      (otherDigits ? ',' : '') + lastThree;
    
    return sign + formatted + '.' + decPart;
}

/**
 * Convert number to words (Indian system)
 */
export function numberToWords(num: number, currency: CurrencyCode = CurrencyCode.INR): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const currencyNames: Partial<Record<CurrencyCode, { main: string; sub: string }>> = {
        [CurrencyCode.INR]: { main: 'Rupees', sub: 'Paise' },
        [CurrencyCode.USD]: { main: 'Dollars', sub: 'Cents' },
        [CurrencyCode.EUR]: { main: 'Euros', sub: 'Cents' },
        [CurrencyCode.GBP]: { main: 'Pounds', sub: 'Pence' },
        [CurrencyCode.AED]: { main: 'Dirhams', sub: 'Fils' },
        [CurrencyCode.SGD]: { main: 'Dollars', sub: 'Cents' },
        [CurrencyCode.AUD]: { main: 'Dollars', sub: 'Cents' },
        [CurrencyCode.CAD]: { main: 'Dollars', sub: 'Cents' },
        [CurrencyCode.JPY]: { main: 'Yen', sub: 'Sen' },
        [CurrencyCode.CNY]: { main: 'Yuan', sub: 'Fen' },
        [CurrencyCode.CHF]: { main: 'Francs', sub: 'Centimes' },
        [CurrencyCode.SAR]: { main: 'Riyals', sub: 'Halalas' },
        [CurrencyCode.QAR]: { main: 'Riyals', sub: 'Dirhams' },
        [CurrencyCode.KWD]: { main: 'Dinars', sub: 'Fils' },
        [CurrencyCode.BHD]: { main: 'Dinars', sub: 'Fils' },
        [CurrencyCode.OMR]: { main: 'Rials', sub: 'Baisa' }
    };
    
    // Default fallback for currencies not in the list
    const currencyData = currencyNames[currency] || { main: currency, sub: 'Cents' };
    
    if (num === 0) return 'Zero ' + currencyData.main + ' Only';
    
    const convertLessThanThousand = (n: number): string => {
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            n = 0;
        }
        if (n > 0) {
            result += ones[n] + ' ';
        }
        return result;
    };
    
    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);
    
    let result = '';
    
    if (wholePart >= 10000000) {
        result += convertLessThanThousand(Math.floor(wholePart / 10000000)) + 'Crore ';
    }
    if (wholePart >= 100000) {
        result += convertLessThanThousand(Math.floor((wholePart % 10000000) / 100000)) + 'Lakh ';
    }
    if (wholePart >= 1000) {
        result += convertLessThanThousand(Math.floor((wholePart % 100000) / 1000)) + 'Thousand ';
    }
    if (wholePart >= 1) {
        result += convertLessThanThousand(wholePart % 1000);
    }
    
    result += currencyData.main;
    
    if (decimalPart > 0) {
        result += ' and ' + convertLessThanThousand(decimalPart) + currencyData.sub;
    }
    
    return result.trim() + ' Only';
}

/**
 * Calculate GST breakdown
 */
export function calculateGST(
    taxableAmount: number, 
    gstRate: number, 
    isInterState: boolean
): { cgst: number; sgst: number; igst: number; total: number } {
    if (isInterState) {
        const igst = (taxableAmount * gstRate) / 100;
        return { cgst: 0, sgst: 0, igst, total: igst };
    } else {
        const halfRate = gstRate / 2;
        const cgst = (taxableAmount * halfRate) / 100;
        const sgst = (taxableAmount * halfRate) / 100;
        return { cgst, sgst, igst: 0, total: cgst + sgst };
    }
}

/**
 * Validate GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinPattern.test(gstin);
}

/**
 * Validate PAN format
 */
export function validatePAN(pan: string): boolean {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
}

/**
 * Get state from GSTIN
 */
export function getStateFromGSTIN(gstin: string): string | null {
    if (!gstin || gstin.length < 2) return null;
    const stateCode = gstin.substring(0, 2);
    return INDIAN_STATES[stateCode] || null;
}

/**
 * Check if supply is inter-state
 */
export function isInterStateSupply(sellerStateCode: string, buyerStateCode: string): boolean {
    return sellerStateCode !== buyerStateCode;
}

/**
 * Validate IFSC code format
 */
export function validateIFSC(ifsc: string): boolean {
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscPattern.test(ifsc);
}

/**
 * Validate UPI ID format
 */
export function validateUPI(upiId: string): boolean {
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(upiId);
}

/**
 * Validate HSN code (4, 6, or 8 digits)
 */
export function validateHSN(hsn: string): boolean {
    const hsnPattern = /^[0-9]{4}([0-9]{2})?([0-9]{2})?$/;
    return hsnPattern.test(hsn);
}

/**
 * Validate SAC code (6 digits starting with 99)
 */
export function validateSAC(sac: string): boolean {
    const sacPattern = /^99[0-9]{4}$/;
    return sacPattern.test(sac);
}

/**
 * Calculate TDS amount
 */
export function calculateTDS(amount: number, tdsRate: number, hasPAN: boolean = true): number {
    const effectiveRate = hasPAN ? tdsRate : Math.max(tdsRate, 20);
    return (amount * effectiveRate) / 100;
}

/**
 * Calculate TCS amount
 */
export function calculateTCS(amount: number, tcsRate: number, hasPAN: boolean = true): number {
    const effectiveRate = hasPAN ? tcsRate : Math.min(tcsRate * 2, 5);
    return (amount * effectiveRate) / 100;
}

/**
 * Round amount according to Indian standards
 */
export function roundAmount(amount: number, method: 'nearest' | 'up' | 'down' = 'nearest'): number {
    switch (method) {
        case 'up': return Math.ceil(amount);
        case 'down': return Math.floor(amount);
        default: return Math.round(amount);
    }
}

/**
 * Calculate due date from invoice date
 */
export function calculateDueDate(invoiceDate: string, dueDays: number): string {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + dueDays);
    return date.toISOString().split('T')[0];
}

/**
 * Check if invoice is overdue
 */
export function isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
}

/**
 * Calculate late fee
 */
export function calculateLateFee(amount: number, dueDate: string, lateFeePercent: number): number {
    const today = new Date();
    const due = new Date(dueDate);
    if (today <= due) return 0;
    const monthsLate = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return (amount * lateFeePercent * monthsLate) / 100;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix: string, sequence: number, financialYear?: string): string {
    const paddedSequence = sequence.toString().padStart(5, '0');
    if (financialYear) {
        return `${prefix}/${financialYear}/${paddedSequence}`;
    }
    return `${prefix}-${paddedSequence}`;
}

/**
 * Get current Indian financial year
 */
export function getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    if (month >= 4) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    }
    return `${year - 1}-${year.toString().slice(-2)}`;
}

/**
 * Format date in Indian format (DD-MM-YYYY)
 */
export function formatDateIndian(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Number to Hindi words
 */
export function numberToHindiWords(num: number): string {
    const hindiOnes = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
        'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
    const hindiTens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];
    
    if (num === 0) return 'शून्य';
    if (num < 20) return hindiOnes[num];
    if (num < 100) {
        const t = Math.floor(num / 10);
        const o = num % 10;
        return hindiTens[t] + (o > 0 ? ' ' + hindiOnes[o] : '');
    }
    
    let result = '';
    if (num >= 10000000) {
        result += numberToHindiWords(Math.floor(num / 10000000)) + ' करोड़ ';
        num %= 10000000;
    }
    if (num >= 100000) {
        result += numberToHindiWords(Math.floor(num / 100000)) + ' लाख ';
        num %= 100000;
    }
    if (num >= 1000) {
        result += numberToHindiWords(Math.floor(num / 1000)) + ' हज़ार ';
        num %= 1000;
    }
    if (num >= 100) {
        result += hindiOnes[Math.floor(num / 100)] + ' सौ ';
        num %= 100;
    }
    if (num > 0) {
        result += numberToHindiWords(num);
    }
    return result.trim();
}

// ============================================================================
// SECTION 9: SAMPLE DATA
// ============================================================================

/**
 * Sample seller data
 */
export const SAMPLE_SELLER: PartyInfo = {
    name: 'Risenex Dynamics',
    nameHindi: 'राइसनेक्स डायनामिक्स',
    tradeName: 'Risenex Dynamics',
    address: {
        line1: '123, Tech Park',
        line2: 'Sector 5',
        city: 'Ferozepur',
        state: 'Punjab',
        stateCode: '03',
        country: 'India',
        countryCode: 'IN',
        pincode: '152002'
    },
    contact: {
        phone: '+91 98765 43210',
        email: 'info@risenex.com',
        website: 'www.risenex.com'
    },
    taxRegistration: {
        gstin: '03AABCU9603R1ZP',
        pan: 'AABCU9603R'
    },
    bankDetails: {
        accountName: 'Risenex Dynamics',
        accountNumber: '1234567890123456',
        bankName: 'State Bank of India',
        branch: 'Ferozepur Main Branch',
        ifscCode: 'SBIN0001234',
        accountType: 'current'
    },
    upiDetails: {
        upiId: 'risenex@sbi'
    }
};

/**
 * Sample buyer data
 */
export const SAMPLE_BUYER: PartyInfo = {
    name: 'Tech Solutions Pvt. Ltd.',
    address: {
        line1: '456, Business Center',
        line2: 'MG Road',
        city: 'Chandigarh',
        state: 'Chandigarh',
        stateCode: '04',
        country: 'India',
        countryCode: 'IN',
        pincode: '160017'
    },
    contact: {
        phone: '+91 98765 12345',
        email: 'purchase@techsolutions.com'
    },
    taxRegistration: {
        gstin: '04AABCT1234R1ZQ',
        pan: 'AABCT1234R'
    }
};

/**
 * Sample line items
 */
export const SAMPLE_LINE_ITEMS: InvoiceLineItem[] = [
    {
        id: 'item-1',
        slNo: 1,
        itemCode: 'SW-001',
        description: 'Soriva AI Platform - Annual Subscription',
        descriptionHindi: 'सोरिवा एआई प्लेटफॉर्म - वार्षिक सदस्यता',
        sacCode: '998314',
        quantity: 1,
        unit: UnitOfMeasurement.YEAR,
        unitPrice: 50000,
        grossAmount: 50000,
        discount: {
            type: 'percentage',
            value: 10,
            amount: 5000
        },
        taxableAmount: 45000,
        taxes: [
            { taxType: TaxType.IGST, rate: 18, taxableAmount: 45000, taxAmount: 8100 }
        ],
        totalTax: 8100,
        netAmount: 53100
    },
    {
        id: 'item-2',
        slNo: 2,
        itemCode: 'SV-001',
        description: 'Implementation & Training Services',
        descriptionHindi: 'कार्यान्वयन और प्रशिक्षण सेवाएं',
        sacCode: '998313',
        quantity: 40,
        unit: UnitOfMeasurement.HOUR,
        unitPrice: 2000,
        grossAmount: 80000,
        taxableAmount: 80000,
        taxes: [
            { taxType: TaxType.IGST, rate: 18, taxableAmount: 80000, taxAmount: 14400 }
        ],
        totalTax: 14400,
        netAmount: 94400
    }
];

// ============================================================================
// END OF FILE
// ============================================================================