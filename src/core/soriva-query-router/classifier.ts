/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA QUERY CLASSIFIER v2.0 (Day 2 Complete)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Path: src/core/soriva-query-router/classifier.ts
 * Created: January 25, 2026
 * Author: Amandeep, Risenex Dynamics
 * 
 * NEW in Day 2:
 * - Movie patterns with actor/title extraction
 * - Gita patterns with chapter/shlok/topic extraction
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  QueryType,
  ResponseMode,
  ClassificationResult,
  PatternDefinition,
  UserContext,
} from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FESTIVAL PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FESTIVAL_NAMES = [
  'holi', 'diwali', 'deepavali', 'dussehra', 'navratri', 'durga puja',
  'ganesh chaturthi', 'ganpati', 'raksha bandhan', 'rakhi', 'janmashtami',
  'mahashivratri', 'shivratri', 'karwa chauth', 'chhath', 'onam', 'pongal',
  'baisakhi', 'vaisakhi', 'lohri', 'makar sankranti', 'sankranti', 'ugadi',
  'gudi padwa', 'bihu', 'bhai dooj', 'dhanteras', 'basant panchami',
  'gurpurab', 'guru nanak jayanti', 'guru purab',
  'eid', 'eid ul fitr', 'eid ul adha', 'bakrid', 'muharram', 'milad un nabi',
  'republic day', 'independence day', 'gandhi jayanti', '26 january', '15 august',
  'christmas', 'new year', 'easter', 'thanksgiving', 'halloween',
  'valentines day', 'mothers day', 'fathers day', 'labour day', 'labor day',
  'boxing day', 'memorial day', 'veterans day', 'mlk day', 'juneteenth',
  'chinese new year', 'lunar new year',
];

const FESTIVAL_PATTERNS: RegExp[] = [
  /\b(kab|when|date|कब|कबे|kis din)\b.*(hai|है|is|hoga|होगा|होगी|aayega|आएगा|aata)/i,
  /\b(holi|diwali|eid|christmas|navratri|dussehra|ganesh chaturthi)\b.*\b(20\d{2})\b/i,
  /\b(20\d{2})\b.*(mein|mei|में|me|ka|ki|ke).*(holi|diwali|eid)/i,
  /\b(is|kya|क्या)\b.*(holi|diwali|eid|festival).*\b(on|ko|को)\b/i,
  /\b(what|which|konsi|कौनसी)\b.*(date|tarikh|तारीख).*\b(is|hai|है)\b/i,
  /\b(holi|diwali|eid|christmas|navratri)\b.*(ki|ka|ke|की|का|के).*(date|tarikh|तारीख)/i,
  /\b(aaj|kal|today|tomorrow|parso)\b.*(kya|konsa|which|क्या).*(festival|tyohar|त्योहार)/i,
  /\b(is|kya|क्या)\b.*(today|aaj|आज).*(holi|diwali|eid|festival)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE/TIME PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DATE_TIME_PATTERNS: RegExp[] = [
  /\b(aaj|today|आज)\b.*(kya|what|क्या).*(date|tarikh|तारीख|din|day)/i,
  /\b(kya|what|क्या)\b.*(date|tarikh|तारीख).*(hai|is|है)/i,
  /\b(aaj|today|आज)\b.*(konsa|which|kaunsa).*(din|day|vaar|वार)/i,
  /\b(time|samay|समय|waqt|वक्त)\b.*(kya|what|क्या).*(hai|is|है)/i,
  /\b(kitne|kitna|कितने|कितना)\b.*(baje|बजे)/i,
  /\b(current|abhi|अभी)\b.*(time|date|samay)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEATHER PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WEATHER_PATTERNS: RegExp[] = [
  /\b(mausam|weather|मौसम)\b.*(kaisa|kaisi|kaise|how|कैसा|कैसी)/i,
  /\b(mausam|weather|मौसम)\b.*(kya|क्या).*(haal|hal|हाल)/i,  // "mausam ka kya haal"
  /\b(aaj|today|kal|tomorrow|आज|कल)\b.*(mausam|weather|मौसम)/i,  // "aaj ka mausam" / "aaj ke mausam"
  /\b(aaj|today|kal|tomorrow)\b.*(barish|rain|dhoop|sunny|बारिश|धूप)/i,
  /\b(temperature|tapman|तापमान|temp)\b.*(kya|what|क्या|kitna)/i,
  /\b([a-zA-Z]+)\b.*(ka|ki|ke).*(mausam|weather|मौसम)/i,
  /\b(weather|mausam)\b.*(in|ka|ki)\b.*([a-zA-Z]+)/i,
  /\b(is it|kya)\b.*(hot|cold|garam|thanda|garmi|sardi)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATH PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MATH_PATTERNS: RegExp[] = [
  /^\s*[\d\s\+\-\*\/\(\)\.\^%]+\s*[=?]?\s*$/,
  /\b(what is|calculate|kitna|कितना)\b.*[\d]+\s*[\+\-\*\/]\s*[\d]+/i,
  /\b(\d+)\s*(times|plus|minus|divided by|multiplied by|x|×)\s*(\d+)/i,
  /\b(square root|sqrt|cube root)\b.*\b(\d+)/i,
  /\b(\d+)\s*(%|percent|percentage)\s*(of|ka)\s*(\d+)/i,
  /\b(\d+)\s*(km|miles|kg|pounds|celsius|fahrenheit|meters|feet)\s*(to|in|mein)\s*(km|miles|kg|pounds|celsius|fahrenheit|meters|feet)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GREETING PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GREETING_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|hola|namaste|namaskar|नमस्ते|नमस्कार|jai siyaram|har har mahadev|radhe radhe|sat sri akal|assalam|salam)[\s!.]*$/i,
  /^(hi|hello|hey)\s+(soriva|claude|assistant|dost|friend|bhai|bro)[\s!.]*$/i,
  /^(good\s+)?(morning|evening|afternoon|night|subah|shaam|raat)[\s!.]*$/i,
  /^(kaise|kaisi|kaisa|how are you|how r u|sup|wassup|kya haal)[\s!?.]*$/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IDENTITY PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const IDENTITY_PATTERNS: RegExp[] = [
  /\b(tum|tu|aap|you)\b.*(kaun|who|कौन).*(ho|hai|are|हो|है)/i,
  /\b(what|kya|क्या)\b.*(is|hai|है).*(soriva|ye app|this app)/i,
  /\b(tumhara|tera|apka|your)\b.*(naam|name|नाम).*(kya|what|क्या)/i,
  /\b(who|kisne|किसने)\b.*(made|created|banaya|बनाया).*(you|tum|tumhe|soriva)/i,
  /\b(tell\s+me\s+about\s+yourself|apne\s+bare\s+mein\s+batao|introduce\s+yourself)\b/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEWS PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NEWS_PATTERNS: RegExp[] = [
  /\b(latest|aaj ki|today's|ताज़ा|taza)\b.*(news|khabar|खबर|headlines)/i,
  /\b(what's happening|kya ho raha|क्या हो रहा)\b.*(in|mein|में)/i,
  /\b(news|khabar|खबर)\b.*(about|ke bare|के बारे)/i,
];
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏪 LOCAL BUSINESS PATTERNS (Prevents Hallucination)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LOCAL_BUSINESS_PATTERNS: RegExp[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // THEATRE/CINEMA (India + International)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Hindi/Hinglish patterns
  /\b(theatre|theater|cinema|multiplex|pvr|inox|cinepolis|talkies)\b.*(near|in|mein|में|kahan|where|kaun|konsa|list)/i,
  /\b(near|in|mein|में|kahan|where)\b.*(theatre|theater|cinema|multiplex|talkies)/i,
  /\b(movie|film)\b.*(theatre|theater|cinema|hall).*(kahan|where|kaun|konsa|hai)/i,
  /\b(movie|film)\b.*(dekhne|watch|lagne).*(kahan|where|theatre|theater|cinema)/i,
  /\b(kahan|where)\b.*(movie|film).*(dekh|watch|lagi)/i,
  /\b(mein|mei|me|में|in)\b.*(theatre|theater|cinema|movie|film).*(kaun|konsa|kahan|which|list|best)/i,
  
  // Movie + location (kahan lagi, where showing)
  /\b(kahan|kahaan|where)\b.*(lagi|chal|running|showing|playing)/i,
  /\b(movie|film)\b.*(kahan|kahaan|where).*(lagi|chal|dekh|running|showing)/i,
  
  // International theatre chains
  /\b(amc|regal|cinemark|odeon|cineworld|vue|imax|cineplex)\b.*(near|in|where|location|find)/i,
  /\b(showtime|showtimes|movie\s*time|screening)\b.*(near|in|at|for)/i,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESTAURANT/FOOD (India + International)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Hindi/Hinglish
  /\b(restaurant|hotel|dhaba|cafe|coffee|khana|food|pizza|burger)\b.*(near|in|mein|kahan|where|best|accha|top)/i,
  /\b(near|in|mein|kahan|where)\b.*(restaurant|hotel|dhaba|cafe|khana)/i,
  /\b(khane|khaana|eat|dinner|lunch|breakfast)\b.*(kahan|where|jagah|place)/i,
  
  // International
  /\b(restaurant|diner|bistro|eatery|steakhouse|sushi|thai|mexican|italian|chinese)\b.*(near|in|around|find|best|top)/i,
  /\b(where\s*to\s*eat|places\s*to\s*eat|food\s*near|dining)\b/i,
  /\b(uber\s*eats|doordash|grubhub|deliveroo|zomato|swiggy)\b.*(near|in|deliver)/i,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HOSPITAL/MEDICAL (India + International)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Hindi/Hinglish
  /\b(hospital|clinic|doctor|dawai|medical|pharmacy|chemist)\b.*(near|in|mein|kahan|where|best)/i,
  /\b(near|in|mein|kahan|where)\b.*(hospital|clinic|doctor|medical)/i,
  
  // International
  /\b(hospital|clinic|urgent\s*care|emergency\s*room|er|physician|dentist|specialist)\b.*(near|in|around|find)/i,
  /\b(cvs|walgreens|rite\s*aid|boots|pharmacy)\b.*(near|in|around)/i,
  /\b(healthcare|medical\s*center|health\s*clinic)\b.*(near|in|find)/i,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SHOPPING (India + International)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /\b(shop|store|mall|market|showroom|dukaan)\b.*(near|in|mein|kahan|where)/i,
  /\b(walmart|target|costco|ikea|bestbuy|amazon\s*store)\b.*(near|in|location)/i,
  /\b(grocery|supermarket|hypermarket)\b.*(near|in|around)/i,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SERVICES (India + International)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /\b(atm|bank|petrol|pump|gas\s*station|parking)\b.*(near|in|mein|kahan|where)/i,
  /\b(chase|wells\s*fargo|bank\s*of\s*america|hsbc|barclays)\b.*(near|in|branch|atm)/i,
  /\b(shell|bp|exxon|chevron|petrol|gas)\b.*(near|in|station)/i,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GENERAL LOCAL QUERIES (Universal)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /\b(near\s*me|nearby|nazdeek|paas\s*mein|aas\s*paas|mere\s*paas)\b/i,
  /\b(find|locate|search|looking\s*for)\b.*(near|around|close\s*to)/i,
  /\b(directions\s*to|how\s*to\s*get\s*to|route\s*to)\b/i,
];
const CITIES = [
  // India - Major
  'delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad',
  'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal',
  'chandigarh', 'ludhiana', 'amritsar', 'agra', 'varanasi', 'patna', 'ranchi',
  'ferozepur', 'firozpur', 'bathinda', 'jalandhar', 'patiala', 'mohali',
  'gurgaon', 'gurugram', 'noida', 'ghaziabad', 'faridabad', 'surat', 'kochi',
  'thiruvananthapuram', 'coimbatore', 'vizag', 'visakhapatnam', 'mysore', 'mangalore',
  
  // USA
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'san francisco',
  'seattle', 'boston', 'miami', 'dallas', 'austin', 'denver', 'atlanta',
  'las vegas', 'san diego', 'portland', 'philadelphia', 'washington dc',
  
  // UK
  'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'glasgow', 'edinburgh',
  'bristol', 'cardiff', 'belfast', 'oxford', 'cambridge',
  
  // Canada
  'toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'edmonton', 'winnipeg',
  
  // Australia
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra',
  
  // Europe
  'paris', 'berlin', 'amsterdam', 'madrid', 'barcelona', 'rome', 'milan',
  'vienna', 'zurich', 'geneva', 'brussels', 'dublin', 'lisbon', 'prague',
  'stockholm', 'oslo', 'copenhagen', 'helsinki', 'warsaw', 'budapest',
  
  // Middle East
  'dubai', 'abu dhabi', 'doha', 'riyadh', 'jeddah', 'muscat', 'kuwait city',
  'bahrain', 'sharjah', 'ajman',
  
  // Asia
  'singapore', 'hong kong', 'tokyo', 'osaka', 'seoul', 'bangkok', 'kuala lumpur',
  'jakarta', 'manila', 'ho chi minh', 'hanoi', 'taipei', 'shanghai', 'beijing',
  
  // Africa
  'johannesburg', 'cape town', 'cairo', 'lagos', 'nairobi', 'casablanca',
  
  // South America
  'sao paulo', 'rio de janeiro', 'buenos aires', 'bogota', 'lima', 'santiago',
];
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 MOVIE PATTERNS (Day 2 - Enhanced)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BOLLYWOOD_ACTORS = [
  'shah rukh', 'shahrukh', 'srk', 'salman', 'aamir', 'akshay', 'ajay',
  'ranveer', 'ranbir', 'varun', 'tiger', 'shahid', 'hrithik', 'vicky',
  'deepika', 'alia', 'priyanka', 'katrina', 'kareena', 'anushka',
  'kartik', 'ayushmann', 'rajkummar', 'pankaj', 'nawazuddin',
  'amitabh', 'sunny', 'akshaye', 'anil', 'sanjay', 'john', 'diljit',
  'tabu', 'vidya', 'kangana', 'kriti', 'shraddha', 'parineeti',
];

const MOVIE_TITLES = [
  'pathaan', 'pathan', 'jawan', 'dunki', 'tiger', 'war', 'fighter',
  'animal', 'rocky', 'pushpa', 'bahubali', 'rrr', 'kgf',
  'gadar', 'border', 'tare zameen par', '3 idiots', 'pk', 'dangal',
  'stree', 'bhediya', 'munjya', 'shaitaan', 'crew', 'kalki',
];

const MOVIE_PATTERNS: RegExp[] = [
  // Actor ki movie
  /\b(shah rukh|shahrukh|srk|salman|aamir|akshay|ranveer|ranbir|deepika|alia|hrithik|tiger|vicky|diljit)\b.*(ki|ka|ke|की|का|के).*(movie|film|picture|release)/i,
  
  // Movie + release/rating
  /\b(movie|film|picture)\b.*(release|rating|review|kaisi|collection|box office)/i,
  
  // Specific movie name
  /\b(pathaan|jawan|dunki|animal|fighter|pushpa|kalki|stree|gadar|border)\b.*(release|rating|kaisi|collection|kab|when)/i,
  
  // New/latest/upcoming movie
  /\b(new|latest|upcoming|nayi|नई)\b.*(movie|film|release)/i,
  
  // Trending movies
  /\b(trending|popular|hit|superhit|blockbuster)\b.*(movie|film)/i,
  
  // Movie recommendations
  /\b(movie|film)\b.*(dekhni|suggest|recommend|batao)/i,
  /\b(suggest|recommend)\b.*(movie|film)/i,
  
  // OTT specific
  /\b(netflix|prime|hotstar|zee5|sonyliv)\b.*(movie|film|show|series)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏏 SPORTS PATTERNS (Day 3 - Added)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SPORTS_TEAMS = [
  'india', 'pakistan', 'australia', 'england', 'new zealand', 'south africa',
  'west indies', 'sri lanka', 'bangladesh', 'afghanistan', 'zimbabwe',
  'mumbai indians', 'csk', 'chennai super kings', 'rcb', 'royal challengers',
  'kkr', 'kolkata knight riders', 'dc', 'delhi capitals', 'pbks', 'rr',
  'gt', 'gujarat titans', 'lsg', 'lucknow super giants', 'srh',
  'manchester united', 'man utd', 'liverpool', 'arsenal', 'chelsea', 'man city',
  'real madrid', 'barcelona', 'barca', 'bayern', 'psg', 'juventus',
];

const SPORTS_KEYWORDS = [
  'match', 'score', 'result', 'live', 'cricket', 'football', 'soccer',
  'ipl', 't20', 'odi', 'test', 'world cup', 'asia cup', 'champions league',
  'premier league', 'la liga', 'serie a', 'bundesliga', 'epl',
  'goal', 'wicket', 'run', 'batting', 'bowling', 'innings',
  'win', 'won', 'lost', 'draw', 'defeat', 'victory',
  'schedule', 'fixture', 'standings', 'points table', 'ranking',
];

const SPORTS_PATTERNS: RegExp[] = [
  // Team vs Team
  /\b(india|pakistan|australia|england|new zealand|south africa|west indies|sri lanka|bangladesh)\b.*(vs|versus|v\/s|match|score|result)/i,
  
  // Match status/score
  /\b(match|game)\b.*(score|result|status|update|live|kya hua|kaisa raha)/i,
  /\b(score|result)\b.*(kya|what|hai|is|tha|was)/i,
  
  // Cricket specific
  /\b(cricket|ipl|t20|odi|test)\b.*(match|score|result|today|kal|yesterday|live)/i,
  /\b(ipl|t20|odi|test|world cup|asia cup)\b.*(schedule|fixture|match|score)/i,
  
  // Football specific
  /\b(football|soccer|premier league|champions league|la liga|epl)\b.*(match|score|result|today)/i,
  
  // Live updates
  /\b(live|current)\b.*(score|match|update)/i,
  /\b(match|game)\b.*(live|abhi|now)/i,
  
  // Recent/latest match
  /\b(recent|latest|last|aaj ka|kal ka|yesterday|today)\b.*(match|game|score)/i,
  
  // Who won
  /\b(kaun|who|kisne)\b.*(jeeta|jita|won|win)/i,
  /\b(won|win|jeeta|jita)\b.*(match|game|series|tournament)/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 BHAGAVAD GITA PATTERNS (Day 2 - NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GITA_KEYWORDS = [
  'gita', 'geeta', 'bhagavad', 'bhagwat', 'bhagavadgita', 'गीता', 'भगवद्गीता',
  'krishna', 'कृष्ण', 'arjun', 'arjuna', 'अर्जुन',
  'shlok', 'shloka', 'श्लोक', 'verse', 'chapter', 'adhyay', 'अध्याय',
];

const GITA_TOPICS = [
  'karma', 'कर्म', 'dharma', 'धर्म', 'duty',
  'bhakti', 'भक्ति', 'devotion',
  'yoga', 'योग', 'meditation', 'dhyan', 'ध्यान',
  'atma', 'आत्मा', 'soul', 'spirit',
  'moksha', 'मोक्ष', 'liberation', 'mukti', 'मुक्ति',
  'sankhya', 'सांख्य', 'knowledge', 'gyan', 'ज्ञान',
  'detachment', 'vairagya', 'वैराग्य',
  'surrender', 'samarpan', 'समर्पण',
];

const GITA_PATTERNS: RegExp[] = [
  // "Gita chapter 2 shlok 47" / "Gita 2.47" / "Gita 2:47"
  /\b(gita|geeta|bhagavad|भगवद्गीता|गीता)\b.*\b(chapter|adhyay|अध्याय)?\s*(\d{1,2})\s*[.:,]?\s*(shlok|shloka|verse|श्लोक)?\s*(\d{1,3})?/i,
  
  // "Chapter 2 of Gita"
  /\b(chapter|adhyay)\s*(\d{1,2})\b.*(gita|geeta|भगवद्गीता)/i,
  
  // "Gita mein karma ke baare mein"
  /\b(gita|geeta|गीता)\b.*(mein|में|about|ke bare|बारे).*(karma|dharma|bhakti|yoga|moksha|atma|soul)/i,
  
  // "Krishna ne kya kaha" / "What did Krishna say"
  /\b(krishna|कृष्ण)\b.*(ne|ने)?.*(kaha|said|bola|बोले|kehte|कहते)/i,
  
  // "Karma yoga kya hai"
  /\b(karma|dharma|bhakti|gyan|sankhya)\s*(yoga)?\b.*(kya|what|क्या).*(hai|is|है)/i,
  
  // "Gita shlok" / "Famous Gita verse"
  /\b(famous|popular|best|important)\b.*(gita|geeta|गीता).*(shlok|verse|श्लोक)/i,
  
  // "Gita ka saar" / "Essence of Gita"
  /\b(gita|geeta|गीता)\b.*(ka|ki|का|की).*(saar|essence|summary|meaning|arth|अर्थ)/i,
  
  // Direct shlok reference "2.47" "4:7"
  /^(\d{1,2})[.:](\d{1,3})$/,
  
  // "Tell me about karma in Gita"
  /\b(tell|batao|bataiye)\b.*(karma|dharma|moksha|bhakti).*(gita|geeta)?/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CLASSIFIER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class QueryClassifier {
  
  classify(query: string, context?: UserContext): ClassificationResult {
    const startTime = Date.now();
    const normalizedQuery = this.normalizeQuery(query);
    
    // Try each classifier in priority order
    let result = this.tryFestivalClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryDateTimeClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryMathClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryGreetingClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryWeatherClassification(normalizedQuery, query, context);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryIdentityClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    // LOCAL_BUSINESS - Prevents hallucination, forces web search
    result = this.tryLocalBusinessClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    // Day 2: Gita before Movie (more specific)
    result = this.tryGitaClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryMovieClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    // Day 3: Sports classification
    result = this.trySportsClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    result = this.tryNewsClassification(normalizedQuery, query);
    if (result) return this.finalize(result, startTime);
    
    // Default: GENERAL
    return this.finalize({
      queryType: 'GENERAL',
      responseMode: 'LLM_FULL',
      confidence: 0.5,
      extracted: { searchQuery: query },
    }, startTime);
  }
  
  // ─────────────────────────────────────────────────────────────
  // FESTIVAL
  // ─────────────────────────────────────────────────────────────
  
  private tryFestivalClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    const festivalMatch = FESTIVAL_NAMES.find(f => normalized.includes(f));
    
    if (festivalMatch) {
      const hasDatePattern = FESTIVAL_PATTERNS.some(p => p.test(original));
      
      if (hasDatePattern || normalized.includes('kab') || normalized.includes('when') || 
          normalized.includes('date') || normalized.includes('2026') || normalized.includes('2025')) {
        return {
          queryType: 'FESTIVAL',
          responseMode: 'DIRECT',
          confidence: 0.95,
          extracted: { festivalName: festivalMatch },
          matchedPattern: 'FESTIVAL_NAME + DATE_PATTERN',
        };
      }
    }
    
    for (const pattern of FESTIVAL_PATTERNS) {
      const match = original.match(pattern);
      if (match) {
        const extracted = this.extractFestivalName(normalized);
        if (extracted) {
          return {
            queryType: 'FESTIVAL',
            responseMode: 'DIRECT',
            confidence: 0.9,
            extracted: { festivalName: extracted },
            matchedPattern: pattern.toString(),
          };
        }
      }
    }
    
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // DATE/TIME
  // ─────────────────────────────────────────────────────────────
  
  private tryDateTimeClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    for (const pattern of DATE_TIME_PATTERNS) {
      if (pattern.test(original)) {
        return {
          queryType: 'DATE_TIME',
          responseMode: 'DIRECT',
          confidence: 0.95,
          extracted: {},
          matchedPattern: pattern.toString(),
        };
      }
    }
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // WEATHER
  // ─────────────────────────────────────────────────────────────
  
  private tryWeatherClassification(normalized: string, original: string, context?: UserContext): Partial<ClassificationResult> | null {
  for (const pattern of WEATHER_PATTERNS) {
    const match = original.match(pattern);
    if (match) {
      // ✅ FIX: Use CITIES list, not regex
      let location = CITIES.find(city => normalized.includes(city));
      
      // Fallback to context location
      if (!location && context?.location) {
        location = context.location;
      }
      
      return {
        queryType: 'WEATHER',
        responseMode: 'LLM_MINIMAL',
        confidence: 0.9,
        extracted: { location },
        matchedPattern: pattern.toString(),
      };
    }
  }
  return null;
}
  
  // ─────────────────────────────────────────────────────────────
  // MATH
  // ─────────────────────────────────────────────────────────────
  
  private tryMathClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    for (const pattern of MATH_PATTERNS) {
      const match = original.match(pattern);
      if (match) {
        const mathExpr = this.extractMathExpression(original);
        if (mathExpr) {
          return {
            queryType: 'MATH',
            responseMode: 'DIRECT',
            confidence: 0.95,
            extracted: { mathExpression: mathExpr },
            matchedPattern: pattern.toString(),
          };
        }
      }
    }
    return null;
  }
  // ─────────────────────────────────────────────────────────────
  // 🏪 LOCAL BUSINESS (Prevents Hallucination - Forces Web Search)
  // ─────────────────────────────────────────────────────────────
  
  private tryLocalBusinessClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    // Check patterns
    for (const pattern of LOCAL_BUSINESS_PATTERNS) {
      if (pattern.test(original)) {
        // Extract city if mentioned
        const cityMatch = CITIES.find(city => normalized.includes(city));
        
        return {
          queryType: 'LOCAL_BUSINESS',
          responseMode: 'LLM_MINIMAL',  // Will force web search
          confidence: 0.9,
          extracted: {
            searchQuery: original,
            location: cityMatch || undefined,
          },
          matchedPattern: pattern.toString(),
        };
      }
    }
    
    // Check if any city + business type combo
    const cityMatch = CITIES.find(city => normalized.includes(city));
    const businessWords = ['theatre', 'theater', 'cinema', 'restaurant', 'hotel', 'hospital', 'shop', 'mall', 'cafe'];
    const hasBusinessWord = businessWords.some(word => normalized.includes(word));
    
    if (cityMatch && hasBusinessWord) {
      return {
        queryType: 'LOCAL_BUSINESS',
        responseMode: 'LLM_MINIMAL',
        confidence: 0.85,
        extracted: {
          searchQuery: original,
          location: cityMatch,
        },
        matchedPattern: 'CITY_BUSINESS_COMBO',
      };
    }
    
    return null;
  }
  // ─────────────────────────────────────────────────────────────
  // GREETING
  // ─────────────────────────────────────────────────────────────
  
  private tryGreetingClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(original.trim())) {
      return {
        queryType: 'GREETING',
        responseMode: 'LLM_MINIMAL',  // ✅ Now goes to LLM
        confidence: 0.98,
        extracted: {},
        matchedPattern: pattern.toString(),
      };
    }
  }
  return null;
}
  
  // ─────────────────────────────────────────────────────────────
  // IDENTITY
  // ─────────────────────────────────────────────────────────────
  
  private tryIdentityClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    for (const pattern of IDENTITY_PATTERNS) {
      if (pattern.test(original)) {
        return {
          queryType: 'IDENTITY',
          responseMode: 'LLM_MINIMAL',
          confidence: 0.95,
          extracted: {},
          matchedPattern: pattern.toString(),
        };
      }
    }
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // NEWS
  // ─────────────────────────────────────────────────────────────
  
  private tryNewsClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    for (const pattern of NEWS_PATTERNS) {
      if (pattern.test(original)) {
        return {
          queryType: 'NEWS',
          responseMode: 'LLM_MINIMAL',
          confidence: 0.85,
          extracted: { searchQuery: original },
          matchedPattern: pattern.toString(),
        };
      }
    }
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // 🎬 MOVIE (Day 2)
  // ─────────────────────────────────────────────────────────────
  
  private tryMovieClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    // Check for actor names
    const actorMatch = BOLLYWOOD_ACTORS.find(a => normalized.includes(a));
    
    // Check for movie titles
// Check for movie titles (with sequel support - Border 2, Pushpa 2, etc.)
    let movieMatch: string | undefined = MOVIE_TITLES.find(m => normalized.includes(m));
    
    // If base movie found, check for sequel number
    if (movieMatch) {
      const sequelPattern = new RegExp(`${movieMatch}\\s*(\\d+)`, 'i');
      const sequelMatch = normalized.match(sequelPattern);
      if (sequelMatch && sequelMatch[1]) {
        movieMatch = `${movieMatch} ${sequelMatch[1]}`;
      }
    }   
    // Check patterns
    for (const pattern of MOVIE_PATTERNS) {
      if (pattern.test(original)) {
        // Extract year if present
        const yearMatch = original.match(/\b(20\d{2})\b/);
        const movieYear = yearMatch ? parseInt(yearMatch[1]) : undefined;
        
        return {
          queryType: 'MOVIE',
          responseMode: 'LLM_MINIMAL', 
          confidence: 0.9,
          extracted: {
            actorName: actorMatch,
            movieTitle: movieMatch,
            movieYear,
            searchQuery: original,
          },
          matchedPattern: pattern.toString(),
        };
      }
    }
    
    // If actor or movie found but no pattern matched
    if (actorMatch || movieMatch) {
      const yearMatch = original.match(/\b(20\d{2})\b/);
      return {
        queryType: 'MOVIE',
        responseMode: 'LLM_MINIMAL',
        confidence: 0.85,
        extracted: {
          actorName: actorMatch,
          movieTitle: movieMatch,
          movieYear: yearMatch ? parseInt(yearMatch[1]) : undefined,
          searchQuery: original,
        },
        matchedPattern: 'ACTOR_OR_MOVIE_NAME',
      };
    }
    
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // 🏏 SPORTS (Day 3)
  // ─────────────────────────────────────────────────────────────
  
  private trySportsClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    // Check for sports teams
    const teamMatch = SPORTS_TEAMS.find(t => normalized.includes(t.toLowerCase()));
    
    // Check for sports keywords
    const keywordMatch = SPORTS_KEYWORDS.find(k => normalized.includes(k.toLowerCase()));
    
    // Check patterns
    for (const pattern of SPORTS_PATTERNS) {
      if (pattern.test(original)) {
        return {
          queryType: 'SPORTS',
          responseMode: 'LLM_MINIMAL',
          confidence: 0.9,
          extracted: {
            team: teamMatch,
            keyword: keywordMatch,
            searchQuery: original,
          },
          matchedPattern: pattern.toString(),
        };
      }
    }
    
    // If team + keyword found but no pattern matched
    if (teamMatch && keywordMatch) {
      return {
        queryType: 'SPORTS',
        responseMode: 'LLM_MINIMAL',
        confidence: 0.85,
        extracted: {
          team: teamMatch,
          keyword: keywordMatch,
          searchQuery: original,
        },
        matchedPattern: 'TEAM_AND_KEYWORD',
      };
    }
    
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // 📖 GITA (Day 2)
  // ─────────────────────────────────────────────────────────────
  
  private tryGitaClassification(normalized: string, original: string): Partial<ClassificationResult> | null {
    // 🛡️ GREETING FILTER - Don't trigger shlok for religious greetings
    const RELIGIOUS_GREETINGS = [
      'jai siyaram', 'jai shri ram', 'har har mahadev', 'jai mata di',
      'radhe radhe', 'jai shri krishna', 'radhe krishna', 'hare krishna',
      'sat sri akal', 'jai hanuman', 'jai bajrangbali', 'namoh parvati',
      'shubh ratri', 'good night', 'good morning', 'suprabhat'
    ];
    
    const EXPLICIT_SHLOK_TRIGGERS = [
      'shlok', 'shloka', 'verse', 'gita se', 'geeta se',
      'batao', 'sunao', 'bataiye', 'sunaiye', 'tell me', 'give me',
      'kya kehti', 'kya kahti', 'what does gita say', 'aaj ka shlok'
    ];
    
    const hasGreetingWords = RELIGIOUS_GREETINGS.some(g => normalized.includes(g));
    const wantsShlok = EXPLICIT_SHLOK_TRIGGERS.some(t => normalized.includes(t));
    
    if (hasGreetingWords && !wantsShlok) {
      return null;
    }
    const hasGitaKeyword = GITA_KEYWORDS.some(k => normalized.includes(k));
    const hasGitaTopic = GITA_TOPICS.some(t => normalized.includes(t));
    
    if (!hasGitaKeyword && !hasGitaTopic) {
      // Check for direct shlok reference like "2.47"
      const directRef = original.match(/^(\d{1,2})[.:](\d{1,3})$/);
      if (!directRef) return null;
    }
    
    // Try to extract chapter and shlok
    let gitaChapter: number | undefined;
    let gitaShlok: number | undefined;
    let gitaKeyword: string | undefined;
    
    // Pattern: "Gita 2.47" or "chapter 2 shlok 47"
    const chapterShlokMatch = original.match(/\b(chapter|adhyay|अध्याय)?\s*(\d{1,2})\s*[.:,]?\s*(shlok|shloka|verse|श्लोक)?\s*(\d{1,3})/i);
    if (chapterShlokMatch) {
      gitaChapter = parseInt(chapterShlokMatch[2]);
      if (chapterShlokMatch[4]) {
        gitaShlok = parseInt(chapterShlokMatch[4]);
      }
    }
    
    // Direct reference "2.47"
    const directRef = original.match(/^(\d{1,2})[.:](\d{1,3})$/);
    if (directRef) {
      gitaChapter = parseInt(directRef[1]);
      gitaShlok = parseInt(directRef[2]);
    }
    
    // Extract topic keyword
    gitaKeyword = GITA_TOPICS.find(t => normalized.includes(t));
    
    // Check patterns
    for (const pattern of GITA_PATTERNS) {
      if (pattern.test(original)) {
        return {
          queryType: 'GITA',
          responseMode: 'DIRECT',
          confidence: 0.95,
          extracted: {
            gitaChapter,
            gitaShlok,
            gitaKeyword,
            searchQuery: original,
          },
          matchedPattern: pattern.toString(),
        };
      }
    }
    
    // If Gita keyword found but no pattern
    if (hasGitaKeyword || hasGitaTopic) {
      return {
        queryType: 'GITA',
        responseMode: 'DIRECT',
        confidence: 0.85,
        extracted: {
          gitaChapter,
          gitaShlok,
          gitaKeyword,
          searchQuery: original,
        },
        matchedPattern: 'GITA_KEYWORD',
      };
    }
    
    return null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[?!.,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private extractFestivalName(normalized: string): string | undefined {
    return FESTIVAL_NAMES.find(f => normalized.includes(f));
  }
  
  private extractMathExpression(query: string): string | null {
    const mathMatch = query.match(/[\d\s\+\-\*\/\(\)\.\^%]+/);
    if (mathMatch) {
      const expr = mathMatch[0].trim();
      if (/\d/.test(expr) && /[\+\-\*\/\^%]/.test(expr)) {
        return expr;
      }
    }
    
    const timesMatch = query.match(/(\d+)\s*(times|x|×)\s*(\d+)/i);
    if (timesMatch) {
      return `${timesMatch[1]} * ${timesMatch[3]}`;
    }
    
    return null;
  }
  
  private finalize(partial: Partial<ClassificationResult>, startTime: number): ClassificationResult {
    return {
      queryType: partial.queryType || 'GENERAL',
      responseMode: partial.responseMode || 'LLM_FULL',
      confidence: partial.confidence || 0.5,
      extracted: partial.extracted || {},
      matchedPattern: partial.matchedPattern,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const queryClassifier = new QueryClassifier();

export function classifyQuery(query: string, context?: UserContext): ClassificationResult {
  return queryClassifier.classify(query, context);
}