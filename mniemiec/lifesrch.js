'use strict';				// Force strict Javascript compliance
// Javascript to search list of known patterns for a supplied pattern,
// and then modify DHTML page to provide access to that pattern
var X; var Y; var Z;


// Some subtle Javascript differences for C++ programmers:
// - == and != convert data but === and !== do not (e.g. 5=='5', 5!=='5');
//   Note also that false==0, but false!==0.
// - && and || do not convert parameters to boolean (e.g. 4&&3 => 3, null&&3 => null).
// - All numbers are floats, so division does not truncate (e.g. 5/2 => 2.5 not 2).
// - % works on reals (like fmod), but << >> >>> & | ~ convert to integers first.
// - Simple types (numbers, strings, undefined) passed by value; Objects by reference.
// - Strings are atomic, so you can say c=string[i], but not string[i]=c.
// - 'x' is a length-one string constant, not an integer
// - var has function scope, not block scope
// - Objects have prototypes, not classes; methods are just functions
// - Constructors and methods access instance variables by this.x, not just x.
// - Data is garbage-collected; there is no explicit deletion or destruction



//------------------------------ Constants -------------------------------------

// These should be 'const'.
// 'var' is to support ancient browsers that don't know support 'const'

// Tunable parameters
//var CT		= Math.pow (2, -44);	// Comparison tolerance
var CT			= Math.pow (2, -32);	// Comparison tolerance
var OMEGA		= Math.pow (2, 32);	// Power of Omega for transfinite numbers
					// (above 2 must be 2^n to avoid rounding errors)
var PAIR		= 1 << 26;	// Fraction to show number pair
var KNOWN		= PAIR/2;	// Gliders known
var TBD			= 2 * KNOWN;	// Gliders TBD
var UNKNOWN		= 3 * KNOWN;	// Gliders unknown
var LARGE		= 1000;		// Can't search larger patterns by image
var MAXLIST		= 20;		// Max items in list page (default)
var MAXPAGES		= 20;		// Max pages in dropdown list
var TIPTIME		= 3;		// Seconds before showing tool tip

// (NOTE: these two values must be manually updated after each build!)
var NUMITEMS		= 11177;	// # normal items (for load progress bar)
var NUMXITEMS		= 118291;	// # extended items (for load progress bar)

// Mathematical constants
var _			= Infinity;	// Infinity
var TAU			= 2*Math.PI;	// Once around the circle
var PHI			= (Math.sqrt (5)+1)/2;		// The Golden Ratio
var NCF	= Math.ceil (Math.log (Math.pow (2,53)) / Math.log (PHI));	// Maximum continued fraction length
var FREQBASE		= 50158095316;	// Frequency base for rarity experiment

// Unicode characters
var Usup2		= String.fromCharCode (0x00B2);	// Superscript 2
var Usup3		= String.fromCharCode (0x00B3);	// Superscript 3
var Usup1		= String.fromCharCode (0x00B9);	// Superscript 1
var Ufrac14		= String.fromCharCode (0x00BC);	// 1/4
var Ufrac12		= String.fromCharCode (0x00BD);	// 1/2
var Ufrac34		= String.fromCharCode (0x00BE);	// 3/4
var Utimes		= String.fromCharCode (0x00D7);	// times
var Udivide		= String.fromCharCode (0x00F7);	// divide
var Upi			= String.fromCharCode (0x03C0);	// Greek letter pi
var Utau		= String.fromCharCode (0x03C4);	// Greek letter tau
var Uphi		= String.fromCharCode (0x03C6);	// Greek letter phi
var Uphis		= String.fromCharCode (0x03D5);	// Greek phi symbol
var Usqrt		= String.fromCharCode (0x221A);	// Square root
var Uinf		= String.fromCharCode (0x221E);	// Infinity

// Foreground colors
var C_TEXT_NORMAL	= '#000000';	// Text foreground (black)
var C_TEXT_DISABLE	= '#808080';	// Disabled text (grey)
var C_IMG_WILD		= '#808080';	// Image wild cells (grey)
var C_IMG_ALIVE		= '#0000AA';	// Image living cells (dark blue)
var C_IMG_GRID		= '#AAAAAA';	// Image grid (dark grey)
var C_STAMP_DEAD	= '#00AAAA';	// Stamp dead cells (teal)
var C_STAMP_ALIVE	= '#000000';	// Stamp living cells (black)
var C_FONT_DIGIT	= '#00AAAA';	// Normal gliders
var C_FONT_EQ		= '#00AA00';	// 1 glider/bit (dark green)
var C_FONT_GT		= '#AAAA00';	// >1 glider/bit (dark yellow)
var C_FONT_X		= '#AA0000';	// unknown (dark red)
var C_FONT_NOTE		= '#AAAAAA';	// Annotations (dark grey)

// Babbling brook oscillator types
var B_ANY		= 0;		// Any
var B_BB		= 1;		// Babbling brook
var B_MM		= 2;		// Muttering moat

// Background colors
var C_BG		= '#FFFFFF';	// Screen background color (white)
var C_GLS_EQ		= '#AAFFAA';	// 1 glider/bit (light green)
var C_GLS_GT		= '#FFFFAA';	// >1 glider/bit (light yellow)
var C_GLS_X		= '#FFAAAA';	// Unknown gliders (light red)
var C_GLS_KNOWN		= '#FFC0AA';	// Known gliders (light orange)
var C_GLS_TBD		= '#C0C0C0';	// TBD gliders (light grey)
var C_COL_NORMAL	= '#E0E0FF';	// Normal column (pastel blue)
var C_COL_SORT		= '#E0FFE0';	// Normal sort column (pastel green)
var C_COL_BACK		= '#FFE0E0';	// Reverse sort column (pastel red)
var C_ROW_RULE		= '#FFFFE0';	// Rule row (pastel yellow)
var C_ROW_SEL		= '#E0FFFF';	// Selected row (pastel cyan)
var C_STAMP_SEL		= '#C0FFFF';	// Selected stamp cell (light cyan)

// Velocity direction
var D_ANY		= 0;		// Any
var D_ORTHO		= 1;		// Orthogonal (i.e. y === 0)
var D_DIAG		= 2;		// Diagonal (i.e. x === y)
var D_OBLIQUE		= 3;		// Oblique (i.e. 0 < y < x)

// Font rows
var F_DIGIT		= 0;		// Normal (teal)
var F_EQ		= 1;		// Par (green)
var F_GT		= 2;		// Above par (yellow)
var F_NOTE		= 3;		// Annotation (grey)
var F_SEL		= 4;		// Above 4 rows, w/selection background

// Period-2 oscillator types
var H_ANY		= 0;		// Any
var H_FF		= 1;		// Flip-flop
var H_OO		= 2;		// On-off

// Number-matching types
var M_ANY		= 0;		// Any
var M_INF		= 1;		// n === Infinity
var M_NAN		= 2;		// n === NaN
var M_UNKNOWN		= 3;		// n >= 'x'
var M_PARTIAL		= 4;		// n > 'x'
var M_TBD		= 5;		// n === TBD
var M_KNOWN		= 6;		// n === KNOWN
var M_EQ		= 7;		// n === y
var M_NE		= 8;		// n !== y
var M_LT		= 9;		// n < y
var M_LE		= 10;		// n <= y
var M_GT		= 11;		// n > y
var M_GE		= 12;		// n >= y
var M_IN		= 13;		// x <= n <= y (in range)
var M_OUT		= 14;		// n < x || y < n (out of range)

// Name types
var N_PATTERN		= 0;		// Pattern name
var N_FILE		= 1;		// File name

// Object categories (see also: catlist, catnames, catabbrs)
var O_STILL		= 0;		// Still life
var O_PSTILL		= 1;		// Pseudo-still-life
var O_OSC		= 2;		// Oscillator
var O_POSC		= 3;		// Pseudo-oscillator
var O_SS		= 4;		// Spaceship, pseudo-spaceship, flotilla
var O_WS		= 5;		// Wick stretcher
var O_PUFF		= 6;		// Puffer
var O_GUN		= 7;		// Gun
var O_BR		= 8;		// Breeder
var O_CONS		= 9;		// Constellation
var O_METH		= 10;		// Methuselah
var O_BAD		= 11;		// Not quite object
var O_ANY		= 12;		// Any
var O_NAMES		= 13;		// Patterns with multiple names
var O_FILES		= 14;		// Patterns with multiple files
var O_COLOR		= 15;		// Patterns with multi-color syntheses
var O_DIFF		= 16;		// Difficult still-life

// Phoenix oscillator types
var P_ANY		= 0;		// Any
var P_PHX		= 1;		// Phoenix

// Real number formats
var Q_REAL		= 0;		// Real
var Q_RAT		= 1;		// Rational

// Supported rules
var R_LIFE		= 0;		// Life
var R_B2S2		= 1;		// B2/S2
var R_B34S34		= 2;		// B34/S34
var R_NIEMIEC0		= 3;		// Niemiec's rule 0
var R_NIEMIEC1		= 4;		// Niemiec's rule 1
var R_OTHER		= 5;		// Unsupported rule from RLE
var R_ANY		= 6;		// Any rules
var R_MAX		= 7;		// (All values are below this)

// Sort options (n=ascending, ~n=descending; see also: sortnames)
var S_MINP		= 0;		// By minimum population
var S_AVGP		= 1;		// By average population
var S_MAXP		= 2;		// By maximum population
var S_RPOP		= 3;		// By population ratio
var S_INF		= 4;		// By influence
var S_DEN		= 5;		// By minimum density
var S_ADEN		= 6;		// By average density
var S_MDEN		= 7;		// By maximum density
var S_HEAT		= 8;		// By heat
var S_TEMP		= 9;		// By temperature
var S_VOL		= 10;		// By volatility
var S_SVOL		= 11;		// By strict volatility
var S_RVOL		= 12;		// By strict volatility/volatility
var S_SYMM		= 13;		// By symmetry
var S_GLIDE		= 14;		// By symmetry
var S_BOX		= 15;		// By smallest bounding box
var S_SQB		= 16;		// By smallest bounding box squareness
var S_HULL		= 17;		// By largest bounding box
var S_SQH		= 18;		// By largest bounding box squareness
var S_PER		= 19;		// By period
var S_MOD		= 20;		// By modulus
var S_RMOD		= 21;		// By period/modulus
var S_VEL		= 22;		// By velocity
var S_GLS		= 23;		// By number of gliders
var S_RGLS		= 24;		// By gliders/bit
var S_FREQ		= 25;		// By frequency
var S_RAR		= 26;		// By rarity
var S_TTS		= 27;		// By time to stabilize
var S_EF		= 28;		// By evolutionary factor
var S_CAT		= 29;		// By category
var S_FILE		= 30;		// By file name
var S_NAME		= 31;		// By pattern name
var S_IMG		= 32;		// By image
var S_MAX		= 33;		// (All sort columns are below this)

// Search type
var T_IMAGE		= 0;		// Search by image
var T_SIMPLE		= 1;		// Simple search
var T_ADV		= 2;		// Advanced search
var T_DET		= 3;		// Detailed search
var T_ULT		= 4;		// Ultimate search
var T_BAD		= 5;		// Invalid search (synthesized)

// Output view formats
var V_LIST		= 0;		// View as list
var V_STAMP		= 1;		// View as stamp page

// String-matching types (NOTE: Specified numbers must not be changed)
var W_IS		= 0;		// 0: Is (e.g. 'x')
var W_BEGINS		= 1;		// 1: Begins with (e.g. 'x*')
var W_ENDS		= 2;		// 2: Ends with (e.g. '*x')
var W_CONTAINS		= 3;		// 3: Contains (e.g. '*x*')
var W_ANY		= 4;		// 4: Any (e.g. '*')
var W_NOT		= 8;		//    Invert sense of search (e.g. '~x')

// File export format
var X_IMAGE		= -1;		// Image on screen
var X_RLE		= 0;		// RLE: #comments. header. run-length encoded pattern
var X_CELLS		= 1;		// Cells: !comments, text as . and o
var X_LIFE105		= 2;		// Life 1.05: #comments, text as . and *
var X_LIFE106		= 3;		// Life 1.06: #comments, coordinate pairs

// Symmetry and Glide symmetry (see also: symmchars, symmnames, symmbits)
var Y_N			= 0;		// None: '.'
var Y_O			= 1; 		// Orthogonal: '-' (actually, '|')
var Y_D			= 2;		// Diagonal: '/' (actually, '\\')
var Y_R			= 3;		// 180-degree rotation: '~'
var Y_OO		= 4;		// Double orthogonal: '+'
var Y_DD		= 5;		// Double diagonal: 'x'
var Y_RR		= 6;		// 90-degree rotation: '@'
var Y_OD		= 7;		// 8-way: '*'
var Y_V			= 8;		// Vertical: '-' (internal+temporary)
var Y_A			= 9;		// Antidiagonal: '/' (internal+temporary)
var Y_ANYO		= 10;		// Includes - (- + *) (rest are UI only)
var Y_ANYD		= 11;		// Includes / (/ x *)
var Y_ANYR		= 12;		// Includes ~ (~ + x @ *)
var Y_ANYOO		= 13;		// Includes + (+ *)
var Y_ANYDD		= 14;		// Includes x (x *)
var Y_ANYRR		= 15;		// Includes @ (@ *)
var Y_M			= 16;		// Single reflection (- /)
var Y_ANYM		= 17;		// Any reflection (- / + x *)
var Y_ANYS		= 18;		// Any symmetry (- / ~ ~ + x @ *)
var Y_ANY		= 19;		// Any (. - / ~ + x @ *)

// Search state
var Z_RESET		= 0;		// Nothing shown (starting state)
var Z_SEARCH		= 1;		// Searching...
var Z_HUGE		= 2;		// Pattern too huge to search for
var Z_NONE		= 3;		// No results
var Z_MANY		= 4;		// Multiple results shown in list
var Z_RESULT		= 5;		// Single result is selected

// Constant arrays
var periods = [1,2,3,4,5,6,8,10,12,14,15,24,30,36,60];	// Periods w/own pages
var fontwidth = [8,4,8,8,8,8,8,8,8,8,8,8,8,4,8,8,8,8,8,8,8,8,8,8,4];	// Character widths
var ownsec = ['p1', 'pp1', 'p2', 'pp2', 'p3'];	// These sections have own pages
var ownlo = [12, 14, 17, 16, 20];		// From this size ...
var ownhi = [16, 16, 18, 17, 21];		// ... to this size
var suffc = Ufrac14 + Ufrac12 + Ufrac34 + Usup1 + Usup2 + Usup3 + '!' +
  'e' + Upi + Utau + Uphi + Uphis;		// Suffix characters
var suffn = [1/4, 1/2, 3/4, 1, 2, 3, 0, Math.E, Math.PI, TAU, PHI, PHI];	// Suffix values
var keywords = [/pi/g, /phi/g, /tau/g, /inf/g, /infinity/g, /unknown/g, /nan/g,
  /sqrt/g, /root/g, / /g];			// Numeric keywords
var keychars = [Upi, Uphi, Utau, '_', '_', '?', '?', Usqrt, Usqrt, ''];	// 1-character equivalents
var ordnames = ['/t'+Usup3, '/t'+Usup2, '/t', '', 't', 't'+Usup2, 't'+Usup3, 'c'];	// Orders of magnitude names
var catlist = 'p1 pp1 osc posc ss ws puff gun br cons meth bad'.split (' ');
var catabbrs = 'still p.still osc p.osc sship wick-s. puffer gun breeder cons meth notquite'.split (' ');
var catnames = ['still-life', 'pseudo-still-life', 'oscillator',
  'pseudo-oscillator', 'spaceship', 'wick-stretcher', 'puffer', 'gun', 'breeder',
  'constellation', 'methuselah', 'not quite stable', '',
  'patterns with multiple names', 'patterns with multiple synthesis files',
  'patterns with multi-color syntheses',
  'patterns with multiple glider costs', 'still-life (difficult only)'];
var dirnames = ['', 'orthogonal ', 'diagonal ', 'oblique '];
var resnames = ['', '#C modulus = period\n', '#C modulus = period/2\n',
  '', '#C modulus = period/4\n', '', '#C modulus < period\n', ''];
var sortnames = ['population', 'average population', 'maximum population',
  'min/max population', 'influence', 'min population/influence',
  'heat', 'temperature', 'volatility', 'strict volatility',
  'strict volatility/volatility', 'symmetry', 'glide symmetry', 'smallest box',
  'smallest box squareness', 'largest box', 'largest box squareness', 'period',
  'modulus', 'period/modulus', 'velocity', 'gliders', 'gliders/bit', 'frequency',
  'rarity', 'time to stabilize', 'evolutionary factor', 'category',
  'file name', 'pattern name', 'image'];
var symmchars = ['.','-','/','~','+','x','@','*','-','/'];	// Symmetry names
var symmnames = ['. (none)','- (orthogonal)', '/ (diagonal)',
  '~ (180-degree rotation)', '+ (double orthogonal)', 'x (double diagonal)',
  '@ (90-degree rotation)', '* (eight-way)', '- (orthogonal)', '/ (diagonal)',
  'includes - (- + *)', 'includes / (/ x *)', 'includes ~ (~ + x @ *)',
  'includes + (+ *)', 'includes x (x *)', 'includes @ (@ *)',
  'single reflection (- /)', 'any reflection (- / + x *)',
  'any symmetry (- / ~ ~ + x @ *)', 'any'];
var symmbits = [1<<Y_N, 1<<Y_O, 1<<Y_D, 1<<Y_R, 1<<Y_OO, 1<<Y_DD, 1<<Y_RR,
    1<<Y_OD, 1<<Y_O, 1<<Y_D, (1<<Y_O)|(1<<Y_OO)|(1<<Y_OD),
    (1<<Y_D)|(1<<Y_DD)|(1<<Y_OD), (1<<Y_R)|(1<<Y_OO)|(1<<Y_DD)|(1<<Y_RR)|(1<<Y_OD),
    (1<<Y_OO)|(1<<Y_OD), (1<<Y_DD)|(1<<Y_OD), (1<<Y_RR)|(1<<Y_OD), (1<<Y_O)|(1<<Y_D),
    (1<<Y_O)|(1<<Y_D)|(1<<Y_OO)|(1<<Y_DD)|(1<<Y_OD),
    (1<<Y_O)|(1<<Y_D)|(1<<Y_R)|(1<<Y_OO)|(1<<Y_DD)|(1<<Y_RR)|(1<<Y_OD),
    (1<<Y_N)|(1<<Y_O)|(1<<Y_D)|(1<<Y_R)|(1<<Y_OO)|(1<<Y_DD)|(1<<Y_RR)|(1<<Y_OD)];
var wildnames = ['is', 'begins with', 'ends with', 'contains', '', '', '', '',
  'isn\'t', 'doesn\'t begin with', 'doesn\'t end with', 'doesn\'t contain'];

// List of objects with colored versions
var colobj = ('3bl 4bk 4tb 5bt 5gl 6ac 6bc 6bg 6blbl04 6ck 6hv 6sh 6sn ' +
  '6td 7et 7lb 7lf 7ls 8bkbk 8bkbk14 8bp 8cg 8cs 8ht 8lg 8lp 8pd 8sl 8tt 8vs ' +
  '9-2 9-3 9-4 9-5 9-6 9-7 9-8 9-9 9-10 9btbk 9lw 9tp ' +
  '10btbt1 10btbt2 10btbt3 10hvbk 10lfbl 10qp 11mw ' +
  '12ff1 12fg 12fx 12md 12mz 12pc 12px 12tl 13hw 13jm 14-79 14-507 14eet ' +
  '15br 16blocks 16lm 16oc 16tu 16ux 18-287 18-6707 18cutbk1 18ic 18mg ' +
  '18sc 20bqbbk1 20et2z 20lfr 24fb 24hf 28a4all 28by 44turt').split (' ');

// Polynomial coefficients for 1/Gamma(x), 0<x<1. From Abramowitz & Stegun 6.1.34
var gpoly = [0.0,       1.0,                 0.5772156649015329,
  -0.6558780715202538, -0.0420026350340952,  0.1665386113822915,
  -0.0421977345555443, -0.0096219715278770,  0.0072189432466630,
  -0.0011651675918591, -0.0002152416741149,  0.0001280502823882,
  -0.0000201348547807, -0.0000012504934821,  0.0000011330272320,
  -0.0000002056338417,  0.0000000061160950,  0.0000000050020075,
  -0.0000000011812746,  0.0000000001043427,  0.0000000000077823,
  -0.0000000000036968,  0.0000000000005100, -0.0000000000000206,
  -0.0000000000000054,  0.0000000000000014,  0.0000000000000001];



//------------------------------ Class definitions -----------------------------

// Constructor for binary field structure
function Field (wid, hgt) {
    this.f_wid = wid;		// Width of allocated array
    this.f_hgt = hgt;		// Height of allocated array
    this.f_lft = 0;		// Left limit of living cells
    this.f_top = 0;		// Top limit of living cells
    this.f_rgt = wid;		// Right limit of living cells + 1
    this.f_btm = hgt;		// Bottom limit of living cells + 1
    this.f_minp = 0;		// Count of living cells (assuming wild cards are dead)
    this.f_maxp = 0;		// Count of living cells (assuming wild cards are alive)
    this.f_wild = 0;		// 0=dead, 1=some alive, -1=some wild

    var n = wid * hgt;
    var a = this.f_img = new Array (n);	// Image: Array of boolean [y*f_wid+x]
    while (--n >= 0) {
	a[n] = 0;
    }
}

// Field method: Get a cell from the field, assuming cells outside borders are zero
Field.prototype.f_GetCell = function (x, y) {
    return x < 0 || x >= this.f_wid || y < 0 || y >= this.f_hgt ? 0 :
	this.f_img[y*this.f_wid+x];
}

// Field method: Is this a still-life in Life? (0=no, 1=yes, -1=unsure)
Field.prototype.f_IsStill = function () {
    for (var y = 0; y < this.f_hgt; ++y) {
	for (var x = 0; x < this.f_wid; ++x) {
	    if (this.f_GetCell (x, y) < 0) {
		return -1;
	    }
	}
    }
    for (y = -1; y <= this.f_hgt; ++y) {
	for (x = -1; x <= this.f_wid; ++x) {
	    var c = this.f_GetCell (x, y);
	    var n = this.f_GetCell (x-1, y-1) + this.f_GetCell (x, y-1) + this.f_GetCell (x+1, y-1) +
		    this.f_GetCell (x-1, y)                             + this.f_GetCell (x+1, y) +
		    this.f_GetCell (x-1, y+1) + this.f_GetCell (x, y+1) + this.f_GetCell (x+1, y+1);
	    if (((n | c) === 3) != c) {
		return 0;
	    }
	}
    }
    return 1;
}

// Field method: Get Influence (mainly for stamp image, as if anyone really cares!)
Field.prototype.f_GetInf = function () {
    var r = 0;
    for (var y = 0; y < this.f_hgt; ++y) {
	for (var x = 0; x < this.f_wid; ++x) {
	    r += (this.f_GetCell (x-1, y-1) | this.f_GetCell (x, y-1) | this.f_GetCell (x+1, y-1) |
		  this.f_GetCell (x-1, y)   | this.f_GetCell (x, y)   | this.f_GetCell (x+1, y)   |
		  this.f_GetCell (x-1, y+1) | this.f_GetCell (x, y-1) | this.f_GetCell (x+1, y+1)) != 0;
	}
    }
    return r;
}

// Constructor for header structure
function Header (sec, sub, cat, cid, bad, exp, gls, pseudo, per, minp, obj) {
    this.h_sec = sec;		// Section: machine-specific string
    this.h_sub = sub;		// Subsection: machine-specific string
    this.h_cat = cat;		// Category: human-readable string
    this.h_cid = cid;		// Category id: integer index; sec=catlist[cid]
    this.h_bad = bad;		// Not quite objects?
    this.h_exp = exp;		// Boolean: Is this an expanded object source list?
    this.h_gls = gls;		// Gliders for unspecified items (KNOWN or TBD)
    this.h_pseudo = pseudo;	// Boolean: Are these pseudo-stills/oscillators?
    this.h_per = per;		// Period: integer for stills/oscillators; else NaN
    this.h_minp = minp;		// Population: integer for stills/oscillators; else NaN
    this.h_obj = obj;		// Object list: Array of Pattern
}

// Constructor for pattern structure
// Image starts out as one string, but may grow into an array of strings
// Several fields may contain temporary negative values, indicating that they
// accumulate data from subsequent sub-images
// (In addition, some instances may also define p_comm,
//  and header/stats may define other fields: p_rpop, p_den, p_aden, p_mden,
//  p_rvol, p_glide, p_sqb, p_sqh, p_mod, p_rmod, p_rgls, p_rar, p_ef, p_cat)
function Pattern (img, file, name, minp, maxp, avgp, inf, heat, temp, vol, svol, symm,
  boxw, boxh, hullw, hullh, per, gls, freq, tts, veld, velx, vely, page, hdr) {
    this.p_img = img;		// Image: string or array of strings
    this.p_file = file;		// File name: string or array of strings
    this.p_name = name;		// Pattern name: string or array of strings
    this.p_minp = minp;		// Minimum population: integer
    this.p_maxp = maxp;		// Maximum population: integer (+order*OMEGA)
    this.p_avgp = avgp;		// Average population: integer (+order*OMEGA) (or <0 to count)
    this.p_inf = inf;		// Influence: integer (+order*OMEGA)
    this.p_heat = heat;		// Heat: integer (+order*OMEGA)
    this.p_temp = temp;		// Temperature: integer (or <0 to count)
    this.p_vol = vol;		// Volatility: real 0..1 or NaN
    this.p_svol = svol;		// Strict volatility: real 0..1 or NaN
    this.p_symm = symm;		// Symmetry: enum + 10*enum + 100*flags + 1000*(period/modulus) + 10000*osc_flags
    this.p_boxw = boxw;		// Minmal bounding box width: integer
    this.p_boxh = boxh;		// Minimal bounding box height: integer <= boxw
    this.p_hullw = hullw;	// Maximal bounding box width: integer (+order*OMEGA)
    this.p_hullh = hullh;	// Maximal bounding box height: integer or (+order*OMEGA) <= hullw
    this.p_per = per;		// Period: integer or _
    this.p_gls = gls;		// Gliders: integer (+integer/PAIR) (+integer*PAIR/2)
    this.p_freq = freq;		// Frequency: real or NaN
    this.p_tts = tts;		// Time to stabilize: integer or _
    this.p_veld = veld;		// Velocity denominator: integer > 0
    this.p_velx = velx;		// Velocity major: integer
    this.p_vely = vely;		// Velocity minor: integer <= velx
    this.p_page = page;		// Page number: integer+integer/PAIR
    this.p_hdr = hdr;		// Header index: integer
}

// Pattern method: Get first file name
Pattern.prototype.p_GetFile = function () {
    return typeof this.p_file === 'string' ? this.p_file : this.p_file[0];
}

// Pattern method: Get all file names
Pattern.prototype.p_GetFiles = function () {
    return typeof this.p_file === 'string' ? this.p_file :
      this.p_file.join ('; ');
}

// Pattern method: Get all pattern names
Pattern.prototype.p_GetNames = function () {
    return typeof this.p_name === 'string' ? this.p_name :
      this.p_name.join ('; ');
}

// Pattern method: Get symmetry class
Pattern.prototype.p_GetSymm = function () {
    return this.p_symm % 10;
}

// Pattern method: Get glide symmetry class
Pattern.prototype.p_GetGlide = function () {
    return Math.floor (this.p_symm % 100 / 10);
}

// Pattern method: Get period/modulus
Pattern.prototype.p_GetRmod = function () {
    return Math.floor (this.p_symm % 10000 / 1000);
}

// Pattern method: Get oscillator flags
Pattern.prototype.p_GetFlags = function () {
    return Math.floor (this.p_symm / 10000);
}

// Pattern method: Get number of gliders needed
Pattern.prototype.p_GetGls = function () {
    return Math.floor (this.p_gls);
}

// Pattern method: Get evolutionary factor
Pattern.prototype.p_GetEf = function () {
    return this.p_minp ? this.p_tts / this.p_minp : 0;
}

// Generate all orientations of a patternn
function Xforms (f, w, h, dx, dy, l, t, r, b, wild) {
    var xform = new Array (h === w ? 8 : 4);

    xform[0] = Bin2Lib (f, t*dy+l*dx, dx, dy, w, h, wild);
    xform[1] = Bin2Lib (f, t*dy+(r-1)*dx, -dx, dy, w, h, wild);
    xform[2] = Bin2Lib (f, (b-1)*dy+l*dx, dx, -dy, w, h, wild);
    xform[3] = Bin2Lib (f, (b-1)*dy+(r-1)*dx, -dx, -dy, w, h, wild);

    if (h === w) {
	xform[4] = Bin2Lib (f, t*dy+l*dx, dy, dx, h, w, wild);
	xform[5] = Bin2Lib (f, t*dy+(r-1)*dx, dy, -dx, h, w, wild);
	xform[6] = Bin2Lib (f, (b-1)*dy+l*dx, -dy, dx, h, w, wild);
	xform[7] = Bin2Lib (f, (b-1)*dy+(r-1)*dx, -dy, -dx, h, w, wild);
    }

    return xform;
}

// Generate all orientations of a pattern, and calculate its symmetry
function Symm (f, l, t, r, b, wild) {
    var x;			// List of transformations

    this.y_wid = r - l;		// Pattern width
    this.y_hgt = b - t;		// Pattern height

    if (this.y_wid < this.y_hgt) {	// Tall and narrow: flip on its side
	this.y_wid = b - t;
	this.y_hgt = r - l;
	x = Xforms (f, this.y_wid, this.y_hgt, f.f_wid, 1, t, l, b, r, wild);
    } else {
	x = Xforms (f, this.y_wid, this.y_hgt, 1, f.f_wid, l, t, r, b, wild);
    }

    this.y_symm = Y_N;		// Symmetry class

    if (x[0] === x[1]) {
	if (x[0] !== x[2]) {		// Orthogonal |
	    this.y_symm = Y_O;
	    x = this.y_wid !== this.y_hgt ? [x[0], x[2]] : [x[0], x[2], x[4], x[6]];
	} else if (x[0] !== x[4]) {	// Orthogonal | -
	    this.y_symm = Y_OO;
	    x = this.y_wid !== this.y_hgt ? x[0] : [x[0], x[4]];
	} else {				// 8-way
	    this.y_symm = Y_OD;
	    x = x[0];
	}
    } else if (x[0] === x[2]) {		// Vertical reflection -
	this.y_symm = Y_V;
	x = this.y_wid !== this.y_hgt ? [x[0], x[1]] : [x[0], x[1], x[4], x[5]];
    } else if (x[0] === x[3]) {
	if (x[0] === x[4]) {		// Double diagonal \ /
	    this.y_symm = Y_DD;
	    x = [x[0], x[1]];
	} else if (x[0] === x[5]) {	// 90-degree rotation
	    this.y_symm = Y_RR;
	    x = [x[0], x[1]];
	} else {			// 180-degree rotation
	    this.y_symm = Y_R;
	    x = this.y_wid !== this.y_hgt ? [x[0], x[1]] : [x[0], x[1], x[4], x[5]];
	}
    } else if (x[0] === x[4]) {		// Single diagonal \
	this.y_symm = Y_D;
	x = [x[0], x[1], x[2], x[3]];
    } else if (x[0] === x[7]) {		// Single diagonal /
	this.y_symm = Y_A;
	x = [x[0], x[1], x[2], x[3]];
    }					// No symmetry

    this.y_symm += 200*(this.y_wid&1) + 400*(this.y_hgt&1) + 800*(this.y_wid<=0) + 100;
    this.y_img = x;			// List of unique images, or single image
}



//------------------------------ Global variables ------------------------------

// Rule-dependent lists (rulesec, rulerle, rulenames: [R_OTHER] can be changed)
var rulepage = ['lifepage', 'rule22', 'rule34', 'rulemn', 'rulemn', '' ,''];
var rulesec = ['', '22', '34', 'mn', 'mn', '' ,''];
var rulerle = ['B3/S23', 'B2/S2', 'B34/S34', 'Niemiec0', 'Niemiec1', '', ''];
var rulenames = ['Life (B3/S23)', '2/2 Life (B2/S2)', '3/4 Life (B34/S34)',
  'Niemiec\'s rule 0', 'Niemiec\'s rule 1', '', 'Unknown'];
var rulelib = [[], [], [], [], [], [], []];	// Lists of all objects in each rule
var results = new Array (R_MAX);	// Lists of found objects in each rule
var nresults = new Array (R_MAX);	// Lengths of above results
var expanded = new Array (R_MAX);	// Which rules are expanded in search
var rulefirst = new Array (R_MAX);	// Index of first list row in each rule
					// (in bucket list, # of pages in each rule)

// User interface state variables
var sortcols = [];		// Indices into insorts/insortu select for different sort types
var srch;			// Search criteria
var view;			// Result display format
var maxlist;			// Maximum results per list page
var numfmt = Q_REAL;		// Number display format
var defsort;			// Default sort criterion
var sortdir;			// Sort direction (1=normal, -1=reverse)
var nosort = false;		// Suppress recursive auto-sorting?

// Search results state varibles
var nfound;			// Number of matches found
var nrules;			// Number of matching rules

// Result display state variables
var viscol = [];		// visible columns
var nviscol;			// Total number of visible columns
var rviscol = 0;		// Number of reusable visible columns
var glidercol;			// Glider column index
var selecti;			// Currently-selected table index (or -1)
var selectb;			// Library format of current pattern (or null)
var selectr;			// Rule associated with current pattern
var state;			// Search state
var sortrule;			// Rule associated with current sort

// Sort list header
var listhdr = new Pattern ('Image', 'Filename', 'Pattern name(s)', 'Pop.',
  'Max.Pop.', 'Avg.Pop', 'Inf.', 'Heat', 'Temp.', 'Vol.', 'Str.Vol.',
  'Symm.', 'Sm. Box', '', 'Lg. Box', '', 'Period', 'Gliders', 'Freq.',
  'T.T.S.', 'Velocity', '', '', 0, 0);
listhdr.p_rpop = 'Min/Max';
listhdr.p_den = 'Min.Den.';
listhdr.p_aden = 'Avg.Den.';
listhdr.p_mden = 'Max.Den.';
listhdr.p_rvol = 'Rel.Vol.';
listhdr.p_glide = 'Glide';
listhdr.p_sqb = listhdr.p_sqh = 'Square';
listhdr.p_mod = 'Modulus';
listhdr.p_rmod = 'Per./Mod';
listhdr.p_rgls = 'Gl./Bit';
listhdr.p_rar = 'Rarity';
listhdr.p_ef = 'E.F.';
listhdr.p_cat = 'Cat.';

// Stamp page display state variables
var stampw;			// Stamp image width
var stamph;			// Stamp image height
var stampx;			// Number of stamp image columns
var stampy;			// Number of stamp image rows
var stampn;			// Number of stamp images on current page
var stampm;			// Magnification factor
var stampr;			// Stamp page width (i.e. right edge)
var stampb;			// Stamp page height (i.e. bottom edge)
var stamprule;			// Rule output on stamp RLE image
var stampf;			// Stamp page as binary field
var stampq;			// Stamp page as bucket
var pageno;			// Stamp page number
var pagesize;			// Full stamp page size
var npages;			// Number of stamp pages

// Tool tip state globals
var tipname = '';		// Active tool-tip
var tiptimer = null;		// Timer for activating tool tip
var tipshown = false;		// Is tool tip visible?
var tok = [];			// List of explicitly enabled/disabled elements



//------------------------------ Diagnostic functions -------------------------

// Aggregate anomalous objects for debugging purposes
var Uw;				// List of all transfinite properties
var U;				// Sets of all properties
var W;				// Lengths of all sets in U
var toofew = '';		// Patterns with too few images
var toomany = '';		// Patterns with too many images
var badavg = '';		// Patterns with average pop < minimum
var badvol = '';		// Patterns with volatility > 1
var badpop = '';		// Patterns with phases < minimum pop.
var badtemp = '';		// Patterns where heat !== temp*pop

// Dump out an object's contents
function D (obj) {
    var result = '';
    for (var i in obj) {
	result += i + '=' + obj[i] + '\n';
    }
    return result;
}

// Eval button pressed: evaluate user-entered expression
function Eval () {
    ReTime ();				// Reset tool-tip timer
    Enter (EvalValue ('inexpr'));
}

// Add an instance to s set of properties.
function Notice (a, n, p, s) {
    var c = a.length;
    if ((isNaN (n) ? InNaN (a) : In (a, n)) < 0) {
	a[c++] = n;
    }
    if (s && (isNaN (n) || n < 0 || n >= OMEGA)) {
	Uw[Uw.length] = p.p_file + '/' + p.p_name + '.' + s + ' = ' + n;
    }
    return c;
}

// Track unique values of all properties
function TrackU (p) {
    // p_img, p.p_file, p.p_name should be mostly unique, so no use tracking them
    // p_page, p.p_hdr are never searchable, so no use tracking them either
    W.p_minp = Notice (U.p_minp, p.p_minp, p, listhdr.p_minp);
    W.p_maxp = Notice (U.p_maxp, p.p_maxp, p, listhdr.p_maxp);
    W.p_avgp = Notice (U.p_avgp, p.p_avgp, p, listhdr.p_avgp);
    W.p_inf = Notice (U.p_inf, p.p_inf, p, listhdr.p_inf);
    W.p_heat = Notice (U.p_heat, p.p_heat, p, listhdr.p_heat);
    W.p_temp = Notice (U.p_temp, p.p_temp, p, listhdr.p_temp);
    W.p_vol = Notice (U.p_vol, p.p_vol, p, listhdr.p_vol);
    W.p_svol = Notice (U.p_svol, p.p_svol, p, listhdr.p_svol);
    W.p_symm = Notice (U.p_symm, p.p_symm, p, listhdr.p_symm);
    W.p_boxw = Notice (U.p_boxw, p.p_boxw, p, listhdr.p_boxw);
    W.p_boxh = Notice (U.p_boxh, p.p_boxh, p, listhdr.p_boxh);
    W.p_hullw = Notice (U.p_hullw, p.p_hullw, p, listhdr.p_hullw);
    W.p_hullh = Notice (U.p_hullh, p.p_hullh, p, listhdr.p_hullh);
    W.p_per = Notice (U.p_per, p.p_per, p, listhdr.p_per);
    W.p_gls = Notice (U.p_gls, p.p_gls);
    W.p_freq = Notice (U.p_freq, p.p_freq);
    W.p_tts = Notice (U.p_tts, p.p_tts, p, listhdr.p_tts);
    W.p_veld = Notice (U.p_veld, p.p_veld, p, listhdr.p_veld);
    W.p_velx = Notice (U.p_velx, p.p_velx, p, listhdr.p_velx);
    W.p_vely = Notice (U.p_vely, p.p_vely, p, listhdr.p_vely);

    W.p_vel = Notice (U.p_vel, p.p_velx*10000 + p.p_vely + p.p_veld/PAIR);
    W.p_rpop = Notice (U.p_rpop, OrderDiv (p.p_minp, p.p_maxp));
    var rmod = p.p_GetRmod ();
    W.p_rmod = Notice (U.p_per, rmod, p, listhdr.p_rmod);
    W.p_mod = Notice (U.p_rmod, p.p_per/rmod);
    W.p_box = Notice (U.p_box, p.p_boxw + p.p_boxh/PAIR);
    W.p_sqb = Notice (U.p_sqb, Div (p.p_boxh, p.p_boxw));
    var u = Math.floor (p.p_hullw/OMEGA);
    var v = Math.floor (p.p_hullh/OMEGA);
    var w = p.p_hullw - OMEGA*u;
    u = u > 1 ? v > 1 ? -(p.p_hullh !== p.p_hullw)*PAIR-w/PAIR : -(v ? 1 : p.p_hullh)-w/PAIR :
	(u ? 1 : p.p_hullw) + (v ? 1 : p.p_hullh)/PAIR;
    W.p_hull = Notice (U.p_hull, u);
    W.p_sqh = Notice (U.p_sqh, OrderDiv (p.p_hullh, p.p_hullw));
    W.p_rvol = Notice (U.p_rvol, Div (p.p_svol, p.p_vol));
    W.p_ef = Notice (U.p_ef, p.p_GetEf (), p, listhdr.p_ef);
    W.p_diff = Notice (U.p_diff, p.p_diff, p, listhdr.p_diff);
}

// Initialize counters of unique values of all properties
function InitU () {
    Uw = [];
    U = new Pattern ([], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], []);
    U.p_vel = [];
    U.p_rpop = [];
    U.p_rmod = [];
    U.p_mod = [];
    U.p_box = [];
    U.p_sqb = [];
    U.p_hull = [];
    U.p_sqh = [];
    U.p_rvol = [];
    U.p_ef = [];
    U.p_diff = [];

    W = new Pattern (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    W.p_vel = 0;
    W.p_rpop = 0;
    W.p_rmod = 0;
    W.p_mod = 0;
    W.p_box = 0;
    W.p_sqb = 0;
    W.p_hull = 0;
    W.p_sqh = 0;
    W.p_rvol = 0;
    W.p_ef = 0;
    W.p_diff = 0;
}



//------------------------------ DOM-accessing primitives ----------------------

// Convert a named HTML object (id="id") into the actual object
function Id (id) {
    return typeof id === 'string' ? document.getElementById (id) : id;
}

// Reset an input form
function Reset (id) {
    Id (id).reset ();
}

// Select all text a specific text element
function Select (id) {
    Id (id).select ();
}

// Set focus to a specific form element
function Focus (id) {
    Id (id).focus ();
}

// Change an HTML element's text
function SetText (id, str) {
    Id (id).childNodes[0].nodeValue = str;
}

// Change an <a> tag's referring URL
function SetHref (id, url) {
    Id (id).href = url;
}

// Get an HTML element's value
function GetValue (id) {
    return Id (id).value;
}

// Evaluate an HTML element's value
function EvalValue (id) {
    return eval (GetValue (id));
}

// Change an HTML form element's value
function SetValue (id, value) {
    Id (id).value = value;
}

// Change a progress bar's maximum limit
function SetMax (id, max) {
    Id (id).max = max;
}

// Get a checkbox's check status
function GetChecked (id) {
    return Id (id).checked;
}

// Get a selection control's selected index
function GetSel (id) {
    return Id (id).selectedIndex;
}

// Change a selection control's selected index
function SetSel (id, i) {
    Id (id).selectedIndex = i;
}

// Set a table cell's number of spanning columns
function SetColSpan (id, span) {
    Id (id).colSpan = '' + span;
}

// Get canvas drawing context (or undefined if canvas is not supported)
function GetContext (id, type) {
    return (id = Id (id)).getContext && id.getContext (type);
}

// Set an HTML element's width
function SetWidth (id, width) {
    Id (id).setAttribute ('width', width + 'px');
}

// Set an HTML element's height
function SetHeight (id, height) {
    Id (id).setAttribute ('height', height + 'px');
}

// Set an HTML element's class
function SetClass (id, c) {
    Id (id).setAttribute ('class', c);
}

// Set an HTML element's color to grey or black, to indicate disabled/enabled state
function GreyText (id, enable) {
    Id (id).style.color = enable ? C_TEXT_NORMAL : C_TEXT_DISABLE;
}

// Set an HTML element's background color
function SetBg (id, bg) {
    Id (id).style.backgroundColor = bg;
}

// Set an HTML element's left position
function SetLeft (id, x) {
    Id (id).style.left = x + 'px';
}

// Set an HTML element's top position
function SetTop (id, y) {
    Id (id).style.top = y + 'px';
}

// Set an HTML element's border width
function SetBorderWidth (id, width) {
    Id (id).style.borderWidth = width;
}

// Set an HTML element's font weight
function SetFontWeight (id, weight) {
    Id (id).style.fontWeight = weight;
}

// Show or hide an HTML block element
// (For some reason, this is ignored on <p> if any internal items are explicitly
//  shown. However, <p><div id="name">...</div></p> works correctly. Sigh.)
function ShowB (id, show) {
    Id (id).style.display = show ? 'block' : 'none';
}

// Show or hide an HTML inline element
function ShowI (id, show) {
    Id (id).style.display = show ? 'inline' : 'none';
}

// Show or hide an HTML table row (i.e. <tr>) element
function ShowR (id, show) {
    Id (id).style.display = show ? 'table-row': 'none';
}

// Show or hide an HTML table cell (i.e. <td>)  element
// (Making table cells disappear produces jumpy behavior and layout glitches,
//  so now just hide their contents and grey them instead.)
function ShowC (id, col, show) {
//  Id (id).style.display = show ? 'table-cell': 'none';
    ShowI (id, show);
    SetBg (col, show ? C_BG : C_GLS_TBD);
}

// Get table cells
function GetCells (tr) {	// Table row element is ALWAYS anonymous
    return tr.cells;
}

// Reuse a cell in an HTML table row. If it doesn't already exist, create it.
function ReuseCell (tr, x) {	// Table row element is ALWAYS anonymous
    return x < tr.cells.length ? tr.cells[x] : tr.insertCell (x);
}

// Get table rows
function GetRows (tab) {
    return Id (tab).rows;
}

// Reuse a row in an HTML table. If it doesn't already exist, create it.
// (Vertical scrolling is jumpy if table contents are cleared and recreated)
function ReuseRow (tab, y) {
    return y < (tab = Id (tab)).rows.length ? tab.rows[y] : tab.insertRow (y);
}

// Remove trailing cells from an HTML table row by reference
function TruncRow (tr, n) {
    while (tr.cells.length && tr.cells.length > n) {
	tr.deleteCell (tr.cells.length-1);
    }
}

// Remove trailing rows from an HTML table by reference
function TruncTable (tab, n) {
    for (tab = Id (tab); tab.rows.length && tab.rows.length > n; ) {
	tab.deleteRow (tab.rows.length-1);
    }
}

// Get select options
function GetOptions (sel) {
    return Id (sel).options;
}

// Add an option element to a select list
function AddOption (s, text, value) {
    var o = document.createElement ('option');
    o.text = text;
    SetValue (o, value === undefined ? text : value);
    Id(s).add (o, null);
}

// Remove trailing options from a select list
function TruncOptions (sel, n) {
    for (sel = Id (sel); sel.length > n; ) {
	sel.remove (sel.length - 1);
    }
}

// The following methods/properties are used infrequently, so I didn't bother
// writing cover functions for them:
//   AddCell: appendChild() createTextNode() createElement()
//   MouseAbs: document body documentElement pageX pageY clientX clientY scrollLeft scrollTop
//   MouseRel: window.event target srcElement offsetParent offsetLeft offsetTop
// (also, all canvas functions; thus, Id() is also called once from DrawGls)



//------------------------------ Array, number, and string primitives ----------

// Find index of an object in a list, or -1 if not there
// This is the same as array.indexOf, but even works with older browsers
function In (list, obj) {
    for (var i = 0; i < list.length; ++i) {
	if (obj === list[i]) {
	    return i;
	}
    }
    return -1;
}

// Find index of NaN in a list, or -1 if not there
// This works like In, but it must be separate, because NaN !== NaN
function InNaN (list) {
    for (var i = 0; i < list.length; ++i) {
	if (isNaN (list[i])) {
	    return i;
	}
    }
    return -1;
}

// Compute gamma function of a real number x (i.e. (x-1)!)
function Gamma (x) {
    if (isNaN (x)) {			// Nan! = Nan
	return x;
    }

    var i = x === Math.round (x);	// Pure integer?
    if (i && x <= 0) {			// Singularities at negative integers
	return _;
    }

    var z = 1;
    while (x < 0) {			// Constrain x to 0 < x
	if ((z *= x++) === _) {		// Calculating reciprocal reduces division errors
	    return 1/z;
	}
    }

    z = 1/z;
    while (x > 1) {			// Constrain x to x < 1
	if ((z *= --x) === _) {
	    return z;
	}
    }

    if (!i) {				// Polynomial calculates 1/Gamma (x), 0<x<1
	var p = 0;
	for (i = gpoly.length; --i >= 0; ) {
	    p = p*x + gpoly[i];
	}
	z /= p;
    }

    return z;
}

// Split (possibly transfinite) number into [multiplier, 2*order of magnitude]
// Number is stored as multiplier + 2*OMEGA*order; NaN is stored as 1+(2*OMEGA+1)*order.
// Magnitude is scaled by period^order, to make sure it is in a reasonable range.
function OrderPair (n, q) {
    var o = Math.floor (n / OMEGA);	// 2*order + value_is_NaN
    n -= o*OMEGA;
    return [o & 1 ? NaN : n / Pow (q, o), o];
}

// Return (possibly transfinite) number as a real number
// ?*t^n is treated as infinite, rather than indeterminate
function OrderNum (n) {
    n = OrderPair (n, 1);
    return (n[1]&~1) ? n[1]<0 ? 0 : _ : n[0];
}

// Divide two (possibly transfinite) numbers
// By convention, n/NaN*w^p is treated as NaN*w^(p-1)
function OrderDiv (x, y) {
    var u = OrderPair (x, 1);
    var v = OrderPair (y, 1);
    var n = (u[1] | v[1]) & 1;
    return OMEGA*(2*((u[1]>>1)-(v[1]>>1)-(v[1]&~u[1]&1))+n) + (n ? 1 : Div (u[0], v[0]));
}

// Add two numbers. Edge case _+-_ returns 0, rather than NaN
// (Subtract by adding the negative.)
function Add (x, y) {
    var r = x + y;
    return isNaN (r) && !isNaN (x) && !isNaN (y) ? 0 : r;
}

// Multiply two numbers. Edge case 0*_ returns 0, rather than NaN
function Mul (x, y) {
    var r = x * y;
    return isNaN (r) && !isNaN (x) && !isNaN (y) ? 0 : r;
}

// Divide two numbers. Edge cases 0/0 and _/_ return 1, rather than NaN
function Div (n, d) {
    return n === d ? 1 : (n === -d ? -1 : n/d);
}

// Raise one number to the power of another.
// Edge cases 1^_ and 1^-_ and 1^NaN.
// Math.pow correctly handles NaN^0=1.
// It SHOULD return NaN for nonzero (-x)^(_ or fraction), but doesn't;
// however, we're not really concerned with such minute details.
function Pow (x, y) {
    return x === 1 ? 1 : Math.pow (x, y);
}

// Tolerantly compare two numbers for equality.
// This is forgiving of errors caused by rounding.
// Caller should have already checked for absolute equality, to save time,
// and also to have dealt with edge conditions like _.===_.
// (This uses the same criterion used by the J programming language comparisons)
function Eq (x, y, ct) {
    var scale = Math.max (Math.abs (x), Math.abs (y));
    return scale === _ ? x === y : Math.abs (x-y) <= scale*ct;
}

// Tolerant floor
function Floor (x, ct) {
    var r = Math.round (x);
    return r - (r > x && !Eq (r, x, ct));
}

// Tolerant ceiling
function Ceil (x, ct) {
    var r = Math.round (x);
    return r + (r < x && !Eq (r, x, ct));
}

// Calculate residue. This is like modulus, but always nonnegative.
// It also uses comparison tolerance.
function Residue (n, d, ct) {
    var q = n / d;				// Raw quotient
    var w = Floor (q, ct);			// Whole part: (q-w)*d is raw residue
    return (Ceil (q, ct) !== w) * (n - d*w);
}

// Get low half of a pair of numbers (high half is Math.floor (x))
function Lowpart (x) {
    return x*PAIR % PAIR;
}

// Compute GCD of two integers using Euclid's algorithm. Comparisons are tolerant.
// (NOTE: This also works for _ and NaN. Since this is only used for
//  integer periods on the stamp page, no special handling is needed for reals.)
function GCD (x, y, ct)
{
    x = Math.abs (x);
    y = Math.abs (y);

    if (x === 1 || y === 1) {		// GCD (1, n) = GCD (n, 1) = 1
	return 1;			// (even if n is _ or NaN)
    } else if (x === y || x === 0 || x === _) {	// GCD (n, n) = n = GCD (0, n) = (_, n) = n
	return y;			// (even if n is 0 or _ or NaN)
    } else if (y === _) {		// GCD (n, 0) = GCD (n, _) = n
	return x;			// (even if n is 0 or _ or NaN)
    }

    while (y) {
	var z = Residue (x, y, ct);
	x = y;
	y = z;
    }

    return x;
}

// Compute LCM of two integers. Comparisons are tolerant.
// This handles the following edge conditions:
//	LCM (0, 0) = 0; LCM (_, _) = _
function LCM (x, y, ct) {
   return x === y ? x : x / GCD (x, y, ct) * y;
}

// Convert a real number into rational form. Comparisons are tolerant.
// Real number is converted into a continued fraction via Euclid's GCD algorithm
// Caller handles edge conditions like _ and NaN and negative numbers
// (NOTE: This does not work well with really huge denominators!)
function Rational (f, ct) {
    var c = new Array (NCF);		// f=c[0]+1/(c[1]+1/(...+1/(c[n-1])))
    var n = 0;
    var z;

    for (; n < NCF; f = 1/z) {		// Compute continued fraction
	z = Residue (f, 1, ct);
	c[n++] = f - z;
	if (!z) {
	    break;
	}
    }

    var u = c[--n];			// Result is u/v
    var v = 1;

    while (--n >= 0) {			// For each term, u/v = (c[n]/1) + (v/u)
	z = u * c[n] + v;
	v = u;
	u = z;
    }

    return [Math.round (u), Math.round (v)];
}

// Parse a string into a number, for system data.
// This is much less functional than ParseUfloat, and should run faster.
// Allow character _ (infinity) and infix operator / (division)
// parseFloat will automatically return NaN for ?, so we don't need to parse it
function ParseSfloat (str) {
    var i = str.lastIndexOf ('/');		// x / y (also / y => 1 / y)
    if (i >= 0) {
	return ParseSfloat (str.substring (0, i)) / parseInt (str.substring (i+1));
    } else if (str === '_') {			// Infinity
	return _;
    } else {
	return parseFloat (str);		// 'normal' real number
    }
}

// Parse a string into a number, for user-entered data. Spaces are ignored.
// Also allow empty strings for default value.
// Allow characters: _ ? x infinity (and words: inf infinity unknown nan)
// Allow suffix characters: 1/4 1/2 3/4 ^1 ^2 ^3 ! e pi tau phi (and words: pi tau phi)
// Allow infix characters: * / ^ times divide sqrt (and words: sqrt root)
// Allow infix characters: + - (except after e)
function ParseUfloat (str, nan, def) {
    var i;
    for (i = keywords.length; --i >= 0; ) {	// Remove spaces; translate keywords
	str = str.replace (keywords[i], keychars[i]);
    }

    var i = str.lastIndexOf ('+');		// x + y (also + y => 1 + y)
    if (i >= 0 && (i <= 1 || str.charAt (i-1) !== 'e')) {
	return Add (ParseUfloat (str.substring (0, i), nan, 0),
	  ParseUfloat (str.substring (i+1), nan, 0));
    }

    i = str.lastIndexOf ('-');			// x - y (also - y => 0 / y)
    if (i >= 0 && (i <= 1 || str.charAt (i-1) !== 'e')) {
	return Add (ParseUfloat (str.substring (0, i), nan, 0),
	  -ParseUfloat (str.substring (i+1), nan, 0));
    }

    i = Math.max (str.lastIndexOf ('*'), str.lastIndexOf (Utimes));
    if (i >= 0) {				// x * y (also * y => 1 * y)
	return Mul (ParseUfloat (str.substring (0, i), nan, 1),
	  ParseUfloat (str.substring (i+1), nan, 1));
    }

    i = Math.max (str.lastIndexOf ('/'), str.lastIndexOf (Udivide));
    if (i >= 0) {				// x / y (also / y => 1 / y)
	return Div (ParseUfloat (str.substring (0, i), nan, 1),
	  ParseUfloat (str.substring (i+1), nan, 1));
    }

    i = str.lastIndexOf ('^');			// x ^ y (also ^ y => e * y)
    if (i >= 0) {
	return Pow (ParseUfloat (str.substring (0, i), nan, Math.E),
	  ParseUfloat (str.substring (i+1), nan, 1));
    }

    i = str.lastIndexOf (Usqrt);		// x root y (also root y => 2 root y)
    if (i >= 0) {
	return Pow (ParseUfloat (str.substring (i+1), nan, 1),
	  1 / ParseUfloat (str.substring (0, i), nan, 2));
    }

    if (str === '') {				// Empty string: default value
	return def;
    } else if (str === '_' || str === Uinf) {	// Infinity
	return _;
    } else if (str === '?' || str === 'x') {	// Unknown
	return nan;
    } else if ((i = suffc.indexOf (str.charAt (str.length-1))) >= 0) {
	var j = suffn[i];
	str = str.substring (0, str.length-1);
	if (i < 3) {		// n 1/4 (also 1/4 => 0 1/4); also 1/2 3/4
	    return ParseUfloat (str, nan, 0) + j;
	} else if (i < 6) {	// n ^1 (also ^1 => e ^1); also ^2 ^3
	    return Pow (ParseUfloat (str, nan, Math.E), j);
	} else if (i === 6) {	// n ! (also ! => 1 !)
	    return Gamma (1 + ParseUfloat (str, nan, 1));
	} else {		// n pi (also pi => 1 pi); also e tau phi etc.
	    return ParseUfloat (str, nan, 1) * j;
	}
    } else {
	return parseFloat (str);		// 'normal' real number (can be ?)
    }
}

// Parse a string into a number, for user-entered data, ignoring case
function ParseLfloat (str, nan) {
    return ParseUfloat (str.toLowerCase (), nan, 0);
}

// Parse a string into a number or string of one or more numbers, ignoring case
function ParseLfloats (str, nan) {
    str = str.replace (/,/g, ';');		// Allow , as well as ;
    var i = str.indexOf (';');

    if (i < 0) {				// Single number
	return ParseLfloat (str, nan);
    }

    var a = [];

    while ((i = str.indexOf (';')) > 0) {	// Multiple numbers
	a[a.length] = ParseLfloat (str.substring (0, i), nan);
	a = str.substring (i+1);
    }

    a[a.length] = ParseLfloat (str, nan);
    return a;
}

// Compare a file/pattern name, or list of names, against a pattern
function WildCmp (list, pat, f) {
    if (typeof list !== 'string') {		// list of strings
	for (var i = list.length; --i >= 0; ) {
	    if (WildCmp (list[i], pat, f)) {
		return true;
	    }
	}
	return false;
    } else {
	if (f) {				// Names strip all punctuation except .
	    list = list.replace (/[^0-9A-Za-z.]/g, '');
	}
	return list.search (pat) >= 0;
    }
}

// See if a number matches a selected range
// This supports integers and reals (n/1, x/1, y/1)
// It also supports rationals (n/q, x/d, y/d) to avoid real division rounding
// errors: q!===1 only with s_vels, s_rpops, s_mods, s_sqbs, s_sqhs;
// d!===1 only with s_svels.
// g=0 for most; g=TBD for gliders; g=_ for rarity (for incomparability side-effects)
function MatchNum (n, q, type, x, y, d, g) {
    var i;

    if (typeof d !== 'number') {		// d is a list of numbers
	if (type === M_EQ) {			// n===y/d0 || n===y/d1 || ...
	    for (i = 0; i < d.length; ++i) {
		if (MatchNum (n, q, type, x, y, d[i], g)) {
		    return true;
		}
	    }
	    return false;
	} else {				// n!===y/d0 && n!===y/d1 && ...
	    for (i = 0; i < d.length; ++i) {
		if (!MatchNum (n, q, type, x, y, d[i], g)) {
		    return false;
		}
	    }
	    return true;
	}
    } else if (typeof y !== 'number') {		// y is a list of numbers
	if (type === M_EQ) {			// n===y0 || n===y1 || ...
	    for (i = 0; i < y.length; ++i) {
		if (MatchNum (n, q, type, x, y[i], d, g)) {
		    return true;
		}
	    }
	    return false;
	} else {				// n!===y0 && n!===y1 && ...
	    for (i = 0; i < y.length; ++i) {
		if (!MatchNum (n, q, type, x, y[i], d, g)) {
		    return false;
		}
	    }
	    return true;
	}
    } else if (typeof x !== 'number') {		// x is a list of numbers
	for (i = 0; i < x.length; ++i) {	// x0<=n<=y && x1<=n<=y && ...
	    if (!MatchNum (n, q, type, x[i], y, d, g)) {
		return false;
	    }
	}
	return true;
    } else {
	if (n === q) {				// Treat 0/0 and _/_ as 1
	    n = q = 1;
	}
	switch (type) {				// Types that don't rely on y
	case M_ANY:				// match any
	    return true;
	case M_INF:				// n = Infinity
	    return n === _;
	case M_NAN:				// n = NaN
	    return isNaN (n);
	case M_UNKNOWN:				// n >= 'x'
	    return n >= UNKNOWN;
	case M_PARTIAL:				// n > 'x'
	    return n > UNKNOWN;
	case M_TBD:				// n === TBD
	    return n === TBD;
	case M_KNOWN:				// n === KNOWN
	    return n === KNOWN;
	}
	if (isNaN (y)) {			// === doesn't work on NaN
	    switch (type) {
	    case M_EQ:				// n === NaN
	    case M_LE:				// n <= NaN
	    case M_GE:				// n >= NaN
		return isNaN (n);
	    case M_NE:				// n !== NaN
		return !isNaN (n);
	    case M_IN:				// x <= n <= NaN
		return isNaN (n) && isNaN (x);
	    case M_OUT:				// n < x || y < n
		return !isNaN (n) || !isNaN (x);
	    }
	} else if (isNaN (n) && !g) {		// ? is treated as unknown large integer
	    switch (type) {
	    case M_NE:				// ? !== y
		return true;
	    case M_LT:				// ? < _
	    case M_LE:				// ? <= _
		return y === _;
	    case M_GT:				// ? > y
	    case M_GE:				// ? >=y
		return y !== _;
	    case M_IN:				// x <= ? <= _
		return x === _ ^ y === _;
	    case M_OUT:				// ? < x || y < ?
		return x === _ ^ y !== _;
	    }
	} else {
	    if (g && (((n >= g) ^ (y >= g)) ||
	      type >= M_IN && ((x >= g) ^ (y >= g)))) {
		return type === M_OUT;		// High values are incomparable
	    }
	    if (n === 0) {			// 0 / anything = 0
		q = 1;
	    } else if (q == 0) {		// anything / 0 = _
		n = _;
		q = 1;
	    } else if (isNaN (n)) {		// ? / anything = ?;
		q = 1;
	    } else if (n === _) {		// _ / anything = _; _ / ? > 1
		// TBD: treat _/? as smaller than _
	    } else if (isNaN (q)) {		// n / ? > n / _
		++n;
		q = _;
	    }
	    n *= d;
	    x *= q;
	    y *= q;
	    switch (type) {
	    case M_EQ:				// n/q === y/d
		return n === y || Eq (n, y, CT);
	    case M_NE:				// n/q !== y/d
		return n !== y && !Eq (n, y, CT);
	    case M_LT:				// n/q < y/d
		return n < y && !Eq (n, y, CT);
	    case M_LE:				// n/q <= y/d
		return n <= y || Eq (n, y, CT);
	    case M_GT:				// n/q > y/d
		return n > y && !Eq (n, y, CT);
	    case M_GE:				// n/q >= y/d
		return n >= y || Eq (n, y, CT);
	    case M_IN:				// x/q <= n/d <= y/q
		return (x <= n || Eq (x, n, CT)) && (n <= y || Eq (n, y, CT)) ||
		       (y <= n || Eq (y, n, CT)) && (n <= x || Eq (n, x, CT));
	    case M_OUT:				// n/d < x/q || y/q < n/d
		return ! ((x <= n || Eq (x, n, CT)) && (n <= y || Eq (n, y, CT)) ||
			 (y <= n || Eq (y, n, CT)) && (n <= x || Eq (n, x, CT)));
	    }
	}
	return false;
    }
}

// See if a (possibly transfinite) number matches a selected range
function MatchOrderNum (n, q, type, x, y, d, g) {
    while (n >= 2*OMEGA && q >= 2*OMEGA) {
	n -= 2*OMEGA;
	q -= 2*OMEGA;
    }
    return MatchNum (OrderNum (n), OrderNum (q), type, x, y, d, g);
}



// Compare two strings, similar to C library strcmp, but treating integers as
// atomic; e.g. '8.3' < '12.2' < '12.10'
// Also, case is ignored
function StrCmp (x, y) {
    var n = Math.min (x.length, y.length);	// Length of common part

    for (var i = 0; i < n; ++i) {
	var u = x.charCodeAt (i);
	var v = y.charCodeAt (i);
	if (u >= 0x41 && u <= 0x5A) {		// Convert to lower-case
	    u += 0x20;
	}
	if (v >= 0x41 && v <= 0x5A) {		// Convert to lower-case
	    v += 0x20;
	}
	if (u !== v) {
	    while (i > 0 && (n = x.charCodeAt (i-1)) >= 0x30 && n <= 0x39) {
		--i;				// Number: find where it started
	    }
	    x = parseInt (x.substring (i));
	    y = parseInt (y.substring (i));
	    if (!isNaN (x) && !isNaN (y)) {	// Difference in numbers
		return x - y;
	    }
	    return u - v;			// Difference in characters
	}
    }

    return x.length - y.length;			// Empty string < non-empty string
}

// Compare two strings or arrays of strings for sorting purposes
function CmpName (x, y) {
    if (typeof x === 'string') {
	if (typeof y === 'string') {		// x :: y
	   return StrCmp (x, y);
	} else {				// x :: y0,y1,...
	   return StrCmp (x, y[0]) || -1;
	}
    } else if (typeof y === 'string') {		// x0,x1,... :: y
	return StrCmp (x[0], y) || 1;
    } else {					// x0,x1,... :: y0,y1,...
	var n = Math.min (x.length, y.length);	// Length of common part
	for (var i = 0; i < n; ++i) {
	    var c = StrCmp (x[i], y[i]);
	    if (c) {
		return c;
	    }
	}
	return x.length - y.length;		// Empty list < non-empty list
    }
}

// Compare two pattern images for sorting purposes.
// It is assumed that images are in compressed canonical form. Thus:
// - a space never precedes a space run, or newline, or end of string
// - space runs are always maximum length, if possible (so fronts will match)
// - space runs never precede newline or end of string
// - newlines never precede end of string
function CmpImg (x, xw, xh, y, yw, yh) {
    if (typeof x !== 'string') {	// If multiple images, use the first one
	x = x[0];
    }

    if (typeof y !== 'string') {
	y = y[0];
    }

    var i = (xh - yh) || (xw - yw);

    if (i) {				// Sort by box first; this also eliminates
	return i;			// really huge patterns like Gemini.
    }

    var n = Math.min (x.length, y.length);	// Length of common part

    for (i = 2; i < n; ++i) {
	var u = x.charCodeAt (i);	// Bytes from each pattern
	var v = y.charCodeAt (i);
	if (u !== v) {
	    if (u === 0x0A) {		// newline < value or space run
		return -1;
	    } else if (v === 0x0A) {	// value or space run > newline
		return 1;
	    } else if (u >= 0x60) {	// space run < value
		return -1;
	    } else if (v >= 0x60) {	// value > space run
		return 1;
	    } else {			// value < = > value
		return u - v;
	    }
	}
    }

    return x.length - y.length;		// Empty pattern < non-empty pattern
}

// Compare two numbers for sorting purposes.
// For predictable sorting, NaN=NaN, x<NaN<_N/A for any finite x
function CmpNum (x, y, n) {
    if (x === y) {		// x = y (avoid _-_ below!)
	return 0;
    } else if (x === _ && n) {	// _ > y or NaN (but not N/A)
	return 1;
    } else if (y === _ && n) {	// x or NaN (but not N/A) < _
	return -1;
    } else if (isNaN (x)) {
	if (isNaN (y)) {	// NaN = NaN
	    return 0;
	} else {		// NaN > y
	    return 1;
	}
    } else {
	if (isNaN (y)) {	// x < NaN
	    return -1;
	} else {		// x < > y
	    return x - y;
	}
    }
}

// Compare two rational numbers for sorting purposes.
// This removes the chance of rounding errors when comparing integers
// (e.g. 25/5 !== 5/1), by comparing xn*yd and yn*xd rather than xn/xd and yn/yd.
// The following cases can occur (* are treated specially)
// - Modulus:		_/(1|2|4)* or period/(1|2|4)
// - Velocity:		n/d
// - Volatility:	NaN/NaN or svol/vol or 0/0*
// - Gliders/bit:	gls/pop or KNOWN/pop* TBD/pop* UNKNOWN[+n]/pop*
// - Maximum box:	n/d or _/d or _/_* or 0/0*
// The following special cases are handled:
// - NaN is treated the same way it is when comparing integers (i.e. 0<NaN<_)
//   (Since the denominators are always at least as predictable as the numerators,
//   one can have NaN/NaN or NaN/d (which both behave predictably), but never n/NaN.)
//   - (Actually, n/NaN CAN now occur; it is treated as 0<n/NaN<1)
// - 0/0 and _/_ are treated as 1
// - Infinities can be relative: i.e. _/x < _/y if x > y
//   (This should now never occur, as any values that could possibly be infinite
//    should use Order numbers)
// - KNOWN/TBD/UNKNOWN gliders ignore population

function CmpRat (xn, xd, yn, yd, g) {
    if (xd === yd) {					// x/d :: y/d => x :: y
	return CmpNum (xn, yn, true);
    } else if (xn === yn) {				// n/x :: n/y => y :: x
	return CmpNum (yd, xd, true);
    } else if (xn === xd) {				// x/x, 0/0, _/_ => 1
	xn = xd = 1;
    } else if (xn === 0 || xd === _) {			// 0/x, x/_ => 0
	xn = 0;
	xd = 1;
    }
    if (yn === yd) {					// y/y, 0/0, _/_ => 1
	yn = yd = 1;
    } else if (yn === 0 || yd === _) {			// 0/y, y/_ => 0
	yn = 0;
	yd = 1;
    }
    if (xn === _ || xd === 0) {				// _/x, x/0 > y/d
	return 1;
    } else if (yn === _ || yd === 0) {			// NaN or y < _/y, y/0
	return -1;
    } else if (isNaN (xn)) {
	if (isNaN (yn)) {				// NaN = NaN
	    return 0;
	} else {					// NaN > y/d
	    return 1;
	}
    } else {
	if (isNaN (yn)) {				// x/d < NaN
	    return -1;
	} if (isNaN (xd)) {
	    if (isNaN (yd)) {				// x/NaN :: y/NaN => x :: y
		return CmpNum (xn, yn, true);
	    } else {					// 0 < x/NaN < y
		return yn ? 1 : -1;
	    }
	} else if (isNaN (yd)) {			// 0 < y/NaN < x
	    return xn ? -1 : 1;
	} else if (g && (xn >= KNOWN || yn >= KNOWN)) {	// Don't divide TBD/UNKNOWN
	    return xn - yn;
	} else {					// x/d < = > y/d
	    return xn*yd - yn*xd;
	}
    }
}

// Compare two rational numbers (with possibly transfinite numerators and/or
// denominators) for sorting purposes.
// The following sort order is always followed:
// n/d*t^i < ?*t^i < any*t^(i+1); 0 < any*t^any
function CmpOrderRat (xn, xd, xp, yn, yd, yp) {
    if (xn === 0 || yn === 0) {		// 0 < anything else
	return CmpRat (xn, xd, yn, yd, false);
    }
    var un = OrderPair (xn, xp);
    var ud = OrderPair (xd, xp);
    var vn = OrderPair (yn, yp);
    var vd = OrderPair (yd, yp);
    var o = (un[1]>>1)-(ud[1]>>1) - (vn[1]>>1)+(vd[1]>>1);
    return o ? o : CmpRat (un[0], ud[0], vn[0], vd[0], false);
}

// Compare two (possibly transfinite) bounding boxes for sorting purposes by perimiter:
function CmpOrderAdd (xw, xh, xp, yw, yh, yp) {
    var uw = OrderPair (xw, xp);
    var uh = OrderPair (xh, xp);
    var vw = OrderPair (yw, yp);
    var vh = OrderPair (yh, yp);
    return CmpNum (Math.max (uw[1], uh[1]), Math.max (vw[1], vh[1]), true) ||
	   CmpNum ((uw[0]+uh[0])/xp, (vw[0]+vh[1])/yp, true);
}

// Compare two (possibly transfinite) bounding boxes for sorting purposes by area:
function CmpOrderMul (xw, xh, xp, yw, yh, yp) {
    var uw = OrderPair (xw, xp);
    var uh = OrderPair (xh, xp);
    var vw = OrderPair (yw, yp);
    var vh = OrderPair (yh, yp);
    return CmpNum ((uw[1]>>1)+(uh[1]>>1), (vw[1]>>1)+(vh[1]>>1), true) ||
	   CmpNum (uw[1]+uh[1], vw[1]+vh[1]) || CmpNum (uw[0]*uh[0], vw[0]*vh[1], true);
}

// Compare two solutions based on user-selected default sort criteria
function CmpBucket (x, y) {
    var u;
    var v;
    var i;

    switch (defsort) {
    default:		// huh?
	i = 0;
	break;
    case S_MINP:	// Minimum population
	i = CmpNum (x.p_minp, y.p_minp, true);
	break;
    case S_AVGP:	// Averge population
	u = OrderPair (x.p_avgp, x.p_per);
	v = OrderPair (y.p_avgp, y.p_per);
	i = CmpNum (u[1], v[1], true) || CmpNum (u[0], v[0], true);
	break;
    case S_MAXP:	// Maximum population
	u = OrderPair (x.p_maxp, x.p_per);
	v = OrderPair (y.p_maxp, y.p_per);
	i = CmpNum (u[1], v[1], true) || CmpNum (u[0], v[0], true);
	break;
    case S_RPOP:	// Ratio of min/max population
	i = CmpRat (x.p_minp, OrderNum (x.p_maxp),
	  y.p_minp, OrderNum (y.p_maxp), false);
	break;
    case S_INF:		// Influence
	u = OrderPair (x.p_inf, x.p_per);
	v = OrderPair (y.p_inf, x.p_per);
	i = CmpNum (u[1], v[1], true) || CmpNum (u[0], v[0], true);
	break;
    case S_DEN:		// Minimum density
	i = CmpOrderRat (x.p_minp, x.p_inf, x.p_per, y.p_minp, y.p_inf, y.p_per);
	break;
    case S_ADEN:	// Average density
	i = CmpOrderRat (x.p_avgp, x.p_inf, x.p_per, y.p_avgp, y.p_inf, y.p_per);
	break;
    case S_MDEN:	// Maximum density
	i = CmpOrderRat (x.p_maxp, x.p_inf, x.p_per, y.p_maxp, y.p_inf, y.p_per);
	break;
    case S_HEAT:	// Heat
	u = OrderPair (x.p_heat, x.p_per);
	v = OrderPair (y.p_heat, x.p_per);
	i = CmpNum (u[1], v[1], true) || CmpNum (u[0], v[0], true);
	break;
    case S_TEMP:	// Temperature
	i = CmpNum (x.p_temp, y.p_temp, true);
	break;
    case S_VOL:		// Volatility
	i = CmpNum (x.p_vol, y.p_vol, true);
	break;
    case S_SVOL:	// Strict volatility
	i = CmpNum (x.p_svol, y.p_svol, true);
	break;
    case S_RVOL:	// Strict volatility / volatility
	i = CmpRat (x.p_svol, x.p_vol, y.p_svol, y.p_vol, false);
	break;
    case S_SYMM:	// Symmetry (, glide symmetry)
	i = CmpNum (x.p_GetSymm (), y.p_GetSymm (), true) ||
	    CmpNum (x.p_GetGlide (), y.p_GetGlide (), true);
	break;
    case S_GLIDE:	// Glide symmetry (, symmetry)
	i = CmpNum (x.p_GetGlide (), y.p_GetGlide (), true) ||
	    CmpNum (x.p_GetSymm (), y.p_GetSymm (), true);
	break;
    case S_BOX:		// Smallest bounding box
	i = CmpNum (x.p_boxw+x.p_boxh, y.p_boxw+y.p_boxh, true) ||
	    CmpNum (x.p_boxw*x.p_boxh, y.p_boxw*y.p_boxh, true);
	break;
    case S_SQB:		// Smallest bounding box squareness
	i = CmpRat (x.p_boxh, x.p_boxw, y.p_boxh, y.p_boxw, false);
	break;
    case S_HULL:	// Largest bounding box
	i = CmpOrderAdd (x.p_hullw, x.p_hullh, x.p_per, y.p_hullw, y.p_hullh, y.p_per) ||
	    CmpOrderMul (x.p_hullw, x.p_hullh, x.p_per, y.p_hullw, y.p_hullh, y.p_per);
	break;
    case S_SQH:		// Largest bounding box squareness
	i = CmpOrderRat (x.p_hullh, x.p_hullw, x.p_per, y.p_hullh, y.p_hullw, y.p_per);
	break;
    case S_PER:		// Period
	i = CmpNum (x.p_per, y.p_per, true);
	break;
    case S_MOD:		// Modulus (, period); pretend _/2 < _, etc.
	u = x.p_GetRmod ();
	v = y.p_GetRmod ();
	i = CmpRat (x.p_per, u, y.p_per, v, false) || (u - v) ||
	    CmpNum (x.p_per, y.p_per, true);
	break;
    case S_RMOD:	// Period / modulus
	i = x.p_GetRmod () - y.p_GetRmod ();
	break;
    case S_VEL:		// Velocity (, direction, period)
	i = CmpRat (x.p_velx, x.p_veld, y.p_velx, y.p_veld, false) ||
	    CmpRat (x.p_vely, x.p_veld, y.p_vely, y.p_veld, false) ||
	    CmpNum (x.p_per, y.p_per, true);
	break;
    case S_GLS:		// Gliders
	i = CmpNum (x.p_gls, y.p_gls, true);
	break;
    case S_RGLS:	// Gliders/bit
	i = x.p_gls >= KNOWN || y.p_gls >= KNOWN ? CmpNum (x.p_gls, y.p_gls, true) :
	  CmpRat (x.p_gls, x.p_minp, y.p_gls, y.p_minp, true);
	break;
    case S_FREQ:	// Frequency
	i = CmpNum (x.p_freq, y.p_freq, false);
	break;
    case S_RAR:		// Rarity
	i = CmpNum (FREQBASE/x.p_freq, FREQBASE/y.p_freq, false);
	break;
    case S_TTS:		// Time to stabilize
	i = CmpNum (x.p_tts, y.p_tts, false);
	break;
    case S_EF:		// Evolutionary factor
	i = CmpNum (x.p_GetEf (), y.p_GetEf (), true);
	break;
    case S_CAT:		// Category
	i = CmpNum (rulelib[sortrule][x.p_hdr].h_cid,
		    rulelib[sortrule][y.p_hdr].h_cid, true) ||
	    CmpNum (rulelib[sortrule][x.p_hdr].h_bad,
		    rulelib[sortrule][y.p_hdr].h_bad, true);
	break;
    case S_FILE:	// File name
	i = CmpName (x.p_file, y.p_file);
	break;
    case S_NAME:	// Pattern name
	i = CmpName (x.p_name, y.p_name);
	break;
    case S_IMG:		// Pattern image (including population, height, width)
	i = CmpNum (x.p_minp, y.p_minp, true) ||
	  CmpNum (x.p_boxh, y.p_boxh, true) || CmpNum (x.p_boxw, y.p_boxw, true) ||
	  CmpImg (x.p_img, x.p_boxw, x.p_boxh, y.p_img, y.p_boxw, y.p_boxh);
	break;
    }

    // If main sort criterion is equal, sort by secondary criteria: population,
    // period, name (for list), image. Name should normally be unique.
    return sortdir * (i || CmpNum (x.p_minp, y.p_minp, true) || CmpNum (x.p_per, y.p_per, true) ||
      (view === V_LIST && CmpName (x.p_name, y.p_name)) ||
      CmpNum (x.p_boxh, y.p_boxh, true) || CmpNum (x.p_boxw, y.p_boxw, true) ||
      CmpImg (x.p_img, x.p_boxw, x.p_boxh, y.p_img, y.p_boxw, y.p_boxh));
}



//------------------------------ Life field functions --------------------------

// Compact borders, deleting unnecessary white space from all sides
function Compact (f) {
    var i;

    f.f_lft = f.f_top = 0;
    f.f_rgt = f.f_wid;
    f.f_btm = f.f_hgt;

    while (f.f_top < f.f_btm) {
	for (i = f.f_lft; i < f.f_rgt; ++i) {
	    if (f.f_img[f.f_top*f.f_wid+i]) {
		break;
	    }
	}
	if (i < f.f_rgt) {
	    break;
	}
	++f.f_top;
    }

    while (f.f_top < f.f_btm) {
	for (i = f.f_lft; i < f.f_rgt; ++i) {
	    if (f.f_img[(f.f_btm-1)*f.f_wid+i]) {
		break;
	    }
	}
	if (i < f.f_rgt) {
	    break;
	}
	--f.f_btm;
    }

    while (f.f_lft < f.f_rgt) {
	for (i = f.f_top; i < f.f_btm; ++i) {
	    if (f.f_img[i*f.f_wid+f.f_lft]) {
		break;
	    }
	}
	if (i < f.f_btm) {
	    break;
	}
	++f.f_lft;
    }

    while (f.f_lft < f.f_rgt) {
	for (i = f.f_top; i < f.f_btm; ++i) {
	    if (f.f_img[i*f.f_wid+f.f_rgt-1]) {
		break;
	    }
	}
	if (i < f.f_btm) {
	    break;
	}
	--f.f_rgt;
    }
}



//------------------------------ File format conversions -----------------------

// Convert a binary bit rule integer into a string of digits
function BinRule (r) {
    var str = '';
    for (var i = 0; i < 10; ++i) {
	if ((r >> i) & 1) {
	    str += i;
	}
    }
    return str;
}

// Parse RLE 'rules=' clause
function RleRule (str) {
    var result;				// Resulting rule
    rulerle[R_OTHER] = str;

    if (str === rulerle[R_NIEMIEC0]) {	// Named rules are handled specially
	result = R_NIEMIEC0;
    } else if (str === rulerle[R_NIEMIEC1]) {
	result = R_NIEMIEC1;
    } else {
	var r = 0;			// Build up totalistic rule (B | S<<10):
	var base = 20;			// Bn=0..9, Sn=10..19, n=20..29
	for (var i = 0; i < str.length; ++i) {
	    var c = str.charCodeAt (i);
	    if (c === 0x42) {		// B introduces birth digits
		base = 0;
	    } else if (c === 0x53) {	// S introduces survival digits
		base = 10;
	    } else if ((c -= 0x30) >= 0 && c <= 0x39) {	// Digits set rule
		r |= 1 << (base+c);
	    } else {			// Other characters: ignored (e.g. /)
		base = 20;		// but digits after them are invalid
	    }
	}
	if (r === 0x3008) {		// B23/S23: Life
	    result = R_LIFE;
	} else if (r === 0x1004) {	// B2/S2: 2/2 Life
	    result = R_B2S2;
	} else if (r === 0x6018) {	// B34/S34: 3/4 Life
	    result = R_B34S34;
	} else {			// Other: unknown
	    result = R_OTHER;
	    rulerle[R_OTHER] = r >= 0x100000 ? str :
	      'B' + BinRule (r) + '/S' + BinRule (r >> 10);
	}
    }

    rulenames[R_OTHER] = rulerle[R_OTHER] + ' (unsupported)';
    return result;
}

// The following data formats are used here:
// - Text file (string):
//   - Optional #-prefixed comment lines (preserved when copying to RLE)
//   - Simple list of NL-separated lines of . and o (or similar) characters
//   - This is used for interchange with user and external programs
// - RLE file (string):
//   - Optional #-prefixed comment lines (preserved when copying)
//   - Recommended (but optional) header line with x=n, y=n, optional rule=n
//   - One or more runs of dead cells, living cells, newlines, ending with '!'
//   - This is used for interchange with user and external programs
// - Pattern library image (string):
//   - String of characters that are excess-32 encodings of a list of numbers;
//   - First number is height, second is width (values >223 store 0 instead)
//   - The rest is a list of (height) runs, where each run has ceil(width/6)
//     bytes, packing 6 Life cells to a byte; Values of n>63 mean (n+1) zeroes.
//   - Really huge patterns are ' \n' (height=0, width=-19, pattern=empty)
//   - This is used to store patterns internally for pattern-matching purposes
// - Pattern library bucket (object: Pattern):
//   - This contains many statistics about items from the pattern library
//   - p_img is either a pattern library image string, or an array of 2-8 of them.
//   - This is used to store the pattern libraries
// - Binary field (object: Field):
//   - This contains a binary matrix representation of the pattern
//   - It also contains adjustable borders
//   - This is used to manipulate patterns sizes and orientations
// - Symmetry (object: Symmetry):
//   - This contains an array of 1-8 library pattern representations, in all
//     possible translations and reflections
//   - It also contains height, width, and symmetry class
// - Search criteria (object: Searches):
//   - This includes all criteria used to qualify a search
//   - For image searches, it also contains a library pattern representation
//   - For others, it also contains a regular expression to match the text

// How to convert from one format to another (* are currently used):
// From \ To	Screen	  RLE       Text      Life 1.06 Library    Binary
// RLE		1+0       -         1+0       1+0       1+5        1:Rle2Bin*
// Text		2+0       2+0       -         1+0       2+5        2:Text2Bin*
// Life 1.06	3+0       3+0       3+0       -         3+5        3:Life2Bin*
// Library	0:Export* 0:Export* 0:Export* 0:Export* -          4:Lib2Bin* or 0+1
// Binary	0:Export* 0:Export  0:Export  0:Export  5:Bin2Lib*/Export -

// Read Life pattern from RLE data
function Rle2Bin (str) {
    var f;
    var n;
    var wid = 0;
    var hgt = 0;
    var x;
    var i;
    var n;

    str = str.replace (/\n/g, '');		// Newlines ignored within RLE pattern

    for (var pass = 0; pass < 2; ++pass) {	// Pass 0 measures, pass 1 reads
	if (pass) {
	    f = new Field (wid, hgt);
	}
	for (var y = x = i = n = 0; i < str.length; ++i) {
	    var c = str.charAt(i);		// Next character
	    var j = '0123456789'.indexOf (c);	// Digit?
	    if (j >= 0) {			// Accumulate digits
		n = 10*n+j;
	    } else {				// Run of some character:
		if (n === 0) {			// No count => implicit 1
		    ++n;
		}
		if (c === '$') {		// $ => end of line
		    x = 0;
		    y += n;
		} else if (c === '!') {		// ! => end of file
		    break;
		} else {
		    x += n;
		    if (c !== 'b' && c !== '.') {	// ./b => dead, other => alive
			wid = Math.max (wid, x);
			hgt = y+1;
			if (pass) {
			    f.f_maxp += n;
			    if (c === '?') {		// ? => wild
				c = -1;
			    } else {			// other => alive
				f.f_minp += n;
				c = 1;
			    }
			    f.f_wild |= c;
			    while (n) {
				f.f_img[y*wid+x-n--] = c;
			    }
			}
		    }
		}
		n = 0;		// Reset count for next run
	    }
	}
    }

    return f;
}

// Read Life pattern from text array. This also reads Life 1.05 format files
function Text2Bin (str) {
    var f;
    var wid = 0;
    var hgt = 0;

    for (var pass = 0; pass < 2; ++pass) {	// Pass 0 measures, pass 1 reads
	if (pass) {				// Pass 1: create new field
	    f = new Field (wid, hgt);
	}
	for (var y = 0, x = 0, i = 0; i < str.length; ++i) {
	    var c = str.charAt(i);		// Next character
	    if (c === '\n') {			// Newline at end of line
		x = 0;
		++y;
	    } else {			// space/./line => dead, other => alive
		if (pass && ' .:,;!-+|=/\\_'.indexOf (c) < 0) {
		    ++f.f_maxp;
		    if (c === '?') {		// ? => wild
			c = -1;
		    } else {			// other => alive
			++f.f_minp;
			c = 1;
		    }
		    f.f_wild |= f.f_img[y*wid+x] = c;
		}
		wid = Math.max (wid, ++x);
	    }
	}
	hgt = ++y;
    }

    return f;
}

// Read Life pattern from Life 1.06 data
function Life2Bin (str) {
    var f;
    var wid = 0;
    var hgt = 0;
    var left = 0;
    var top = 0;

    for (var pass = 0; pass < 2; ++pass) {	// Pass 0 measures, pass 1 reads
	if (pass) {				// Pass 1: create new field
	    f = new Field (wid-left, hgt-top);
	}
	var s = str;
	while ((i = s.indexOf ('\n')) >= 0) {
	    var line = s.substring (0, i);
	    s = s.substring (i+1);
	    var x = parseInt (line);
	    i = line.indexOf (' ');
	    var y = i >= 0 ? parseInt (line.substring (i+1)) : 0;
	    left = Math.min (left, x);
	    top = Math.min (top, y);
	    wid = Math.max (wid, x+1);
	    hgt = Math.max (hgt, y+1);
	    if (pass) {
		x = (y-top)*(wid-left)+x-left;
		if (!f.f_img[x]) {
		    ++f.f_maxp;
		    ++f.f_minp;
		    f.f_img[x] = f.f_wild = 1;
		}
	    }
	}
    }

    return f;
}

// Convert a library-format pattern into a field
// This could be done by Export to RLE, then Rle2Bin, but since this is used
// in the inner loop of wildcard image search, this optimized version is
// provided instead.
// (NOTE: This is limited to small patterns, so Export+Rle2Bin should be
// used in the general case, should that ever be needed)
function Lib2Bin (pat, minp, w, h) {
    var i = 0;					// Index into library string
    var hgt = pat.charCodeAt (i++) - 0x20;	// Height
    var wid = pat.charCodeAt (i++) - 0x20;	// Width

    if (minp && (wid <= 0 || hgt <= 0)) {	// Huge pattern (e.g. Gemini): can't match
	return null;				// But do NOT discard empty field
    }

    if ((w < wid || h < hgt) && (w < hgt || h < wid)) {	// Ignore patterns that exceed archetype size
	return null;
    }

    var f = new Field (wid, hgt);		// Returned field
    var n = 0;					// Number of queued-up spaces
    var k;					// Next 6 bits

    for (var y = 0; y < hgt; ++y) {
	for (var x = 0; x < wid; ++x, k <<= 1) {
	    if (x%6 === 0) {
		if (n < 0) {			// Coasting on stored newline
		    k = 0;
		} else if (n) {			// Coasting on stored blanks
		    --n;
		    k = 0;
		} else if (i >= pat.length) {	// End of pattern
		    k = 0;
		} else if ((k = pat.charCodeAt (i++) - 0x20) >= 0x40 || k < 0) {
		    n = k-0x40+2 - 1;		// Blank run or newline
		    k = 0;
		}				// Otherwise, 6 bits of data
	    }
	    if ((k >> 5) & 1) {			// Living cell
		++f.f_maxp;
		++f.f_minp;
		f.f_img[y*wid+x] = f.f_wild = 1;
	    }
	}

	if (n < 0) {				// Reset newline status
	    n = 0;
	}
    }

    return f;
}

// Convert a number of spaces into a compressed run in library-format string
function LibRun (n) {
    var run = '';
    while (n > 32) {
	run += '~';
	n -= 32;
    }
    return run + (n ? (n > 1 ? String.fromCharCode (n-2+0x60) : ' ') : '');
}

// Convert binary pattern in any given orientation into library-format string
// NOTE: Patterns with dimensions larger than 65503 cannot be properly represented
// (but such are never in the database anyway, so search could never find them)
// 'wild' option generates unique strings that preserve wildcards (for Symm)
function Bin2Lib (f, start, dx, dy, width, height, wild) {
    var n = 0;			// Number of accumulated blanks
    var result = String.fromCharCode (Math.min (0xFFFF, height+0x20));
    result += String.fromCharCode (Math.min (0xFFFF, width+0x20));

    for (var y = 0; y < height; ++y, start += dy) {
	var i;
	for (var x = i = 0; x < width; ) {
	    var c = f.f_img[x++*dx+start];
	    if (wild) {
		result += c ? c<0 ? '?' : 'O' : ' ';
	    } else {
		i = 2*i + (c !== 0);
		if(! (x % 6)) {
		    if (i) {
			result += LibRun (n) + String.fromCharCode (i+0x20) ;
			i = n = 0;
		    } else {
			++n;
		    }
		}
	    }
	}
	if (wild) {
	    result += ';';
	} else if (x %= 6) {
	    if (i) {
		result += LibRun (n) + String.fromCharCode ((i << (6-x)) + 0x20);
		n = 0;
	    } else {
		++n;
	    }
	}
    }

    return result;
}

// Add accumulated RLE run to output strin. Line breaks are inserted as needed.
function RleWrite (line, n, c) {
    if (n) {
	var s = n > 1 ? '' + n + c : c;
	return line.length + s.length > 70 ? [line+'\n', s] : line + s;
    }
    return line;
}

// Draw a filled solid rectangle on a canvas
function DrawRect (ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect (x, y, w, h);
}

// Draw a filled solid circle on a canvas
function DrawCirc (ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath ();
    ctx.arc (x, y, r, 0, TAU, 0);
    ctx.fill ();
}

// Add a single cell to the image
function ImageCell (tr, ctx, f, x, y, m, net, c, p) {
    if (tr) {					// Add to table row
	var td = ReuseCell (tr, x);
	SetWidth (td, net);
	SetHeight (td, net);
	SetBg (td, c ? (c < 0 ? C_IMG_WILD : C_IMG_ALIVE) : C_BG);
	if (!p) {
	    SetBorderwidth (td, 0);
	}
    }

    if (f && x < f.f_wid && y < f.f_hgt) {	// Add to stamp field
	var i = y*f.f_wid + x;
	var d = c - f.f_img[i];
	f.f_maxp += d;
	f.f_minp += d;
	f.f_img[i] = c;
    }

    if (ctx && c) {				// Draw on canvas (live only)
	if (m < 0) {				// Stamp
	    p = 0;
	    if ((m = ~m) === 4) {
		++p;
	    }
	    DrawRect (ctx, x*m+p, y*m+p, m-p, m-p, C_STAMP_ALIVE);
	} else {				// Image
	    p *= 2;
	    x = m*x + p;
	    y = m*y + p;
	    m -= p;
	    if (m >= 6) {
		p = m/2;
		DrawCirc (ctx, x+p, y+p, m*3/8, c < 0 ? C_IMG_WILD : C_IMG_ALIVE);
	    } else {
		DrawRect (ctx, x, y, m, m, c < 0 ? C_IMG_WILD : C_IMG_ALIVE);
	    }
	}
    }
}

// Add a row of empty cells to the table image (not needed with canvas)
function ImageRow (tab, y, n, m, net, p) {
    var tr = ReuseRow (tab, y);
    for (var x = 0; x < n; ++x) {
	ImageCell (tr, null, null, x, y, m, net, 0, p);
    }
    TruncRow (tr, n);
}

// Export a library-format pattern (or a piece thereof) to screen or file
// (If p===null, field f is displayed insted)
// fmt: >=0: to text string, -1=on screen, ~m=draw stamp w/magnification m
// For browsers with HTML5 canvas support, a canvas is used to draw the image
// For earlier browers, a table is used instead (stamp is never drawn with tables)
// (NOTE: To avoid multi-minute waits for huge patterns, table display is
//  currently suppressed for patterns 80 cells and wider)
// pad is either 0 or 1, and must be zero unless fmt===-1.
//
// The following parameter combinations are currently used:
// (null, null, null, r, p, fmt, 0, 0, 0, comm):		Return pattern p as text/RLE/Life 1.06 string
// ('tabimg', null, null, r, p, X_IMAGE, pad, pad, pad, '')	Draw pattern p on table
// ('canimg', ctx, ctx, null, r, p, X_IMAGE, pad, pad, pad, '')	Draw pattern p on canvas
// (null, ctx, stampf, r, p, ~m, u+20/m, v+20/m, 0, ''):	Draw pattern p on stamp canvas*
// (Note that in all cases except the last one, replacing (null, r, p) by
//  (f, r, null) will use field f rather than pattern p.)
function Export (tab, ctx, f, r, p, fmt, lft, top, pad, comm) {
    var pat;					// Pattern image
    var i = 0;					// Index into library string
    var h;					// Height
    var w;					// Width
    var tr;					// Table row
    var field = !p;				// Display from field instead?

    if (field) {
	p = f;
	f = null;
	pat = p.f_img;
	w = p.f_rgt - p.f_lft;
	h = p.f_btm - p.f_top;
    } else {
	pat = p.p_img;
	if (typeof pat !== 'string') {		// Multiple images: draw first
	    pat = pat[0];
	}
	if (pat === ' \n') {			// Non-dead pattern is missing:
	    if (fmt === X_IMAGE) {		// It must be ridiculously huge
	       ShowB ('viewimg', false);	// (e.g. Gemini)
	       ShowB ('canimg', false);
	    }
	    return 'This pattern is too large to paste here.';
	}
	h = pat.charCodeAt (i++) - 0x20;
	w = pat.charCodeAt (i++) - 0x20;
	if (!w) {				// Very wide pattern
	    w = p.p_boxw;
	}
	if (!h) {				// Very tall pattern
	    h = p.p_boxh;
	}
    }

    var m = Math.max (w, h);			// Largest dimension
    if (m > LARGE) {				// Ignore really huge patterns
	w = h = 0;
    }

    m = Math.floor (638 / (m + 2*pad));		// Maximum magnification
    m = Math.max (1, Math.min (64, m));		// Net magnification
    if (fmt < X_IMAGE) {			// Stamps pre-select magnification
	m = fmt;
    }

    var q = m >= 5;			// Cells wide enough for grid?
    var img = (ctx || q) && fmt < 0;	// Display image?
    var net = m - 2*q;			// Net cell size
    var n = 0;				// Number of queued-up spaces
    var k;				// Next 6 bits
    var rlen = 0;			// # of RLE cells
    var rled = 0;			// # of RLE newlines
    var rlec = 'b';			// type of RLE cell
    var rlel = '';			// Line for outputing RLE or text
    var rlef = '';			// Entire file for outputing RLE or text

    if (img) {
	if (!ctx) {				// Table: size table
	    SetWidth (tab, m*(w+2*pad)+2);
	    if (pad) {				// draw top row of padding, if needed
		ImageRow (tab, 0, w+2, m, net, q);
	    }
	} else if (fmt === X_IMAGE) {		// Image: size canvas, and draw grid
	    SetWidth (tab, m*(w+2*pad)+2);
	    SetHeight (tab, m*(h+2*pad)+2);

	    // NOTE: This is a kludge, just for Opera 9 (and any other browsers
	    // that don't respect resizing of canvases under program control)
	    // that erases the whole initial canvas, in case any of it is still
	    // visible even though it shouldn't be. Sigh.
	    DrawRect (ctx, 0, 0, 640, 640, C_BG);

	    DrawRect (ctx, 0, 0, m*(w+2)+2, m*(h+2*pad)+2, C_BG);
	    if (q) {					// Draw grid lines
		for (var y = 0; y <= h+2; ++y) {	// Draw horizontal grid lines
		    DrawRect (ctx, 0, m*y, (m*(w+2*pad)+2), 2, C_IMG_GRID);
		}
		for (var x = 0; x <= w+2; ++x) {	// Draw vertical grid lines
		    DrawRect (ctx, m*x, 0, 2, (m*(h+2*pad)+2), C_IMG_GRID);
		}
	    }
	}
    }

    for (var y = 0; y < h; ++y) {
	if (img && !ctx) {			// Crate image table row
	    tr = ReuseRow (tab, y+1);
	    if (pad) {				// Left padding cell
		ImageCell (tr, ctx, f, 0, top+y, m, net, 0, q);
	    }
	}
	for (var x = 0; x < w; ++x, k <<= 1) {
	    var c;				// Cell value
	    if (field) {			// Display field rather than pattern
		c = pat[y*p.f_wid+x];
	    } else {
		if (x%6 === 0) {
		    if (n < 0) {		// Coasting on stored newline
			k = 0;
		    } else if (n) {		// Coasting on stored blanks
			--n;
			k = 0;
		    } else if (i >= pat.length) {	// End of pattern
			k = 0;
		    } else if ((k = pat.charCodeAt (i++) - 0x20) >= 0x40 || k < 0) {
			n = k-0x40+2 - 1;	// Blank run or newline
			k = 0;
		    }				// Otherwise, 6 bits of data
		}
		c = (k >> 5) & 1;		// Cell value
	    }

	    switch (fmt) {
	    case X_CELLS:			// Text cell
	    case X_LIFE105:			// Life 1.05 cell
		if (c) {			// Living Life 1.05 cell
		    for (; rlen; --rlen) {
			rlel += '.';
		    }
		    rlel += (c < 0 ? (fmt === X_LIFE105 ? '*' : 'O') : '?');
		} else {			// Dead Life 1.05 cell
		    ++rlen;
		}
		break;
	    case X_LIFE106:			// Life 1.06 cell
		if (c) {
		    rlef += (x-Math.floor(w/2)) + ' ' + (y-Math.floor(h/2)) + '\n';
		}
		break;
	    case X_RLE:				// RLE cell
		if (c) {			// Living RLE cell
		    if (rled) {
			rlel = RleWrite (rlel, rled, '$');
			rled = 0;
			if (typeof rlel !== 'string') {	// RLE line wrapped
			    rlef += rlel[0];
			    rlel = rlel[1];
			}
		    }
		}
		c = c ? (c < 0 ? '?' : 'o') : 'b';
		if (rlec != c) {
		    if (rlen) {
			rlel = RleWrite (rlel, rlen, rlec);
			rlen = 0;
		    }
		    rlec = c;
		}
		++rlen;
		if (typeof rlel !== 'string') {	// RLE line wrapped
		    rlef += rlel[0];
		    rlel = rlel[1];
		}
	    }
	    if (img) {				// Image cell
		ImageCell (tr, ctx, f, lft+x, top+y, m, net, c, q);
	    }
	}

	switch (fmt) {
	case X_CELLS:				// Text end of line
	case X_LIFE105:				// Life 1.05 end of line
	    rlef += rlel + '\n';
	    rlel = '';
	    rlen = 0;
	    break;
	case X_RLE:				// RLE end of line
	    if (rlen > 0 && rlec != 'b') {
		rlel = RleWrite (rlel, rlen, rlec);
	    }
	    rlen = 0;
	    ++rled;
	    if (typeof rlel !== 'string') {	// RLE line wrapped
		rlef += rlel[0];
		rlel = rlel[1];
	    }
	    break;
	}

	if (img && !ctx && pad) {
	    if (pad) {				// Draw right padding cell
		ImageCell (tr, ctx, f, lft+w, top+y, m, net, 0, q);
		TruncRow (tr, w+2*pad);
	    }
	}

	if (n < 0) {				// Reset newline status
	    n = 0;
	}
    }

    if (img && !ctx && pad) {			// Draw bottom row of padding
	ImageRow (tab, top+h, w+2, m, net, q);
    }

    switch (fmt) {
    case X_IMAGE:				// Display image, if any
	ShowB ('viewimg', !ctx && img);
	ShowB ('canimg', ctx && img);
	break;
    case X_CELLS:				// Text end of field
	rlef = ('\n'+comm).replace (/\n#[a-zA-Z]/gm, '\n!').substring (1) + rlef;
	break;
    case X_LIFE105:				// Life 1.05 end of field
	rlef = '#Life 1.05\n' + comm + rlef;
	break;
    case X_LIFE106:				// Life 1.06 end of field
	rlef = '#Life 1.06\n' + comm + rlef;
	break;
    case X_RLE:					// RLE end of field
	if (rlen > 0) {
	    rlel = RleWrite (rlel, rlen, 'o');
	    rlen = 0;
	    if (typeof rlel !== 'string') {	// RLE line wrapped
		rlef += rlel[0];
		rlel = rlel[1];
	    }
	}
	rlel = RleWrite (rlel, 1, '!');
	if (typeof rlel !== 'string') {		// RLE line wrapped
	    rlef += rlel[0];
	    rlel = rlel[1];
	}
	rlef = comm + 'x = ' + w + ', y = ' + h +
	  (rulerle[r] !== '' ? ', rule = ' + rulerle[r] : '') +
	  '\n' + rlef + rlel + '\n';
    }

    if (img && !ctx) {				// Truncate table
	TruncTable (tab, h+2*pad);
    }

    return rlef;
}

// Draw pattern image
function Image (f, r, p, pad)
{
    var tab = 'canimg';				// Canvas for result object image
    var ctx = GetContext (tab, '2d')		// Drawing context for image
    Export (ctx ? tab : 'tabimg', ctx, f, r, p, X_IMAGE, pad, pad, pad, '');
}



//------------------------------ UI display functions --------------------------

// Compute short symbolic name for a real number
// p=n: maximum n digits; p=_: unlimited digits; p=-1: ASCII unlimited digits
// p=-2: gliders; p=-n: rarity w/n-2 digits
// p<0 may also include user-generated numbers (that can include negatives)
function RealName (n, p, o) {
    if (isNaN (n)) {
	return p < -2 ? 'N/A' : 'Unknown';
    } else if (n === _) {
	return p < -1 ? 'Unknown' : (p >= 0 ? Uinf : 'Infinity');
    } else if (n === -_) {			// -_ never occurs internally
	return '-Infinity';
    } else if (n >= KNOWN && p === -2) {	// Glider numbers
	if (n >= UNKNOWN) {
	    n -= UNKNOWN;
	    p = 'Unknown';
	} else if (n >= TBD) {
	    n -= TBD;
	    p = 'TBD';
	} else {
	    n -= KNOWN;
	    p = 'KNOWN';
	}
	return n ? p + n : p;
    }

    if (p < 0) {
	p = p < -2 ? -p-2 : _;
    }

    if (n < 0) {
	return '-' + RealName (-n, p > 0 ? p-1 : p, o);
    }

    if (numfmt === Q_RAT) {			// Display as rational?
	var q = Rational (n, CT);
	if (q[1] !== 1) {			// n/1 => 1
	    q = RatName (q[0], q[1], p, false, o);
	    if (q) {
		return q;
	    }
	}
    }

    var s = ordnames[3+o];			// Suffix based on order
    if (n === 1 && o > 0) {			// reduce 1t to just t
	return s;
    }
    p -= s.length;

    if (p < _) {				// Constrain to p characters
	var l = n <= 0 ? 0 : Math.floor (Math.log (n) / Math.LN10);
	if (l < -3) {				// Small scientific notation
	    l = -l;
	    return RealName (n * Math.pow (10, l), p-3-(l>9)-(l>99), 0) + 'e-' + l + s;
	} else if (l+1 < p) {			// Room for decimals
	    l = Math.pow (10, p-l-1);
	    n = Math.round (n * l) / l;
	} else if (l+1 === p) {			// Integer will fit exactly
	    n = Math.round (n)
	} else {				// Large scientific notation
	    return RealName (n / Math.pow (10, l-1), p-2-(l>9)-(l>99), 0) + 'e' + l + s;
	}
    }
    return '' + n + s;
}

// Display a rational number. Numerator and denominator are nonnegative integers,
// including _ or NaN, but not necessarily in lowest terms
// By convention, n/NaN is treated as 0
function RatName (n, d, p, realok, o) {
    if (n === d) {				// n/n, 0/0, _/_ => 1
	return '1';
    } else if (numfmt === Q_RAT && !isNaN (n) && !isNaN (d) &&
      n !== _ && d !== _ && n !== 0 && d !== 1) {
	var g = GCD (n, d, CT);
	n = n == 1 && o > 0 ? ordnames[3+o] : RealName (n/g, p, Math.max (o, 0));
	d = n == 1 && o < 0 ? ordnames[3-o] : RealName (d/g, p, Math.max (-o, 0));
	var x = n.length
	var y = d.length

	if (x+y < p) {			// n/p
	    return n + '/' + d;
	} else if (x < p) {		// n/ p
	    return n + '/ ' + d;
	} else if (y < p) {		// n /p
	    return n + ' /' + d;
	} else if (x <= p && y <= p) {	// n / p
	    return n + ' / ' + d;
	}				// too large: use scientific notation
    }
    return realok ? RealName (n === 0 ? 0 : (isNaN (d) && !isNaN (n) ? 0 : n/d), p, o) : undefined;
}

// Add a cell to the object list table
// hdr: 0=normal, n+1=table heading, -1=wide rule subheading
// NOTE: When reusing a cell, this can reuse an URL if one was there before,
// but can't add a new one, or remove an old one
function AddCell (tr, x, txt, url, bold, hdr, w, span, sort, col) {
    var old = x < GetCells (tr).length;		// Reusing old cell?
    var td = ReuseCell (tr, x);			// New table cell
    SetWidth (td, w);
    SetFontWeight (td, bold ? 'bold' : '');	// Set boldface
    SetColSpan (td, span);			// Set number of columns
    SetBg (td, col);				// Set background color

    if (hdr > 0) {				// Heading: Sort buttons
	url = 'javascript:Column(' + sort + ',' +
	  (sort === defsort ? -sortdir : 1) + ')';
    }

    if (old) {					// Reusing old cell
	SetText (td, txt);
	if (url) {				// Add URL, if necessary
	    SetHref (td, url);
	}
    } else {					// Populating new cell
	if (url) {				// Add URL, if necessary
	    var a = document.createElement ('a');
	    SetClass (a, 'j');
	    SetHref (a, url);
	    td.appendChild (a);
	    td = a;
	}
	td.appendChild (document.createTextNode (txt));
    }

    return td;
}

// Add a row to the object list table
// hdr: 0=normal, 1=table heading, -1=wide rule subheading, -2=wide comment
function AddRow (tab, y, p, url, bold, hdr, col, r, rmod, vel, symm, glide) {
    var tr = ReuseRow (tab, y);			// New table row
    var x = 0;
    var i;

    if (hdr || GetCells (tr).length === 1) {	// ALWAYS refresh header's URLs
	TruncRow (tr, 0);			// ALWAYS recycle sub-header
    }

    if (hdr >= 0) {				// Data line
	TruncRow (tr, rviscol);
	if (viscol[S_MINP]) {
	    AddCell (tr, x++, typeof p.p_minp === 'string' ? p.p_minp :
	      RealName (p.p_minp, 7, 0), '', bold, hdr, 56, 1, S_MINP, C_BG);
	}
	if (viscol[S_AVGP]) {
	    AddCell (tr, x++, typeof p.p_avgp === 'string' ? p.p_avgp :
	      OrderName (p.p_avgp, p.p_per, 7), '', bold, hdr, 56, 1, S_AVGP, C_BG);
	}
	if (viscol[S_MAXP]) {
	    AddCell (tr, x++, typeof p.p_maxp === 'string' ? p.p_maxp :
	      OrderName (p.p_maxp, p.p_per, 7), '', bold, hdr, 56, 1, S_MAXP, C_BG);
	}
	if (viscol[S_RPOP]) {
	    AddCell (tr, x++, typeof p.p_rpop === 'string' ? p.p_rpop :
	      RatOrderName (p.p_minp, p.p_maxp, p.p_per, 7), '', bold, hdr, 56, 1, S_RPOP, C_BG);
	}
	if (viscol[S_INF]) {
	    AddCell (tr, x++, typeof p.p_inf === 'string' ? p.p_inf:
	      OrderName (p.p_inf, p.p_per, 7), '', bold, hdr, 56, 1, S_INF, C_BG);
	}
	if (viscol[S_DEN]) {
	    AddCell (tr, x++, typeof p.p_den === 'string' ? p.p_den:
	      RatOrderName (p.p_minp, p.p_inf, p.p_per, 7), '', bold, hdr, 56, 1, S_DEN, C_BG);
	}
	if (viscol[S_ADEN]) {
	    AddCell (tr, x++, typeof p.p_aden === 'string' ? p.p_aden:
	      RatOrderName (p.p_avgp, p.p_inf, p.p_per, 7), '', bold, hdr, 56, 1, S_ADEN, C_BG);
	}
	if (viscol[S_MDEN]) {
	    AddCell (tr, x++, typeof p.p_mden === 'string' ? p.p_mden:
	      RatOrderName (p.p_maxp, p.p_inf, p.p_per, 7), '', bold, hdr, 56, 1, S_MDEN, C_BG);
	}
	if (viscol[S_HEAT]) {
	    AddCell (tr, x++, typeof p.p_heat === 'string' ? p.p_heat :
	      OrderName (p.p_heat, p.p_per, 7), '', bold, hdr, 56, 1, S_HEAT, C_BG);
	}
	if (viscol[S_TEMP]) {
	    AddCell (tr, x++, typeof p.p_temp === 'string' ? p.p_temp :
	      RealName (p.p_temp, 7, 0), '', bold, hdr, 56, 1, S_TEMP, C_BG);
	}
	if (viscol[S_VOL]) {
	    AddCell (tr, x++, typeof p.p_vol === 'string' ? p.p_vol :
	      RealName (p.p_vol, 7, 0), '', bold, hdr, 56, 1, S_VOL, C_BG);
	}
	if (viscol[S_SVOL]) {
	    AddCell (tr, x++, typeof p.p_svol === 'string' ? p.p_svol :
	      RealName (p.p_svol, 7, 0), '', bold, hdr, 56, 1, S_SVOL, C_BG);
	}
	if (viscol[S_RVOL]) {
	    AddCell (tr, x++, typeof p.p_rvol === 'string' ? p.p_rvol :
	      RatName (p.p_svol, p.p_vol, 7, true, 0), '', bold, hdr, 56, 1, S_RVOL, C_BG);
	}
	if (viscol[S_SYMM]) {
	    AddCell (tr, x++, typeof p.p_symm === 'string' ? p.p_symm :
	      symm, '', bold, hdr, 56, 1, S_SYMM, C_BG);
	}
	if (viscol[S_GLIDE]) {
	    AddCell (tr, x++, typeof p.p_glide === 'string' ? p.p_glide :
	      glide, '', bold, hdr, 56, 1, S_GLIDE, C_BG);
	}
	if (viscol[S_BOX]) {
	    AddCell (tr, x++, typeof p.p_boxw === 'string' ? p.p_boxw :
	      BoxName (p.p_boxw, p.p_boxh, p.p_per, 7), '', bold, hdr, 56, 1, S_BOX, C_BG);
	}
	if (viscol[S_SQB]) {
	    AddCell (tr, x++, typeof p.p_sqb === 'string' ? p.p_sqb :
	      RatName (p.p_boxh, p.p_boxw, 7, true, 0), '', bold, hdr, 56, 1, S_SQB, C_BG);
	}
	if (viscol[S_HULL]) {
	    AddCell (tr, x++, typeof p.p_hullw === 'string' ? p.p_hullw :
	      BoxName (p.p_hullw, p.p_hullh, p.p_per, 7), '', bold, hdr, 56, 1, S_HULL, C_BG);
	}
	if (viscol[S_SQH]) {
	    AddCell (tr, x++, typeof p.p_sqh === 'string' ? p.p_sqh :
	      RatOrderName (p.p_hullh, p.p_hullw, p.p_per, 7), '', bold, hdr, 56, 1, S_SQH, C_BG);
	}
	if (viscol[S_PER]) {
	    i = RealName (p.p_per, 7, 0)
	    AddCell (tr, x++, typeof p.p_per === 'string' ? p.p_per :
	      i + (rmod!==1 ? (i.length>3?' ':'') + '(/'+rmod+')' : ''),
	      '', bold, hdr, 56, 1, S_PER, C_BG);
	}
	if (viscol[S_MOD]) {
	    AddCell (tr, x++, typeof p.p_mod === 'string' ? p.p_mod :
	      RealName (p.p_per/rmod, 7, 0), '', bold, hdr, 56, 1, S_MOD, C_BG);
	}
	if (viscol[S_RMOD]) {
	    AddCell (tr, x++, typeof p.p_rmod === 'string' ? p.p_rmod :
	      ''+rmod, '', bold, hdr, 56, 1, S_RMOD, C_BG);
	}
	if (viscol[S_VEL]) {
	    AddCell (tr, x++, typeof p.p_veld === 'string' ? p.p_veld :
	      vel, '', bold, hdr, 56, 1, S_VEL, C_BG);
	}
	if (viscol[S_GLS]) {
	    var td = AddCell (tr, x++, typeof p.p_gls === 'string' ? p.p_gls :
	      GlsName (p.p_gls, 'Known', 'TBD'),
	      '', bold, hdr, 56, 1, S_GLS, col);
	}
	if (viscol[S_RGLS]) {
	    AddCell (tr, x++, typeof p.p_rgls === 'string' ? p.p_rgls :
	      (p.p_gls >= KNOWN ?
		GlsName (Math.floor (p.p_gls/KNOWN)*KNOWN, 'Known', 'TBD') :
		RatName (p.p_GetGls (), p.p_minp, 7, true, 0)),
	      '', bold, hdr, 56, 1, S_RGLS, C_BG);
	}
	if (viscol[S_FREQ]) {
	    AddCell (tr, x++, typeof p.p_freq === 'string' ? p.p_freq :
	      RealName (p.p_freq/FREQBASE, -9, 0), '', bold, hdr, 56, 1, S_FREQ, C_BG);
	}
	if (viscol[S_RAR]) {
	    AddCell (tr, x++, typeof p.p_freq === 'string' ? p.p_rar :
	      RealName (FREQBASE/p.p_freq, -9, 0), '', bold, hdr, 56, 1, S_RAR, C_BG);
	}
	if (viscol[S_TTS]) {
	    AddCell (tr, x++, typeof p.p_tts === 'string' ? p.p_tts :
	      RealName (p.p_tts, 7, 0), '', bold, hdr, 56, 1, S_TTS, C_BG);
	}
	if (viscol[S_EF]) {
	    AddCell (tr, x++, typeof p.p_tts === 'string' ? p.p_ef :
	      RealName (p.p_GetEf (), 7, 0), '', bold, hdr, 56, 1, S_EF, C_BG);
	}
	if (viscol[S_CAT]) {
	    AddCell (tr, x++, typeof p.p_cat === 'string' ? p.p_cat :
	      catabbrs[rulelib[r][p.p_hdr].h_cid], '', bold, hdr, 56, 1, S_CAT, C_BG);
	}
	if (viscol[S_FILE]) {
	    AddCell (tr, x++, p.p_GetFiles (),
	      '', bold, hdr, 56, 1, S_FILE, C_BG);
	}
	p = p.p_GetNames ();
	col = C_BG;
    }						// One-element header line

    AddCell (tr, x, p, url, bold, hdr,
      Math.max (637-60*x, 60), nviscol-x, S_NAME, col);
    return tr;
}

// View one of several search result classes
function View (index) {
    state = index;

    if (state < Z_HUGE) {
	ShowB ('viewprop', false);
	ShowB ('viewimg', false);
	ShowB ('canimg', false);
    }

    if (state < Z_MANY) {
	ShowB ('viewscroll', false);
	ShowB ('viewscroll2', false);
	ShowB ('viewstamp', false);
	ShowB ('viewtab', false);
	ShowR ('viewname', false);
	ShowR ('viewalt', false);
	ShowR ('viewbar', false);
	ShowR ('viewcol', false);
	ShowR ('viewinf', false);
	ShowR ('viewden', false);
	ShowR ('viewhull', false);
	ShowR ('viewcat', false);
	ShowR ('viewgls', false);
	ShowR ('viewheat', false);
	ShowR ('viewper', false);
	ShowR ('viewrar', false);
	ShowR ('viewtemp', false);
	ShowR ('viewvel', false);
	ShowR ('viewvol', false);
	ShowI ('gobits', false);
	ShowI ('txtpop', true);
    }

    ShowI ('progsearch', false);

    var a = state >= Z_NONE && selectb !== null;	// properties shown for all
    ShowR ('viewsize', a);
    ShowR ('viewbox', a);
    ShowR ('viewsymm', a);
}

// Convert one or more real numbers into a text string
function RealNames (n, p, m) {
    if (typeof n !== 'number') {	// List of numbers
	var c = m === M_EQ ? ' or ' : ' and ';
	var a = '';
	for (var i = 0; i < n.length; ++i) {
	    a += c + RealName (n[i], p, 0);
	}
	return a.substring (c.length);
    } else {
	return RealName (n, p, 0);
    }
}

// Convert one or more rational velocities into a text string
function VelNames (n, d, m) {
    var c = m === M_EQ ? ' or ' : ' and ';
    var a = '';

    if (typeof n !== 'number') {		// List of numerators
	for (var i = 0; i < n.length; ++i) {
	    a += c + VelNames (n[i], d, m);
	}
	return a.substring (c.length);
    } else if (typeof d !== 'number') {		// List of denominators
	for (var i = 0; i < d.length; ++i) {
	    a += c + VelNames (n, d[i], m);
	}
	return a.substring (c.length);
    } else {
	return RatName (n, d, _, true, 4);
    }
}

// Convert an object's velocity into a user-readable text string
function VelName (p, o, d, k) {
    var v = 'c';
    if (p.p_vely === 0) {
	if (p.p_velx > 1) {
	    v = '' + p.p_velx + v;
	}
	v = o + v;
    } else if (p.p_velx === p.p_vely) {
	if (p.p_velx > 1) {
	    v = '' + p.p_velx + v;
	}
	v = d + v;
    } else {
	v = k + '(' + p.p_velx + ',' + p.p_vely + ')' + v;
    }
    if (p.p_veld > 1) {
	v += '/' + p.p_veld;
    }
    return v;
}

// Display a (possibly transfinite) number in terms of order of magnitude
function OrderName (x, q, p) {
    x = OrderPair (x, q);
    var o = x[1] >> 1;
    return x[1]&1 ? 'Unknown' : RealName (x[0], p, o);
}

// Display a (possibly transfinite) rational number in terms of order of magnitude
function RatOrderName (n, d, q, p) {
    n = OrderPair (n, q);
    d = OrderPair (d, q);
    var o = (n[1] >> 1) - (d[1] >> 1) - (d[1] & ~n[1] & 1);
    return (n[1]|d[1])&1 ? 'Unknown' : RatName (n[0], d[0], p, true, o);
}

// Compute symbolic name for an integer, or integer range (for gliders)
// A range x-y is indicated x+y/PAIR
function IntName (r) {
    var i = Math.floor (r);
    return '' + i + (i !== r ? -Lowpart (r) : '');
}

// Compute symbolic name for a number or range of gliders
function GlsName (g, known, tbd) {
    if (g === KNOWN) {			// Synthesis exists but not yet attempted
	return known;
    } else if (g === TBD) {		// Synthesis not yet attempted
	return tbd;
    } else if (g === UNKNOWN) {		// Unknown synthesis
	return 'x';
    } else if (g > UNKNOWN) {		// Partial synthesis
	return 'x+' + IntName (g - UNKNOWN);
    } else {				// Known gliders
	return IntName (g);
    }
}

// Set rule, and display its associated fields
function SetRule (r) {
    selectr = r;
    var i = rulepage[r];
    SetText ('gorule', rulenames[r]);
    SetText ('txtunk', rulenames[r]);
    SetHref ('gorule', i + '.htm');
    ShowI ('gorule', i !== '');
    ShowI ('txtunk', i === '');
}

// Display search results to HTML user interface
function Display (r, p) {
    var cat = '';				// Category
    var sec = '';				// Section
    var sub = '';				// Subsection
    var n = NaN;				// Section number (numeric)
    var page = Math.floor (p.p_page) - 1;	// Page number+1 for huge lists
    var gpage = Lowpart (p.p_page) - 1;		// Glider page number+1
    var alt = '';				// alternative file name
    var file = p.p_file;			// file name
    var name = p.p_GetNames ();			// Pattern description(s)
    var g = p.p_GetGls ();			// Gliders (integer)
    var rmod = Math.max (1, p.p_GetRmod ());	// Population/modulus
    var own = false;				// Sub-category has own page
    var i;
    var h = null;				// Header structure

    if (p.p_hdr >= 0) {
	h = rulelib[r][p.p_hdr];
	sec = h.h_sec;				// Section
	sub = h.h_sub;				// Subsection
	cat = h.h_cat;				// Category
	n = parseInt (sub);			// Subection number (usually population)
	if (sub !== ''+n) {			// Treat semi-numeric subsection as non-numeric
	    n = NaN;
	}
	if ((i = In (ownsec, sec)) >= 0) {	// Subsections that have their own pages
	    own = ownlo[i] <= p.p_minp && p.p_minp <= ownhi[i];
	}
    }

    selectb = p;				// Remember current selection
    SetRule (r);
    View (Z_RESULT);				// View results

    var html = sec;		// HTML file (usually = section )
    var dir = sub;		// Pattern directory (usually = subsection)
    var ownSect = sec+'-'+sub;	// 'own' section
    var ownPage = page;		// Page number on 'own' page

    if (!isNaN (n)) {
	if (n < 10) {		// All patterns below 10 bits are in one bucket
	    dir = '0';
	} else if (n >= 26) {	// All patterns 26+ bits are in one bucket
	    n = 26;
	    dir = 'lg';
	}
    }

    if (h && (h.h_cid >= O_SS && h.h_cid <= O_BR)) {
	dir = 'ss';		// Moving and growing objects are kept in ss
    }

    var adir = dir;			// alternate directory

    if (typeof file !== 'string') {	// Multiple files
	alt = file[1];
	file = file[0];
	i = parseInt (alt);
	if (!isNaN (i)) {
	    if (i < 10) {		// All sizes below 10 bits are in one bucket
		adir = '0';
	    } else if (i >= 26) {	// All sizes 26+ bits are in one bucket
		i = 26;
		adir = 'lg';
	    } else {			// All sizes from 10-25 bits have own buckets
		adir = '' + i;
	    }
	}
    }

    var cfile = file;			// Color file name suffix
    if (cfile.length === 8) {		// 3 long color files: 16blocks=>c16blocs;
	cfile = cfile.replace (/k/g, '');	// 18cutbk1=>c18cutb1; 20bqbbk1=>c20bqbb1;
    }

    var gls = GlsName (p.p_gls, 'Known', 'TBD');	// Gliders (string)
    var gQual = '' + g;			// 'Gliders' section qualifier

    if (p.p_minp === 0) {		// Treat death simply
	gQual = '';
    } else if (g >= UNKNOWN) {		// Unknown synthesis
	gQual = 'u';
    } else if (g >= KNOWN) {		// Synthesis not yet attempted
	gQual = '';
    } else if (g > p.p_minp) {		// Synthesis requires > 1 glider/bit
	gQual = 'g';
	gls += ' (>1 glider/bit)';
    } else if (g === p.p_minp) {	// Synthesis requires 1 glider/bit
	gQual = 'e';
	gls += ' (1 glider/bit)';
    } else if (g > 6) {			// Only 2-6 gliders are listed
	gQual = '';
    }

    if (sub === 'bad') {		// Never include bad objects
	gQual = '';
    } else if (g >= 2 && g <= 6) {	// Always include cheap objects
    } else if (sub === 'lg') {		// Never include large objects
	gQual = '';
    } else if (g >= UNKNOWN) {		// Include all explicit unknown objects
    } else if (sec === 'p8' || sec === 'p10') {	// Include P8s+P10s up to 25 bits
    } else if (p.p_minp > 21 ||		// Exclude all objects over 21 bits
      sec === 'p1' && p.p_minp > 15 || sec === 'pp1' && p.p_minp > 16 ||
      sec === 'p2' && p.p_minp > 18 || sec === 'pp2' && p.p_minp > 17) {
	gQual = '';			// Some sections have lower limits
    }

    var vels = VelName (p, 'Orthogonal ', 'Diagonal ', 'Oblique ');	// user-readable velocity

    var common = false;			// Is this of a common period?
    if (h && !isNaN (h.h_per)) {
	if (In (periods, p.p_per) >= 0) {	// Common periods have own pages
	    common = true;
	} else if (r === R_LIFE) {	// Others are all on one page (in Life)
	    html = 'period';
	    sub = 'osc';
	}
    }

    if (r === R_NIEMIEC0) {		// Niemiec0 rule is on Niemiec1 page
	sec = 'v0';
    }

    if (r === R_LIFE && sec === 'ws') {	// Wickstretchers are under puffers
	html = 'puff';
    }

    if (r === R_LIFE && sec === 'ss') {	// Differentiate spaceship groups
	html = 'flotilla';
	if (!isNaN (n)) {		// ss-2..4, ss-37 etc. are flotillae
	    if (n >= 5 && n <= 25) {	// ss-5..25 are small spaceships
		html = 'ss';
	    }
	} else if (parseInt (sub.charAt (sub.length-1)) || sub === 'gemini') {
	    html = 'exotic';		// ss-[<n>][o|d]<d>: exotic spaceships
	    gQual = '';			// All large, so never on glider pages
	}				// ss-<digit>[<letter>]: flotilla
    }

    if (ownSect.length >= 6 && page >= 10) {	// pp1-16-10 => pp1-16-a, etc.
	ownPage = String.fromCharCode (page-10+0x61);
    } else if (page >= 100) {			// 2-digit page number?
	ownPage = (page + '').substring (1);	// e.g. p1-16-01
    }

    var type = rulepage[r];			// URL to type page

    if (r !== R_LIFE) {				// Alternate-rule sub-section
	type = type + '.htm#' + rulesec[r] + '-' + sec;
    } else if (page >= 0) {			// Life group on separate page
	type = ownSect + '.htm#' + ownSect + '-' + ownPage;
    } else {					// Life sub-section
	type = html + '.htm#' + sec + '-' + sub;
    }

    var gtSect = 'g' + gQual + '-' + sec;

    SetBg ('colgl', GlColors (g, p.p_minp, C_BG));

    i = p.p_GetFlags ();
    var j = '';
    if (i & 0x01) {
	j = j + ', Flip-flop';
    }
    if (i & 0x02) {
	j = j + ', On-off';
    }
    if (i & 0x04) {
	j = j + ', Phoenix';
    }
    if (i & 0x08) {
	j = j + ', Babbling brook';
    }
    if (i & 0x10) {
	j = j + ', Mutering moat';
    }
    SetText ('txtosc', j.length ? '(' + j.substring (2) + ')' : '');

    i = p.p_GetGlide ();
    SetText ('txtsymm', symmnames[p.p_GetSymm ()] +
      (i !== Y_N ? (' (glide symmetry: '+symmnames[i])+')' : ''));
    SetText ('gorle', name);
    SetText ('txtwip', name);
    SetText ('gobits', RealName (p.p_minp, _, 0));
    SetText ('txtpop', RealName (p.p_minp, _, 0));
    SetText ('txtmaxp', p.p_maxp && p.p_maxp !== p.p_minp ?
      '(average: ' + OrderName (p.p_avgp, p.p_per, _) + '; maximum: ' +
      OrderName (p.p_maxp, p.p_per, _) + '; min/max: ' +
      RatOrderName (p.p_minp, p.p_maxp, p.p_per, _) + ')' : '');
    SetText ('txtinf', OrderName (p.p_inf, p.p_per, _));
    SetText ('txtden', RatOrderName (p.p_minp, p.p_inf, p.p_per, _) +
      (p.p_maxp && p.p_minp !== p.p_maxp ? ' (average: ' + RatOrderName (p.p_avgp, p.p_inf, p.p_per, _) +
      '; maximum: ' + RatOrderName (p.p_maxp, p.p_inf, p.p_per, _) + ')' : ''));
    SetText ('txtbox', RealName (p.p_boxw, _, 0) + ' x ' + RealName (p.p_boxh, _, 0) +
      ' (Squareness: ' + RatName (p.p_boxh, p.p_boxw, _, true, 0) + ')');
    SetText ('txthull', OrderName (p.p_hullw, p.p_per, _) + ' x ' +
      OrderName (p.p_hullh, p.p_per, _) +
      (p.p_img === ' \n' ? '+' : '') + ' (Squareness: ' +
      (RatOrderName (p.p_hullh, p.p_hullw, p.p_per, _)) + ')');
    SetText ('txtheat', OrderName (p.p_heat, p.p_per, _));
    SetText ('txttemp', RealName (p.p_temp, _, 0));
    SetText ('txtvol', RealName (p.p_vol, _, 0) + (p.p_vol !== p.p_svol ?
      ' (strict: ' + RealName (p.p_svol, _, 0) + '; strict/volatility: ' +
      RatName (p.p_svol, p.p_vol, _, true, 0) + ')' : ''));
    SetText ('gocat', cat);
    SetText ('txtcat', cat);
    SetText ('goalt', sec === 'meth' ? 'Run methuselah' :
	(p.p_per === 30 ? 'How it eats gliders' : 'View alternate synthesis'));
    SetText ('txtper', '' + RealName (p.p_per, _, 0) +
      (rmod !== 1 ? ' (mod ' + RealName (p.p_per/rmod, _, 0) + ')' : ''));
    SetText ('txtvel', vels);
    SetText ('gogl', gls);
    SetText ('txtg', gls);
    SetText ('gorar', RealName (p.p_freq/FREQBASE, -11, 0) +
      ' (rarity: ' + RealName (FREQBASE/p.p_freq, -11, 0) + ')');
    SetText ('gotts', RealName (p.p_tts, _, 0) +
      ' (evolutionary factor: ' + RealName (p.p_GetEf (), _, 0) + ')');

    SetHref ('gocat', type);
    SetHref ('gobits', 'bits-' + sub + '.htm#' + sec + '-' + sub);
    SetHref ('gogl', gpage >= 0 ? gtSect + '.htm#' + gtSect + '-' + gpage :
      'glider-' + gQual + '.htm#g' + gQual + '-' + sec);
    SetHref ('gorar', 'natural.htm#nat-' + sec);
    SetHref ('gorle', (r !== R_LIFE ? rulepage[r] : dir) + '/' + file + '.rle');
    SetHref ('goalt', (r !== R_LIFE ? rulepage[r] : adir) + '/' + alt + '.rle');
    SetHref ('gocol', 'color.htm#c-' +
      (p.p_per > 1 && !p.p_velx && sec.charAt (0) === 'p' ? 'osc' : sec));
    SetHref ('gocrle', 'color/c' + cfile + '.rle');
    var viewdiff = p.p_minp > 15 && p.p_diff !== undefined;
    if (viewdiff) {
	SetHref ('godiff', 'p1-'+p.p_minp+'.htm#p1-'+p.p_minp+'-'+
	  String.fromCharCode (0x60+Math.max (1, Math.floor (p.p_diff/100))));
    }

    ShowB ('viewprop', true);
    ShowR ('viewbar', false);
    ShowR ('viewname', name.length !== 0);
    ShowR ('viewalt', alt !== '');
    ShowR ('viewcol', r === R_LIFE && In (colobj, file) >= 0);
    ShowR ('viewinf', true);
    ShowR ('viewden', true);
    ShowR ('viewhull', !isNaN (OrderNum (p.p_hullw)));
    ShowR ('viewsymm', p.p_GetSymm () !== Y_ANY);
    ShowR ('viewcat', cat !== '');
    ShowR ('viewgls', !isNaN (g));
    i = p.p_per > 1 || p.p_velx > 0;
    ShowR ('viewheat', !isNaN (OrderNum (p.p_heat)) && i);
    ShowR ('viewper', p.p_per > 0);
    ShowR ('viewrar', !isNaN (p.p_freq) && p.p_freq !== 0);
    ShowR ('viewtts', !isNaN (p.p_tts) && p.p_tts !== 0);
    ShowR ('viewtemp', !isNaN (p.p_temp) && i);
    ShowR ('viewvel', !isNaN (p.p_velx) && p.p_velx > 0);
    ShowR ('viewvol', !isNaN (p.p_vol) && i);

    ShowI ('gorle', i = file !== '' && file !== 'Unknown');
    ShowI ('txtwip', !i);		// Work in progress: no synthesis yet!
    ShowI ('gocat', i |= g < UNKNOWN);
    ShowI ('txtcat', !i && p.p_hdr >= 0);
    ShowI ('gobits', i = r === R_LIFE && p.p_hdr >= 0 && p.p_minp > 0 && !own &&
	(p.p_minp <= (sec === 'p1' ? 29 : 25) || common || sec === 'con' || sub === 'bad'));
    ShowI ('txtpop', !i);
    ShowI ('txtdiff', viewdiff);
    ShowI ('gogl', i = r === R_LIFE && gQual !== '');
    ShowI ('txtg', !i);

    GreyText ('inpaste', true);			// Can now paste pattern
    GreyText ('colpaste', true);
}



//------------------------------ Search functions ------------------------------

// Constrain search based on velocity parameters
function SrchVel (velx, vely, veld) {
    if (srch.s_vels !== M_ANY) {
	if (!MatchNum (velx, veld,
	  srch.s_vels, srch.s_velx, srch.s_vely, srch.s_veld, 0)) {
	    return false;
	}
	if (velx) {			// Direction irrelevant if stationary
	    switch (srch.s_velo) {	// Constrain by direction:
	    default:			// huh?
		return false;
	    case D_ANY:			// Any
		break;
	    case D_ORTHO:		// Orthogonal
		if (vely !== 0) {
		    return false;
		}
		break;
	    case D_DIAG:		// Diagonal
		if (vely !== velx) {
		    return false;
		}
		break;
	    case D_OBLIQUE:		// Oblique
		if (vely === 0 || vely === velx) {
		    return false;
		}
		break;
	    }
	}
    }
    return true;
}

// Filter entire sections of simple Life objects
// (i.e. still-lifes, pseudo-still-lifes, oscillators, pseudo-oscillators),
// based on period, population, velocity constraints
// Furthermore, still-lifes and pseudo-still-lifes are filtered based on
// heat=temperature=volatility=strict volatility=0,
// modulus=period/modulus=relative_volatility=1;
// Also, pseudo-still-lifes and pseudo-oscillators are filtered based on rarity
// This is only done for these categories, and only in Life, as these are the
// the easiest to check for, and these account for around 93% of the database.
function MatchOsc (h) {
    if (h.h_per) {
	if (srch.s_pers !== M_ANY && !MatchNum (h.h_per, 1,
	  srch.s_pers, srch.s_perx, srch.s_pery, 1, 0)) {
	    return false;			// Filter by period
	}

	if (h.h_minp) {
	    if (srch.s_minps !== M_ANY && !MatchNum (h.h_minp, 1,
	      srch.s_minps, srch.s_minpx, srch.s_minpy, 1, 0)) {
		return false;			// Filter by minimum population
	    }
	}

	if (h.h_per === 1) {			// Still-lifes are totally still
	    if (h.h_minp) {
		if (srch.s_avgps !== M_ANY && !MatchNum (h.h_minp, 1,
		  srch.s_avgps, srch.s_avgpx, srch.s_avgpy, 1, 0)) {
		    return false;		// Filter by average population
		}
		if (srch.s_maxps !== M_ANY && !MatchNum (h.h_minp, 1,
		  srch.s_maxps, srch.s_maxpx, srch.s_maxpy, 1, 0)) {
		    return false;		// Filter by maximum population
		}
	    }
	    if (srch.s_rpops !== M_ANY && !MatchNum (1, 1,
	      srch.s_rpops, srch.s_rpopx, srch.s_rpopy, 1, 0)) {
		return false;			// Filter by min/max population ratio
	    }
	    if (srch.s_glides !== Y_ANY && !MatchGlide (0, srch.s_glides)) {
		return false;			// Filter by glide symmetry
	    }
	    if (! (1 & srch.s_rmods)) {
		return false;			// Filter by period/modulus
	    }
	    if (srch.s_mods !== M_ANY && !MatchNum (1, 1,
	      srch.s_mods, srch.s_modx, srch.s_mody, 1, 0)) {
		return false;			// Filter by modulus
	    }
	    if (srch.s_heats !== M_ANY && !MatchNum (0, 1,
	      srch.s_heats, srch.s_heatx, srch.s_heaty, 1, 0)) {
		return false;			// Filter by heat
	    }
	    if (srch.s_temps !== M_ANY && !MatchNum (0, 1,
	      srch.s_temps, srch.s_tempx, srch.s_tempy, 1, 0)) {
		return false;			// Filter by temperature
	    }
	    if (srch.s_vols !== M_ANY && !MatchNum (0, 1,
	      srch.s_vols, srch.s_volx, srch.s_voly, 1, 0)) {
		return false;			// Filter by volatility
	    }
	    if (srch.s_svols !== M_ANY && !MatchNum (0, 1,
	      srch.s_svols, srch.s_svolx, srch.s_svoly, 1, 0)) {
		return false;			// Filter by strict volatility
	    }
	    if (srch.s_rvols !== M_ANY && !MatchNum (0, 1,
	      srch.s_rvols, 0, 0, 1, 0)) {
		return false;			// Filter by relative volatility
	    }
	    if (srch.s_img && srch.s_still === 0) {	// Filter out non-still images
		return false;
	    }
	} else {				// Oscillators are not still
	    if (srch.s_still === 1) {		// Filter out still images
		return false;
	    }
	}

	return SrchVel (0, 0, 1);		// These objects never move
    }

    return true;
}

// Match pattern with wildcard archetype in one position
function MatchWild0 (p, x, y, f, w, h, ox, oy, dxx, dxy, dyx, dyy) {
    for (var j = -h-1; j <= h+y; ++j) {
	for (var i = -w-1; i <= w+x; ++i) {
	    var c = f.f_GetCell (ox + i*dxx + j*dxy, oy + i*dyx + j*dyy);
	    var k = i < 0 || i >= x || j < 0 || j >= y ? 0 : p[j*x+i];
	    if (c >= 0 && c !== k) {
		return false;
	    }
	}
    }

    return true;
}

// Match pattern with wildcard archetype in all positions
function MatchWild1 (p, x, y, f, w, h, ox, oy, dxx, dxy, dyx, dyy) {
    if (w < 0 || h < 0) {
	return false;
    }

    for (var j = -h; j <= h; ++j) {
	for (var i = -w; i <= w; ++i) {
	    if (MatchWild0 (p, x, y, f, w, h,
	      ox+i*dxx+j*dxy, oy+i*dyx+j*dyy, dxx, dxy, dyx, dyy)) {
		return true;
	    }
	}
    }

    return false;
}

// Match pattern with wildcard archetype in all orientations and positions
function MatchWild2 (x, f, minp) {
    var l = f.f_lft;
    var r = f.f_rgt;
    var t = f.f_top;
    var b = f.f_btm;
    var w = r-l;
    var h = b-t;

    var p = Lib2Bin (x, minp, w, h);
    if (!p) {		// Ignore, if pattern exceeds archetype dimensions
	return false;
    }

    var d = f.f_wid;
    var x = p.f_wid;
    var y = p.f_hgt;
    p = p.f_img;
    return  MatchWild1 (p, x, y, f, w, h, l, t, 1, 0, 0, 1) ||
	    MatchWild1 (p, x, y, f, w, h, r-1, t, -1, 0, 0, 1) ||
	    MatchWild1 (p, x, y, f, w, h, l, b-1, 1, 0, 0, -1) ||
	    MatchWild1 (p, x, y, f, w, h, r-1, b-1, -1, 0, 0, -1) ||
	    MatchWild1 (p, x, y, f, w, h, l, t, 0, 1, 1, 0) ||
	    MatchWild1 (p, x, y, f, w, h, r-1, t, 0, -1, 1, 0) ||
	    MatchWild1 (p, x, y, f, w, h, l, b-1, 0, 1, -1, 0) ||
	    MatchWild1 (p, x, y, f, w, h, r-1, b-1, 0, -1, -1, 0);
}

// See if an image matches any of several rotations
function MatchImg (x, y, f, wild, minp) {
    if (typeof x !== 'string') {		// match (list, string or list)
	for (var i = x.length; --i >= 0; ) {
	    if (MatchImg (y, x[i], f, -wild, minp)) {
		return true;
	    }
	}
    } else if (wild) {				// match (pattern, template)
	return MatchWild2 (wild > 0 ? x : y, f, minp);
    } else if (typeof y !== 'string') {		// match (string, list)
	return MatchImg (y, x, f, -wild, minp);
    } else {					// match (string, string)
	return x === y;
    }

    return false;
}

// Match glide symmetry
// In some cases, one kind of glide symmetry is equivalent to another:
// - Y_O allows Y_O glide symmetry, and treats Y_R as Y_O (e.g. Life Tumbler)
// - Y_DD allows Y_O glide symmetry, and treat Y_RR as Y_O (e.g. 3/4-Life Figure-8)
// - Y_D allows Y_D glide symmetry, and treats Y_R as Y_D
// - Y_OO allows Y_D glide symmetry, and treats Y_RR as Y_D
// - Y_RR allows Y_O glide symmetry, and treats Y_D as Y_O
// (NOTE: At present, objects with a specific symmetry are not considered
//  to implicitly have the same kind of glide symmetry; e.g. a beacon)
function MatchGlide (s, m) {
    var b = symmbits[m];			// Mask of bits to try
    var g = Math.floor (s / 10 % 10);		// Glide symmetry
    s %= 10;					// Base symmetry
    return m === Y_ANY || b & (1 << g) ||	// Exact match
      b & (1 << Y_D) && g === Y_O && s === Y_RR ||
      b & (1 << Y_R) && g === s && (s === Y_O || s === Y_D) ||
      b & (1 << Y_RR) && (g === Y_O && s === Y_DD || g === Y_O && s === Y_OO);
}

// Lookup the current pattern in the library for the selected rule(s)
function Lookup () {
    nfound = pagesize = 0;

    var k;
    var ntotal = 0;				// Total items
    var nitems = 0;				// Items searched

    for (var pass = 0; pass < 2; ++pass) {	// First pass counts, second searches
	if (pass) {
	    SetMax ('progsearch', ntotal);
	    SetValue ('progsearch', nitems);
	    ShowI ('progsearch', false);
	}

	for (var r = R_LIFE; r < R_MAX; ++r) {	// Search all relevant rules
	    results[r] = [];
	    nresults[r] = 0;

	    if (srch.s_rule !== R_ANY && r !== srch.s_rule) {	// Filter by rule
		continue;
	    }

	    for (var j = 0; j < rulelib[r].length; ++j) {
		var h = rulelib[r][j];		// Examine every section in library

		if (h.h_exp && !srch.s_exp) {	// Use expanded sources?
		    continue;
		}

		if (srch.s_cat < O_ANY &&		// Filter by category
		  (h.h_cid !== srch.s_cat &&
		   h.h_sec !== catlist[srch.s_cat] &&
		   h.h_sub !== catlist[srch.s_cat])) {
		    continue;
		}
		if (r === R_LIFE && h.h_per && !MatchOsc (h)) {	// Optimize Life stills/pseudo-stills
		    continue;				// and oscillators/pseudo-oscillators
		}

		var o = h.h_obj;			// Object list in this category

		if (srch.s_pop && r === R_LIFE && srch.s_wilds == W_IS) {	// Quick-search for specific still-life
		    if (h.h_per !== 1 || h.h_minp !== srch.s_pop || h.h_pseudo) {
			continue;
		    }
		    if (pass && srch.s_idx <= o.o_length) {	// Try direct look-up
			p = o[srch.s_idx-1];
			if (WildCmp (p.p_name, srch.s_pat, true)) {
			    results[r][nresults[r]++] = p;	// Add solution
			    ++nfound;
			    nitems += o.o_length;
			    continue;
			}
		    }
		}

		if (!pass) {				// First pass: just count searchable items
		    ntotal += o.length;
		    continue;
		}

		for (var i = 0; i < o.length; ++i, ++nitems) {
		    if (! (nitems % Math.floor (ntotal/100))) {	// Periodically update search status
			SetText ('txtstatus', 'Searching... ' +
			  Math.min (100, Math.round (nitems*100/ntotal)) +
			  '% done.');
			SetValue ('progsearch', nitems);
		    }

		    var p = o[i];			// Examine every line in library:

		    if (srch.s_diff && !p.p_diff) {	// Difficult still-lifes?
			continue;
		    }

		    if (srch.s_type >= T_SIMPLE) {	// Simple criteria:
			if (srch.s_wilds !== W_ANY) {	// Filter by name
			    if (srch.s_names === N_PATTERN) {	// Filter by pattern name
				k = WildCmp (p.p_name, srch.s_pat, true);
			    } else {			// Filter by file name
				k = WildCmp (p.p_file, srch.s_pat, false);
			    }
			    if (k === ((srch.s_wilds & W_NOT) !== 0)) {
				continue;
			    }
			}
		    }

		    if (srch.s_type >= T_ADV) {		// Advanced criteria:
			if (srch.s_cat === O_NAMES) {
			    if (typeof p.p_name === 'string') {
				continue;		// Objects with multiple names
			    }
			} else if (srch.s_cat === O_FILES) {
			    if (typeof p.p_file === 'string') {
				continue;		// Objects with multiple files
			    }
			} else if (srch.s_cat === O_COLOR) {
			    if (In (colobj, p.p_GetFile ()) < 0) {
				continue;		// Objects with multi-color syntheses
			    }
			}
			if (srch.s_minps !== M_ANY && !MatchNum (p.p_minp, 1,
			  srch.s_minps, srch.s_minpx, srch.s_minpy, 1, 0)) {
			    continue;			// Filter by minimum population
			}
			if (srch.s_avgps !== M_ANY && !MatchNum (OrderNum (p.p_avgp), 1,
			  srch.s_avgps, srch.s_avgpx, srch.s_avgpy, 1, 0)) {
			    continue;			// Filter by average population
			}
			if (srch.s_maxps !== M_ANY && !MatchNum (OrderNum (p.p_maxp), 1,
			  srch.s_maxps, srch.s_maxpx, srch.s_maxpy, 1, 0)) {
			    continue;			// Filter by maximum population
			}
			if (srch.s_rpops !== M_ANY && !MatchNum (p.p_minp, OrderNum (p.p_maxp),
			  srch.s_rpops, srch.s_rpopx, srch.s_rpopy, 1, 0)) {
			    continue;			// Filter by min/max population ratio
			}
			if (srch.s_infs !== M_ANY && !MatchNum (OrderNum (p.p_inf), 1,
			  srch.s_infs, srch.s_infx, srch.s_infy, 1, 0)) {
			    continue;			// Filter by influence
			}
			if (srch.s_dens !== M_ANY && !MatchNum (p.p_minp, OrderNum (p.p_inf),
			  srch.s_dens, srch.s_denx, srch.s_deny, 1, 0)) {
			    continue;			// Filter by minimum density
			}
			if (srch.s_adens !== M_ANY && !MatchOrderNum (p.p_avgp, p.p_inf,
			  srch.s_adens, srch.s_adenx, srch.s_adeny, 1, 0)) {
			    continue;			// Filter by average density
			}
			if (srch.s_mdens !== M_ANY && !MatchOrderNum (p.p_maxp, p.p_inf,
			  srch.s_mdens, srch.s_mdenx, srch.s_mdeny, 1, 0)) {
			    continue;			// Filter by maximum density
			}
			if (srch.s_pers !== M_ANY && !MatchNum (p.p_per, 1,
			  srch.s_pers, srch.s_perx, srch.s_pery, 1, 0)) {
			    continue;			// Filter by period
			}
			if (srch.s_glss !== M_ANY && !MatchNum (p.p_GetGls (), 1,
			  srch.s_glss, srch.s_glsx, srch.s_glsy, 1, TBD)) {
			    continue;			// Filter by gliders
			}
			if (srch.s_rglss !== M_ANY) {
			    if (p.p_gls >= KNOWN || !MatchNum (p.p_GetGls (), 1,
			      srch.s_rglss, 0, p.p_minp, 1, 0)) {
				continue;		// Filter by relative gliders
			    }
			}
			if (srch.s_range && p.p_gls == Math.floor (p.p_gls)) {
			    continue;			// Filter by glider range
			}
			if (!SrchVel (p.p_velx, p.p_vely, p.p_veld)) {
			    continue;			// Filter by velocity;
			}
		    }

		    if (srch.s_type >= T_DET) {		// Detailed criteria:
			k = p.p_GetFlags ();
			if (srch.s_ffs !== H_ANY &&
			  ! (k & (srch.s_ffs === H_FF ? 0x01 : 0x02))) {
			    continue;			// Filter flip-flop or on-off
			}
			if (srch.s_phxs !== P_ANY && ! (k & 0x04)) {
			    continue;			// Filter phoenix
			}
			if (srch.s_bbs !== H_ANY &&
			  ! (k & (srch.s_bbs === B_BB ? 0x08 : 0x10))) {
			    continue;			// Filter babbling brooks or muttering moats
			}
			if (srch.s_symms !== Y_ANY &&
			  ! ((1 << p.p_GetSymm ()) & symmbits[srch.s_symms])) {
			    continue;			// Filter by symmetry
			}
			if (srch.s_glides !== Y_ANY &&
			  !MatchGlide (p.p_symm, srch.s_glides)) {
			    continue;			// Filter by glide symmetry
			}
			var rmod = p.p_GetRmod ();	// Population / modulus
			if (! (rmod & srch.s_rmods)) {
			    continue;			// Filter by population / modulus
			}
			if (srch.s_mods !== M_ANY && !MatchNum (p.p_per, rmod,
			  srch.s_mods, srch.s_modx, srch.s_mody, 1, 0)) {
			    continue;			// Filter by modulus
			}
			if (srch.s_boxs !== M_ANY &&
			  (!MatchNum (p.p_boxw, 1,
			    srch.s_boxs, srch.s_boxwx, srch.s_boxwy, 1, 0) ||
			   !MatchNum (p.p_boxh, 1,
			    srch.s_boxs, srch.s_boxhx, srch.s_boxhy, 1, 0))) {
			    continue;			// Filter by smallest bounding box
			}
			if (srch.s_sqbs !== M_ANY && !MatchNum (p.p_boxh, p.p_boxw,
			  srch.s_sqbs, srch.s_sqbx, srch.s_sqby, 1, 0)) {
			    continue;			// Filter by smallest bounding box squareness
			}
			if (srch.s_hulls !== M_ANY &&
			  (!MatchNum (OrderNum (p.p_hullw), 1,
			    srch.s_hulls, srch.s_hullwx, srch.s_hullwy, 1, 0) ||
			   !MatchNum (OrderNum (p.p_hullh), 1,
			    srch.s_hulls, srch.s_hullhx, srch.s_hullhy, 1, 0))) {
			    continue;			// Filter by largest bounding box
			}
			if (srch.s_sqhs !== M_ANY) {	// Filter by largest bounding box squareness
			    if (!MatchOrderNum (p.p_hullh, p.p_hullw,
			      srch.s_sqhs, srch.s_sqhx, srch.s_sqhy, 1, 0)) {
				continue;
			    }
			}
			if (srch.s_heats !== M_ANY && !MatchNum (OrderNum (p.p_heat), 1,
			  srch.s_heats, srch.s_heatx, srch.s_heaty, 1, 0)) {
			    continue;			// Filter by heat
			}
			if (srch.s_temps !== M_ANY && !MatchNum (p.p_temp, 1,
			  srch.s_temps, srch.s_tempx, srch.s_tempy, 1, 0)) {
			    continue;			// Filter by temperature
			}
			if (srch.s_vols !== M_ANY && !MatchNum (p.p_vol, 1,
			  srch.s_vols, srch.s_volx, srch.s_voly, 1, 0)) {
			    continue;			// Filter by volatility
			}
			if (srch.s_svols !== M_ANY && !MatchNum (p.p_svol, 1,
			  srch.s_svols, srch.s_svolx, srch.s_svoly, 1, 0)) {
			    continue;			// Filter by strict volatility
			}
			if (srch.s_rvols !== M_ANY && !MatchNum (p.p_svol, 1,
			  srch.s_rvols, p.p_vol, p.p_vol, 1, 0)) {
			    continue;			// Filter by relative volatility
			}
			if (srch.s_ttss !== M_ANY && !MatchNum (p.p_tts, 1,
			  srch.s_ttss, srch.s_ttsx, srch.s_ttsy, 1, 0)) {
			    continue;			// Filter by time to stabilize
			}
			if (srch.s_efs !== M_ANY && !MatchNum (p.p_GetEf (), 1,
			  srch.s_efs, srch.s_efx, srch.s_efy, 1, 0)) {
			    continue;			// Filter by evolutionary factor
			}
			if (srch.s_rars !== M_ANY) {
			    if (srch.s_rar) {		// Filter by rarity
				if (!MatchNum (FREQBASE, p.p_freq,
				  srch.s_rars, srch.s_rarx, srch.s_rary, 1, _)) {
				    continue;
				}
			    } else {			// Filter by frequency
				if (!MatchNum (p.p_freq, FREQBASE,
				  srch.s_rars, srch.s_rarx, srch.s_rary, 1, _)) {
				    continue;
				}
			    }
			}
		    }

		    if (srch.s_field) {			// Image match
			// Filter by implicit image constraints
			if (p.p_maxp < srch.s_iminp || srch.s_imaxp < p.p_minp ||
//			  srch.s_iboxw < p.p_boxw || srch.s_iboxh < p.p_boxh ||
			  typeof (p.p_img) == 'string' && p.p_img.charCodeAt (1) == 10) {
			    continue;
			}
			if (!MatchImg (p.p_img, srch.s_img,
			  srch.s_field, srch.s_field.f_wild < 0, p.p_minp)) {
			    continue;
			}
		    }

		    results[r][nresults[r]++] = p;	// Add solution
		    ++nfound;

		    if (srch.s_type === T_IMAGE && srch.s_field.f_wild >= 0) {	// Only one image match per rule!
			j = rulelib[r].length;
			break;
		    }
		}
	    }
	}
    }

    var therule = Sort (true, 0);		// Build result table

    if (nfound === 0) {				// No matches found:
	View (Z_NONE);				// Pattern not found!
	SetText ('txtstatus', 'No matching pattern found in database.');
    } else {					// Matches found:
	View (Z_MANY);
	if (nfound > 1) {			// Multiple matches:
	    selectr = nrules === 1 ? therule : R_ANY;	// Show 'unknown rule'
	    SetText ('gorule', rulenames[selectr]);	// (unless there is only one)
	    SetText ('txtunk', rulenames[selectr]);
	    SetHref ('gorule', (i = rulepage[selectr]) + '.htm');
	    ShowI ('gorule', i !== '');
	    ShowI ('txtunk', i === '');
	} else if (view == V_LIST) {		// Select the only line in list box
	    Found (therule, 0);
	} else {				// Select the only item in stamp page
	    SortStamp (0, 0);
	}
    }
}

// Draw a glider-annotation string
function DrawGls (ctx, x, y, str, sel, f) {
    var font = Id ('imgfont');			// Font image
    for (var i = 0; i < str.length; ++i) {
	var c = str.charAt (i);
	if ((c = '0123456789+-e.Pc/^<>(,)x '.indexOf (c)) >= 0) {
	    var w = fontwidth[c];
	    ctx.drawImage (font, 8*c, 13*(f+sel), w+2, 13, x, y, w+2, 13);
	    x += w;
	}
    }
    return x;
}

// Draw a matrix of dead background cells
function SortDots (ctx, x, y, w, h, m) {
    if (m === 4) {					// Draw dead cells
	for (var j = 0; j < h; j += m) {
	    for (var i = 0; i < w; i += m) {
		DrawRect (ctx, x+i+2, y+j+2, 1, 1, C_STAMP_DEAD);
	    }
	}
    }
}

// Set up navigation buttons above (and/or below) result list table/stamp
function SortScroll (p) {
    ShowB ('viewscroll'+p, npages > 1);		// Optionally enable scroll buttons
    SetText ('inpagen'+p, '/' + npages);
    ShowI ('inpaget'+p, npages > MAXPAGES);
    ShowI ('inpages'+p, npages <= MAXPAGES);

    GreyText ('inhome'+p, pageno > 0);		// Gray navigation buttons
    GreyText ('inpgup'+p, pageno > 0);
    GreyText ('inpgdn'+p, pageno+1 < npages);
    GreyText ('inend'+p, pageno+1 < npages);

    if (npages <= MAXPAGES && GetOptions ('inpages'+p).length === 0) {
	for (var i = 0; i < npages; ++i) {	// If not too many pages,
	    AddOption ('inpages'+p, ''+(i+1));	// Create select box with all pages
	}
    }

    nosort = true;
    SetValue ('inpaget'+p, (pageno+1));		// Force page number
    if (npages <= MAXPAGES) {
	SetSel ('inpages'+p, pageno);
    }
    nosort = false;
}

// Display sorted solution stamp page
// idx is one of: -1=create page; n=select item n
function SortStamp (page, idx) {
    var ctx = GetContext ('canstamp', '2d');	// Stamp page image context
    var r;
    var i;
    var n;
    var p;
    var u;
    var v;
    var x;
    var y;

    if (!pagesize) {				// Compute page layout only once
	stampm = 4;				// Magnification
	stampw = 12;				// Stamp width
	stamph = 7;				// Stamp height

	for (r = 0; r < R_MAX; ++r) {		// Find largest bounding box
	    n = nresults[r];
	    for (i = 0; i < n; ++i) {
		p = results[r][i];
		if (p.p_boxw < 160) {
		    stampw = Math.max (stampw, p.p_boxw);
		    stamph = Math.max (stamph, p.p_boxh);
		} else if (p.p_GetNames ().length > 7) {
		    stampw = Math.max (stampw, 22);
		}
	    }
	}

	stampw = Math.ceil ((stampw+3)/5) * 5;	// Round up to multiple of 5
	stamph = Math.ceil ((stamph+3)/5) * 5;	// Round up to multiple of 5
	stampx = Math.max (Math.floor (630/stampm/stampw, 1));	// Columns
	stampy = Math.max (Math.floor (470/stampm/stamph, 1));	// Rows
	pagesize = stampx * stampy;				// Ideal page size

	for (r = npages = 0; r < R_MAX; ++r) {			// Pages/each rule
	    npages += rulefirst[r] = Math.ceil (nresults[r] / pagesize);
	}
    }

    stampx = Math.max (Math.floor (630/stampm/stampw, 1));	// Columns
    stampy = Math.max (Math.floor (470/stampm/stamph, 1));	// Rows
    npages = Math.max (1, npages);				// # of pages
    pageno = page = Math.max (0, Math.min (page, npages-1));	// Reasonable page number

    for (r = 0; page >= rulefirst[r]; ++r) {	// Page number within rule
	page -= rulefirst[r];
    }

    var n = nresults[r] - page * pagesize;		// Remaining items
    stampn = Math.min (n, stampx*stampy);	// Items on page
    stampx = Math.max (1, Math.min (n, stampx));
    stampy = Math.min (Math.ceil (n/stampx), stampy);
    var wid = stampx*stampw + 20/stampm;	// Life image limits
    var hgt = stampy*stamph + 20/stampm;
    stampf = new Field (wid, hgt);
    stampr = stampm*wid + 1;			// Net image width
    stampb = stampm*hgt + 1;			// Net image height
    stamprule = r;				// Rule for all items

    SetWidth ('canstamp', stampr);
    SetHeight ('canstamp', stampb);
    SortDots (ctx, 0, 0, stampr, stampb, stampm);

    SortScroll ('');				// Set up navigation buttons
    ShowB ('viewscroll2', false);		// Scroll buttons only on top

    var o = 0;
    stampq = new Pattern (null, '',
      'Search results' + (npages > 1 ? ' (page '+(pageno+1)+'/'+npages+')' : ''),
      0, OMEGA, OMEGA, OMEGA, 0, NaN, NaN, NaN, Y_ANY, wid, hgt, OMEGA, OMEGA,
      1, UNKNOWN, NaN, 0, 1, 0, 0, 0, -1);

    var j = -page * pagesize;			// Item number on page

    n = nresults[r];				// Number of matches this rule

    for (i = 0; i < n; ++i, ++j) {
	if (j < 0) {				// Ignore all before this page
	    continue;
	}

	u = j%stampx * stampw;
	v = Math.floor (j/stampx) * stamph;

	p = results[r][i];			// Object index
	if (idx === j) {			// Selecting this specific item
	    Display (r, p);
	    Image (null, r, p, 1);
	    idx = -1;				// Never select another on same page
	}

	var sel = p === selectb && idx < 0;	// Is object selected?
	if (sel) {
	    x = u ? 0 : 8;
	    y = v ? 0 : 4;
	    DrawRect (ctx, u*stampm+8-x, v*stampm+4-y,
	      ((j+1)%stampx ? stampw*stampm : stampr)+x,
	      (j/stampx+1 < stampy ? stamph*stampm : stampb)+y, C_STAMP_SEL);
	    SortDots (ctx, u*stampm+8-x, v*stampm+4-y,
	      ((j+1)%stampx ? stampw*stampm : stampr)+x,
	      (j/stampx+1 < stampy ? stamph*stampm : stampb)+y, stampm);
	}

	if (p.p_boxw < 160) {			// Draw small objects
	    Export (null, ctx, stampf, r, p, ~stampm,
	      u+20/stampm, v+20/stampm, 0, '');
	} else {				// Text large objects
	    ctx.font = '12px Verdana';
	    ctx.textBaseline = 'top';
	    var str = p.p_GetNames ();		// Displayed name
	    var tw = ctx.measureText (str).width;	// Name's width
	    DrawRect (ctx, u*stampm+20, v*stampm+18, tw+4, 16,
	      sel ? C_STAMP_SEL : C_BG);	// Clear background
	    ctx.fillStyle = C_TEXT_NORMAL;
	    ctx.fillText (str, u*stampm+21, v*stampm+18);
	}

	var gls = p.p_GetGls ();		// Gliders
	x = DrawGls (ctx, u*stampm+8, v*stampm+4,
	  GlsName (p.p_gls, '', ''), sel * F_SEL,
	  gls > p.p_minp ? F_GT : (gls === p.p_minp ? F_EQ : F_DIGIT));
	if (p.p_freq > 0 && srch.s_rars !== M_ANY ||
	  defsort === S_FREQ || defsort === S_RAR) {
	    DrawGls (ctx, x+4, v*stampm+4, RealName (FREQBASE/p.p_freq, 5, 0),
	      sel * F_SEL, F_NOTE);
	} else if (p.p_tts) {			// Methuselahs: time to stabilize
	    DrawGls (ctx, x+4, v*stampm+4, RealName (p.p_tts, 5, '', ''),
	      sel * F_SEL, F_NOTE);
	}

	stampq.p_minp += p.p_minp;		// Accumulate aggregate statistics
	stampq.p_temp += p.p_temp * p.p_minp;
	stampq.p_svol += p.p_svol * p.p_minp;
	stampq.p_per = LCM (stampq.p_per, p.p_per, CT);
	stampq.p_tts = Math.max (stampq.p_tts, p.p_tts);
	x = OrderPair (p.p_heat, p.p_per);
	if (o < x[1]) {				// Hotter by orders of magnitude?
		o = x[1];
		stampq.p_heat = 0;
	}
	if (o == x[1]) {
		stampq.p_heat += p.p_heat / p.p_per;
	}

	if (!j) {				// First item: use its velocity
	    stampq.p_velx = p.p_velx;
	    stampq.p_vely = p.p_vely;
	    stampq.p_veld = p.p_veld;
	} else if (stampq.p_velx !== p.p_velx || stampq.p_vely !== p.p_vely ||
	  stampq.p_veld !== p.p_veld) {		// Subsequent items: velocities must match
	    stampq.p_velx = stampq.p_vely = 0;
	    stampq.p_veld = 1;
	}

	if (j+1 >= stampx*stampy) {		// Stop after one page
	    ++j;
	    break;
	}
    }

    if (stampq.p_minp) {			// Finalize weighted statistics
	stampq.p_temp /= stampq.p_minp;
	stampq.p_vol /= stampq.p_minp;
	stampq.p_svol /= stampq.p_minp;
    }

    stampq.p_heat = 2*OMEGA*(o>>1) + Math.min (OMEGA, o&1 ? 1 : stampq.p_heat*stampq.p_per);

    TruncTable ('tablist', 0);			// No need for list table anymore
}

// Display a box name for the result table
// "XxY" is usually displayed without any spaces,
// but for very large sizes, spaces are added to allow browser to wrap the line
function BoxName (w, h, q, p) {
   w = OrderName (w, q, p);
   h = OrderName (h, q, p);
   return w + (w.length + h.length < p ? 'x' : (h.length < p ? ' x' : ' x ')) + h;
}

// Draw column heading bar for sort list table
function SortHdr (tab, j) {
    var tr = AddRow (tab, j, listhdr, '', true, 1, C_BG);
    for (var i = j = 0; i < S_MAX; ++i) {	// Color column headings
	if (viscol[i]) {
	    SetBg (GetCells (tr)[j++], i === defsort ?
	      (sortdir < 0 ? C_COL_BACK : C_COL_SORT) : C_COL_NORMAL);
	}
    }
}

// Display sorted solution list
function SortList (page) {
    var r;
    var n;
    var q = srch.s_rpops !== M_ANY || defsort === S_RPOP;	// Relative population
    var d = srch.s_dens !== M_ANY || defsort === S_DEN;		// Minimum density
    var a = srch.s_adens !== M_ANY || defsort === S_ADEN;	// Average density
    var m = srch.s_mdens !== M_ANY || defsort === S_MDEN;	// Maximum density
    var i = srch.s_rvols !== M_ANY || defsort === S_RVOL;	// Relative volatility
    var g = srch.s_rglss !== M_ANY || defsort === S_RGLS;	// Relative gliders
    var j = srch.s_rmods !== 7 || defsort === S_RMOD;		// Period/modulus
    var k = srch.s_sqbs !== M_ANY || defsort === S_SQB;		// Small squareness
    var h = srch.s_sqhs !== M_ANY || defsort === S_SQH;		// Large squareness

    viscol[S_MINP] = true;	// srch.s_minps !== M_ANY || defsort === S_MINP || q;
    viscol[S_AVGP] = srch.s_avgps !== M_ANY || defsort === S_AVGP;
    viscol[S_MAXP] = srch.s_maxps !== M_ANY || defsort === S_MAXP || q;
    viscol[S_RPOP] = q;
    viscol[S_INF] = srch.s_infs !== M_ANY || defsort === S_INF || d || a || m;
    viscol[S_DEN] = d;
    viscol[S_ADEN] = a;
    viscol[S_MDEN] = m;
    viscol[S_HEAT] = srch.s_heats !== M_ANY || defsort === S_HEAT;
    viscol[S_TEMP] = srch.s_temps !== M_ANY || defsort === S_TEMP;
    viscol[S_VOL] = srch.s_vols !== M_ANY || defsort === S_VOL || i;
    viscol[S_SVOL] = srch.s_svols !== M_ANY || defsort === S_SVOL || i;
    viscol[S_RVOL] = i;
    viscol[S_SYMM] = srch.s_symms !== Y_ANY || defsort === S_SYMM;
    viscol[S_GLIDE] = srch.s_glides !== Y_ANY || defsort === S_GLIDE;
    viscol[S_BOX] = srch.s_boxs !== M_ANY || defsort === S_BOX || k;
    viscol[S_SQB] = k;
    viscol[S_HULL] = srch.s_hulls !== M_ANY || defsort === S_HULL || h;
    viscol[S_SQH] = h;
    viscol[S_PER] = true;	// srch.s_pers !== M_MANY || defsort === S_PER || j;
    viscol[S_MOD] = srch.s_mods !== M_ANY || defsort === S_MOD || j;
    viscol[S_RMOD] = j;
    viscol[S_VEL] = srch.s_vels !== M_ANY || defsort === S_VEL;
    viscol[S_GLS] = true;	// srch.s_glss !== M_ANY || defsort === S_GLS || g;
    viscol[S_RGLS] = g;
    viscol[S_FREQ] = srch.s_rars !== M_ANY && !srch.s_rar || defsort === S_FREQ;
    viscol[S_RAR] = srch.s_rars !== M_ANY && srch.s_rar || defsort === S_RAR;
    viscol[S_TTS] = srch.s_ttss !== M_ANY || defsort === S_TTS;
    viscol[S_EF] = srch.s_efs !== M_ANY || defsort === S_EF;
    viscol[S_CAT] = defsort === S_CAT;
    viscol[S_FILE] = srch.s_wilds !== W_ANY && srch.s_names === N_FILE || defsort === S_FILE;
    viscol[S_NAME] = true;	// srch.s_wilds !== W_ANY || defsort === S_NAME;
    viscol[S_IMG] = false;

    for (glidercol = nviscol = i = 0; i < S_MAX; ++i) {	// Count visible columns
	nviscol += viscol[i];
	if (i < S_GLS) {
	    glidercol += viscol[i];
	}
    }

    rviscol = Math.min (rviscol, nviscol-1);	// Reusable columns

    for (r = 0, j = 0; r < R_MAX; ++r) {	// Count lines
	n = nresults[r];			// Number of matches this rule
	if (n && nrules > 1) {
	    ++j;
	}
	j += n * expanded[r];
    }

    npages = Math.max (1, Math.ceil (j / maxlist));	// Number of pages
    pageno = Math.max (0, Math.min (page, npages-1));	// Reasonable page number
    SortScroll ('');			// Set up navigation buttons
    SortScroll ('2');

    i = GetRows ('tablist');
    if (i.length > 0) {			// Clear URL-rich bottom header row
	TruncRow (i[i.length-1], 0);
    }

    SortHdr ('tablist', 0);		// Draw column headers at the top

    j = 1 - Mul (pageno, maxlist);	// (OK if maxlist=_ and pageno=0)

    for (r = 0; r < R_MAX && j <= maxlist; ++r) {
	n = nresults[r];		// Number of matches this rule
	if (n && nrules > 1 && j > 0) {
	    var tr = AddRow ('tablist', j++, rulenames[r] + ': (' + n + ' ' +
	      (n !== 1 ? 'matches' : 'match') + ' found)' +
	      (expanded[r] ? '' : '...'),
	      'javascript:Collapse(' + r + ')', true, -1, C_ROW_RULE);
	}
	rulefirst[r] = j;
	n *= expanded[r];
	for (var i = 0; i < n && j <= maxlist; ++i, ++j) {
	    if (j <= 0) {	// Ignore items on page before this one
		continue;
	    }
	    var p = results[r][i];
	    var vel = '0';
	    if (p.p_velx) {
		vel = (p.p_velx !== 1 ? p.p_velx : '') + 'c' +
		  (p.p_veld !== 1 ? '/' + p.p_veld : '');
		if (p.p_vely === 0) {			// orthogonal
		    vel += ' o';
		} else if (p.p_vely === p.p_velx) {	// diagonal
		    vel += ' d';
		} else {				// oblique
		    vel = '(' + RealName (p.p_velx, 5, 0) + ', ' +
		      RealName (p.p_vely, 4, 0) + ')c/ ' +
		      RealName (p.p_veld, 7, 0);
		}
	    }
	    var g = p.p_GetGlide ();
	    var s = symmchars[p.p_GetSymm ()] + (g ? '(/'+symmchars[g]+')' : '');
	    tr = AddRow ('tablist', j, p, 'javascript:Found(' + r + ',' + i + ')',
	      false, 0, GlColors (p.p_GetGls (), p.p_minp, C_BG),
	      r, p.p_GetRmod (), vel, s, symmchars[g]);
	    if (p === selectb) {
		selecti = j;
		SetRowBg (tr, C_ROW_SEL, p.p_GetGls (), p.p_minp);
	    }
	}
    }

    SortHdr ('tablist', j++);		// Draw column headers at the bottom
    TruncTable ('tablist', j);
    rviscol = nviscol - 1;
}

// Re-sort solutions based on selected criteria, and generate table or stamp
// Last rule found is returned. This is THE rule, if exactly one match.
// Actual sorting is not needed if merely paging.
function Sort (sort, page) {
    var therule = R_ANY;
    nrules = 0;
    selecti = -1;

    for (var r = 0; r < R_MAX; ++r) {
	if (nresults[r] > 0) {
	    sortrule = r;
	    if (sort) {
		results[r] = results[r].sort (CmpBucket);
	    }
	    ++nrules;
	    therule = r;
	}
    }

    if (nfound === 0) {			// No solutions
    } else if (view === V_LIST) {	// List view
	ShowB ('viewstamp', false);
	SortList (page);
	ShowB ('viewtab', true);
    } else {				// Stamp view
	ShowB ('viewtab', false);
	SortStamp (page, -1);
	ShowB ('viewstamp', true);
    }

    SetText ('txtstatus', '' + nfound + (nfound !== 1 ? ' matches' : ' match') +
      ' found' + (nfound > maxlist && view === V_LIST ?
      '; ' + maxlist + ' are shown per page' : '') + '.');
    return therule;
}

// Compute background color, based on number of gliders
function GlColors (g, pop, def) {
    if (g === KNOWN) {		// Known: orange
	return C_GLS_KNOWN;
    } else if (g === TBD) {	// TBD: grey
	return C_GLS_TBD;
    } else if (g >= UNKNOWN) {	// Unknown (and/or partial): red
	return C_GLS_X;
    } else if (g > pop) {	// Over par: yellow
	return C_GLS_GT;
    } else if (g === pop) {	// Par: green
	return C_GLS_EQ;
    } else {			// Under par: white (or default)
	return def;
    }
}

// Set text area content and select it
function Enter (txt) {
    ShowR ('viewmulti', true);
    SetValue ('inmulti', txt);
    Select ('inmulti');
    Focus ('inmulti');
}

// Compose a search comment, based on a search criterion
function Comment (m, x, y, name, prefix, rar) {
    prefix = '#C ' + prefix;

    switch (m) {
    default:						// huh?
	return prefix + name + ' ?';
    case M_ANY:						// All
	return '';
    case M_INF:						// x = infinity
	if (!rar) {	// rarity treats _ as unknown
	    return prefix + name + ' = infinity\n';
	}
    case M_NAN:						// x = unknown
	return prefix + name + ' = unknown\n';
    case M_UNKNOWN:					// x >= 'x'
	return prefix + name + ' >= x\n';
    case M_PARTIAL:					// x > 'x'
	return prefix + name + ' > x\n';
    case M_TBD:						// x = TBD
	return prefix + name + ' = TBD\n';
    case M_KNOWN:					// x = known
	return prefix + name + ' = known\n';
    case M_EQ:						// n === y
	return prefix + name + ' = ' + y + '\n';
    case M_NE:						// n !== y
	return prefix + name + ' !== ' + y + '\n';
    case M_LT:						// n < y
	return prefix + name + ' < ' + y + '\n';
    case M_LE:						// n <= y
	return prefix + name + ' <= ' + y + '\n';
    case M_GT:						// n > y
	return prefix + name + ' > ' + y + '\n';
    case M_GE:						// n >= y
	return prefix + name + ' >= ' + y + '\n';
    case M_IN:						// x <= n <= y
	return prefix + x + ' <= ' + name + ' <= ' + y + '\n';
    case M_OUT:						// n < x || y < n
	return prefix + name + ' < ' + x + ' or ' + y + ' < ' + name + '\n';
    }
}

// Calculate absolute mouse position on screen.
function MouseAbs (e) {
    var x = 0;
    var y = 0;

    if (e.pageX || e.pageY) {			// Preferred method
	x = e.pageX;
	y = e.pageY;
    } else if (e.clientX || e.clientY) {	// Alternate method
	x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return [x, y];
}

// Calculate mouse position relative to the control being acted upon
// Much of the convolution here is as a result of two things:
// 1) canvas does not provide a simple object-relative mouse position; one must
//    determine mouse position with respect to some other context
// 2) Different browsers support different properties, and no method works for all. Sigh.
function MouseRel (e) {
    if (!e) {				// In case browser doesn't provide event context.
	e = window.event;
    }

    var xy = MouseAbs (e);
    var obj = e.target || event.srcElement;	// DOM object coordinate is relative to

    while (obj.offsetParent) {
	xy[0] -= obj.offsetLeft;
	xy[1] -= obj.offsetTop;
	obj = obj.offsetParent;
    }

    return xy;
}

// Handle each piece of a wildcard pattern piece, after being cut along tildes
function WildTilde (t, w) {
    if (w & W_BEGINS) {			// Begins with y => y*
	t += '*';
    }

    if (w & W_ENDS) {			// Ends with y => *y
	t = '*' + t;
    }

    if (w & W_ANY) {			// Any => *
	t = '*';
    }

    t = t.replace (/\*+/g, '*');	// ** => *
    t = '^' + t + '$';			// Add anchors
    t = t.replace (/\*\$$/, '');	// *$ => no need to check end
    t = t.replace (/\./g, '\\.');	// . => match a period
    t = t.replace (/\*/g, '.*');	// * => match any number of any character
    return t;
}

// Handle each piece of a wildcard pattern name, after being cut along semicolons
function WildSemi (t, w) {
    var i;

    t = t.split ('~');				// Cut into a~b~c..

    for (i = 0; i < t.length; ++i) {		// Include a; exclude b, c, ...
	t[i] = WildTilde (t[i], w);
    }

    if (t.length === 1) {			// a is just a
	return t[0];
    }

    var r = t[0].length ? '^(?=' + t[0] + ')' : '^';	// Optionally include first piece

    for (i = 1; i < t.length; ++i) {		// Optionally exclude all the others
	if (t[i].length) {
	    r += '(?!' + t[i] + ')';
	}
    }

    return r;
}

// Input a generic comparison criterion
// Several criteria have additional non-standard semantics
// (These are easier to include here, than to deal with them after the fact):
// - 'vel': velocity: is rational and has separate denominator and direction
// - 'gls': gliders: ? is interpreted differently; also add 'relative gliders'
// - 'rar': rarity: ? is interpreted differently; also have two sets of controls:
//    The second is used only for oscillators. The first is used only for
//    still-lifes, and shares space with average population.
//    (This is done to avoid still-lifes having two half-filled table rows.)
// - 'mod': modulus: also add period/modulus
// - 'svol': strict volatility: also add strict volatility/volatility
// - 'box': smallest box: x and y values are two separate sets of controls
// - 'hull': largest box (same as 'box')
function Criterion (s, q, n, c, whichr) {
    var w = n === 'box' || n === 'hull' ? 'w' : '';	// Box: separate width controls
    var h = w ? 'h' : '';			// Box: separate height controls
    var v = n === 'vel';			// Velocity: rational
    var d = n === 'gls';			// Gliders: ? => x
    var r = n === 'rar';			// Rarity: ? => _
    var nan = d ? UNKNOWN : (r ? _ : NaN);	// What ? translates to
    var u = r ? (whichr ? '2' : '1') : '';	// Suffix for these rarity controls
    var f = 'in' + n + u;			// Input control name prefix
    var m = q ? EvalValue (f + 's') : M_ANY;
    var x = (m >= M_IN) ? 1 : 0;
    var y = (m >= M_EQ) ? 1 : 0;
    var X = h && x ? ParseLfloats (GetValue (f + h + 'xt'), nan) : 0;
    var Y = h && y ? ParseLfloats (GetValue (f + h + 'yt'), nan) : 0;
    var i;

    ShowI (f + 's', q);
    ShowI (f + 'ya', q && m === M_ANY);
    ShowI (f + w + 'xt', x);
    ShowI (f + w + 'yt', y);

    if (h) {					// Show pairs of box controls
	ShowI ('view' + n + 'x', x);
	ShowI ('view' + n + 'y', y);
	ShowI (f + h + 'xt', x);
	ShowI (f + h + 'yt', y);
    }

    if (x) {
	x = GetValue (f + w + 'xt');
	if (v) {
	    x = x.replace (/c/gi, '*');
	}
	x = ParseLfloats (x, nan);
    }

    if (y) {
	y = GetValue (f + w + 'yt');
	if (v) {
	    y = y.replace (/c/gi, '*');
	}
	y = ParseLfloats (y, nan);
    }

    if (h) {					// Order boxes
	if (typeof x === 'number' && typeof X === 'number' && x < X) {
	    i = x;
	    x = X;
	    X = i;
	}
	if (typeof y === 'number' && typeof Y === 'number' && y < Y) {
	    i = y;
	    y = Y;
	    Y = i;
	}
	if (m >= M_IN && typeof x === 'number' && typeof X === 'number' &&
	  typeof y === 'number' && typeof Y === 'number') {
	    if (Y < X) {
		i = x;
		x = y;
		y = i;
		i = X;
		X = Y;
		Y = i;
	    }
	    if (y < x) {
		i = x;
		x = y;
		y = i;
		i = X;
		X = Y;
		Y = i;
	    }
	}
    } else {					// Order other numbers
	if (m >= M_IN && typeof x === 'number' && typeof y === 'number' &&
	  y < x) {				// x-y is always x<n<y, never x>n>y
	    i = x;
	    x = y;
	    y = i;
	}
    }

    eval ('s.s_' + n + 's=m');
    eval ('s.s_' + n + w + 'x=x');
    eval ('s.s_' + n + w + 'y=y');

    if (h) {					// Save second half of boxes
	eval ('s.s_' + n + h + 'x=X');
	eval ('s.s_' + n + h + 'y=Y');
    }

    var g = m !== M_ANY;
    var o = '';

    if (v) {				// Velocity: add denominator and direction
	x = Rational (x, CT);
	y = Rational (y, CT);
	i = GCD (y[1], x[1], CT);	// Unify both velocity denominators
	x[0] *= y[1] / i;
	y[0] *= x[1] / i;
	y[1] *= x[1] / i;
	s.s_veld = i = y[1];
	s.s_velx = x = x[0];
	s.s_vely = y = y[0];
	ShowI ('invelo', g);
	s.s_velo = g ? EvalValue ('invelo') : D_ANY;
	x = VelNames (x, i, m);
	y = VelNames (y, i, m);
	o = dirnames[s.s_velo];
    } else {				// All others just use real numbers
	x = RealNames (x, -1-d-8*r, m);	// (but rarity treats _ and NaN differently
	y = RealNames (y, -1-d-8*r, m);	//  and gliders treat KNOWN+TBD+UNKNOWN specially)
    }

    if (h) {				// Comment for boxes
	c = Comment (m, RealNames (x, -1, m) + 'x' + RealNames (X, -1, m),
	  RealNames (y, -1, m) + 'x' + RealNames (Y, -1, m), c, o, r);
    } else {				// Comment for other numbers
	c = Comment (m, x, y, c, o, r);
    }

    if (d) {				// Gliders: add relative gliders
	ShowI ('viewglsa', g < M_UNKNOWN);
	ShowI ('inrglss', g < M_UNKNOWN);
	s.s_rglss = q && g < M_UNKNOWN ? EvalValue ('inrglss') : M_ANY;
	c += Comment (s.s_rglss, 0, 'population', 'gliders', '', 0);
	g |= s.s_rglss !== M_ANY;
	GreyText ('viewglsa', s.s_rglss !== M_ANY);
	s.s_range = i = GetChecked ('inglr');
	if (i) {
	    c += '#C Range of glider costs';
	}
    } else if (n === 'mod') {		// Modulus: add period/modulus
	s.s_rmods = q ? EvalValue ('inrmods') : 7;
	c += resnames[s.s_rmods];
	g |= s.s_rmods !== 7;
	GreyText ('colres', s.s_rmods !== 7);
    } else if (n === 'svol') {		// Strict volatility adds svol/vol
	s.s_rvols = q ? EvalValue ('inrvols') : M_ANY;
	c += Comment (s.s_rglss, 0, 'volatility', 'strict volatility', '', 0);
	g |= s.s_rglss !== M_ANY;
	GreyText ('colrvol', s.s_rvols !== M_ANY);
    } else if (q && r) {			// Copy visible rarity controls to hidden ones
	i = 'in' + n + (whichr ? '1' : '2');    // Hidden rarity control names
	nosort = true;
	SetSel (i + 's', GetSel (f + 's'));
	nosort = false;
	SetValue (i + 'xt', GetValue (f + 'xt'));
	SetValue (i + 'yt', GetValue (f + 'yt'));
    }

    GreyText ('col' + n + u, g);
    return c;
}

// Constructor for search criteria
function Searches (now) {
    this.s_field = null;					// Uncompressed image
    this.s_img = null;						// Images
    this.s_imaxp = _;						// Image population constraint
//  this.s_iboxw = this.s_iboxh = _;				// Image box constraint
    this.s_rule = EvalValue ('inrules');			// Rule
    this.s_type = EvalValue ('intypes');			// Search type
    this.s_still = -1;						// Is it a still Life? (-1=unsure)
    this.s_pop = 0;						// Specific still-life population
    this.s_idx = 0;						// Specific still-life index

    var s = this.s_type >= T_SIMPLE;				// Simple?
    var a = this.s_type >= T_ADV;				// Advanced?
    var d = this.s_type >= T_DET;				// Detailed?
    var u = this.s_type >= T_ULT;				// Ultimate?
    var c = '';							// RLE comment
    var t;							// Text string
    var i;
    var j;

    ShowR ('viewres', s);
    ShowR ('viewsels', s);
    ShowR ('viewadvs', a);
    ShowR ('viewminpscats', a);
    this.s_cat = a ? EvalValue ('incats') : O_ANY;		// Category
    this.s_diff = false;
    GreyText ('colcat', this.s_cat !== O_ANY);
    if (this.s_cat !== O_ANY) {
	c += '#C category = ' + catnames[this.s_cat] + '\n';
    }

    if (this.s_cat === O_DIFF) {				// Difficult still-lifes?
	this.s_cat = O_STILL;
	this.s_diff = true;
    }

    var v = a && (this.s_cat >= O_ANY || (this.s_cat >= O_SS &&
      this.s_cat <= O_PUFF) || this.s_cat === O_BAD);		// Velocity?
    var o = this.s_cat !== O_STILL && this.s_cat !== O_PSTILL;	// Oscillating?
    var r = a && (this.s_rule === R_ANY || this.s_rule === R_LIFE) &&
      (this.s_cat >= O_ANY || this.s_cat === O_STILL || this.s_cat === O_OSC); // Rarity?
    var m = this.s_cat >= O_ANY || this.s_cat === O_METH;	// Methuselah?

    this.s_exp = GetChecked ('inexp');				// Extra sources?
    GreyText ('inexp', this.s_exp);

    this.s_names = a ? EvalValue ('innames') : N_PATTERN;	// Name type
    this.s_wilds = s ? a ? EvalValue ('inwilds') : W_IS : W_ANY;
    GreyText ('colname', this.s_wilds !== W_ANY);
    ShowI ('intext', this.s_wilds !== W_ANY);
    ShowI ('viewsimp', this.s_type === T_SIMPLE);
    ShowI ('viewadv', a);
    ShowB ('tippat', a);

    if (this.s_type !== T_IMAGE) {			// Text search
	t = GetValue ('intext').toLowerCase ().replace (/[ \t\r]/g, '');

	if (t === 'eval') {				// Enable evalulation console
	    ShowB ('vieweval', true);
	    SetValue ('intext', '');
	    this.s_type = T_BAD;
	}

	if (this.s_names === N_FILE) {
	    if ((i = t.lastIndexOf ('/')) >= 0) {	// Strip path from RLE
		t = t.substring (i+1);
	    }
	    if ((i = t.indexOf ('.')) >= 0) {		// Strip extension from RLE
		t = t.substring (0, i);
	    }
	    t = t.replace (/[^-*.0-9;a-z~]/g, '');	// Strip all punctuation except -
	} else {
	    t = t.replace (/[^*.0-9;a-z~]/g, '');	// Strip all punctuation except .
	    t = t.replace (/with/g, 'w');		// Replace 'with' by 'w'
	    if (this.s_wilds === W_IS && (i = t.indexOf ('.')) > 0) {
		j = parseInt (t);
		i = parseInt (t.substring (i+1));
		if (i > 0 && j > 0 && t === j + '.' + i){
		    this.s_pop = j;
		    this.s_idx = i;
		}
	    }
	}

	if (this.s_wilds !== W_ANY) {
	    c += '#C ' + (this.s_names === N_FILE ? 'filename' : 'pattern name') +
	      ' ' + wildnames[this.s_wilds] + ' ' + t + '\n';
	}

	t = t.replace (/,/g, ';');			// Allow , as well as ;
	t = t.split (';');				// One or more inclusive names

	for (i = 0; i < t.length; ++i) {
	    t[i] = WildSemi (t[i], this.s_wilds);
	}

	for (i = 0, j = '^'; i < t.length; ++i) {
	    if (t[i].length) {
		j += '(?=' + t[i] + ')';
	    }
	}

	this.s_pat = new RegExp (j, this.s_names === N_PATTERN ? 'i' : '');
    }

    if (now && (u || this.s_type === T_IMAGE)) {	// Image search (+Search button)
	var fmt = X_CELLS;				// Default input format
	t = GetValue ('inmulti').replace (/\r/g, '');

	if (t === 'eval') {				// Enable evaluation console
	    ShowB ('vieweval', true);
	    SetValue ('inmulti', '');
	    this.s_type = T_BAD;
	}

	while (t.length > 0 && (((i = t.charAt (0)) === '#') || i === '!')) {	// Strip comments
	    if ((i = t.indexOf ('\n')) < 0) {		// Comment without newline?!
		i = t.length;
		t += '\n';
	    }
	    var j = t.substring (0, i);
	    t = t.substring (i+1);
	    if (j === '#Life 1.05') {
		fmt = X_LIFE105;
	    } else if (j === '#Life 1.06') {
		fmt = X_LIFE106;
	    } else {
		c += j.charAt (0) === '!' ? '#C' + j.substring (1) : j;
	    }
	}

	var rle = t.replace (/[ \t]/g, '');		// No white space in text or RLE
	var f;						// Field structure
	if (rle.substring (0, 2) === 'x=') {		// RLE header: must be RLE
	    fmt = X_RLE;
	    if ((i = rle.indexOf ('\n')) > 0) {
		var h = rle.substring (0, i);		// RLE header
		rle = rle.substring (i+1);
		for (;; h = h.substring (i+1)) {
		    // For each clause on RLE header:
		    if (h.substring (0, 5) === 'rule=') {
			// Parse rule clause; ignore others
			this.s_rule = RleRule (h.substring (5));
		    }
		    if ((i = h.indexOf (',')) < 0) {
			break;			// Stop if no comma continuation
		    }
		}
	    }
	} else if (rle.indexOf ('!') >= 0) {	// ! is end of RLE data
	    fmt = X_RLE;
	}

	switch (fmt) {
	case X_CELLS:				// Read plain text
	case X_LIFE105:				// Read Life 1.05 format
	    f = Text2Bin (t);
	    break;
	case X_LIFE106:				// Read Life 1.06 format
	    f = Life2Bin (t);
	    break;
	case X_RLE:				// Read RLE format
	    f = Rle2Bin (rle);
	    break;
	}

	Compact (f);
	this.s_still = f.f_IsStill ();

	if ((f.f_rgt - f.f_lft) * (f.f_btm - f.f_top) > LARGE*LARGE) {
	    View (Z_HUGE);			// Pattern too huge to process
	    SetText ('txtstatus', 'Pattern too large to process.');
	    this.s_type = T_BAD;
	}

//	SetText ('gobits', ''+f.f_minp);
//	SetText ('txtpop', ''+f.f_minp);

	var y = new Symm (f, f.f_lft, f.f_top, f.f_rgt, f.f_btm, false);

	if (f.f_wild < 0) {			// Wildcards present: affect symmetry
	    i = new Symm (f, f.f_lft, f.f_top, f.f_rgt, f.f_btm, true);
	    y.y_symm = i.y_symm;
	}

	i = y.y_img;
	if (f.f_wild || !u) {			// Ultimate ignores empty field
	    this.s_field = f;			// For wildcard pattern match
	    this.s_img = i;
	    this.s_iminp = f.f_minp;		// Implicitly constrain by population
	    this.s_imaxp = f.f_maxp;
//	    this.s_iboxw = y.y_wid;		// Implicitly constrain by box size
//	    this.s_iboxh = y.y_hgt;
	}
	if (typeof i !== 'string') {		// First image
	    i = i[0];
	}
	selectb = new Pattern (i, '', '', f.f_minp, f.f_maxp, (f.f_minp+f.f_maxp)/2, f.f_GetInf (),
	  OMEGA, NaN, NaN, NaN, y.y_symm, y.y_wid, y.y_hgt, OMEGA, OMEGA,
	  NaN, NaN, NaN, NaN, 1, NaN, NaN, 0, -1);
	SetRule (this.s_rule);
	Display (this.s_rule, selectb);
	Image (f, this.s_rule, null, 1);	// Display field, rather than pattern
    }

    ShowR ('viewults', u);
    ShowR ('viewmulti', u || !s);
    c += Criterion (this, a, 'minp', 'minimum population');

    ShowR ('viewmaxpsrpops', a && o);
    c += Criterion (this, a && o, 'maxp', 'maximum population');
    c += Criterion (this, a && o, 'rpop', 'min/max population');

    this.s_rar = EvalValue (o ? 'colrar2' : 'colrar1');
    ShowR ('viewavgpsglss', a);
    ShowI ('viewavgps', o);
    ShowI ('viewrar1s', r && !o);
    SetBg ('colavgps', (tok['avgps'] = o || r) ? C_BG : C_GLS_TBD);
    c += Criterion (this, a && o, 'avgp', 'average population');
    c += Criterion (this, a, 'gls', 'gliders');

    ShowR ('viewpersmods', a && o);
    c += Criterion (this, a && o, 'per', 'period');
    c += Criterion (this, a && o, 'mod', 'modulus');

    ShowR ('viewrarsvels', a && o && (r || v));
    ShowC ('viewrar2s', 'colrars', tok['rars'] = r);
    ShowC ('viewvels', 'colvels', tok['vels'] = v);
    c += Criterion (this, r, 'rar', this.s_rar ? 'rarity' : 'frequency', o);
    c += Criterion (this, v, 'vel', 'velocity');

    ShowR ('viewdets', d);
    ShowR ('viewttsef', d && m);
    c += Criterion (this, d && m, 'tts', 'time to stabilize');
    c += Criterion (this, d && m, 'ef', 'evolutionary factor');

    ShowR ('viewinfsdens', d);
    c += Criterion (this, d, 'inf', 'influence');
    c += Criterion (this, d, 'den', 'minimum density');
    ShowR ('viewadensmdens', d);
    c += Criterion (this, d, 'aden', 'average density');
    c += Criterion (this, d, 'mden', 'maximum density');
    ShowR ('viewheatstemps', d && o);
    c += Criterion (this, d && o, 'heat', 'heat');
    c += Criterion (this, d && o, 'temp', 'temperature');
    ShowR ('viewvolssvols', d && o);
    c += Criterion (this, d && o, 'vol', 'volatility');
    c += Criterion (this, d && o, 'svol', 'strict volatility');

    ShowR ('viewboxs', d);
    c += Criterion (this, d, 'box', 'smallest box');
    c += Criterion (this, d, 'sqb', 'small box squareness');

    ShowR ('viewhulls', d && o);
    c += Criterion (this, d, 'hull', 'largest box');
    c += Criterion (this, d, 'sqh', 'large box squareness');

    ShowR ('viewsymms', d);
    this.s_symms = d ? EvalValue ('insymms') : Y_ANY;		// Symmetry
    GreyText ('colsymm', this.s_symms !== Y_ANY);
    if (this.s_symms !== Y_ANY) {
	c += '#C symmetry = ' + symmnames[this.s_symms] + '\n';
    }

    ShowC ('viewglides', 'colglides', tok['glide'] = d && o);
    this.s_glides = d && o ? EvalValue ('inglides') : Y_ANY;	// Glide symmetry
    GreyText ('colglide', this.s_glides !== Y_ANY);
    ShowI ('viewglides', o);
    if (this.s_glides !== Y_ANY) {
	c += '#C glide symmetry = ' + symmnames[this.s_symms] + '\n';
    }

    ShowR ('viewoscs', d);
    ShowC ('viewphxs', 'colphxs', tok['phxs'] = d && o);
    this.s_phxs = d && o ? EvalValue ('inphxs') : P_ANY;	// Phoenix
    if (this.s_phxs !== P_ANY) {
	c += '#C phoenix\n';
    }

    i = d && o && (this.s_cat <= O_POSC || this.s_cat == O_CONS || this.s_cat >= O_ANY);
    ShowC ('viewffs', 'colffs', tok['ffs'] = i);
    this.s_ffs = i ? EvalValue ('inffs') : H_ANY;		// Flip-flop/On-off
    if (this.s_ffs !== H_ANY) {
	c += '#C ' + (this.s_ffs === H_FF ? 'flip-flop' : 'on-off') + '\n';
    }

    ShowC ('viewbbs', 'colbbs', tok['bbs'] = i);
    this.s_bbs = i ? EvalValue ('inbbs') : H_ANY;		// Babbling brook/Muttering moat
    if (this.s_bbs !== B_ANY) {
	c += '#C ' + (this.s_bbs === B_BB ? 'babbling brook' : 'muttering moat') + '\n';
    }

    GreyText ('colrule', this.s_rule !== R_ANY);
    if (this.s_rule !== R_ANY) {		// Look up pattern in one rule
	c = '#C rule = ' + rulenames[this.s_rule] + '\n' + c;
    }

    this.s_comm = c;			// Comment for generating stamp-page RLE
}



//------------------------------ User-activated functions ----------------------

// Set background color on all cells in a table row; gliders colored differently
function SetRowBg (tr, bg, g, pop) {
    for (var i = (tr = GetCells (tr)).length; --i >= 0; ) {
	SetBg (tr[i], i === glidercol ? GlColors (g, pop, bg) : bg);
    }
}

// Set sort direction, based on column clicked on
function Column (col, dir) {
    ReTime ();				// Reset tool-tip timer
    defsort = col;
    sortdir = dir;

    nosort = true;			// Update controls WITHOUT two automatic sorts
    var i;
    SetSel ('insortu', i = sortcols[col]);
    SetSel ('insorts', i < sortcols[S_BOX] ? i : sortcols[S_MINP]);
    SetSel ('indirs', dir < 0);
    nosort = false;

    Sort (true, 0);
}

// Select specific solution, based on rule, and index into list box for that rule
function Found (r, i) {
    ReTime ();				// Reset tool-tip timer

    var x = rulefirst[r] + i;		// Index into list table

    if (selecti >= 0) {			// Un-hilight previous selection
	SetRowBg (GetRows ('tablist')[selecti], C_BG, selectb.p_GetGls (), selectb.p_minp);
    }

    var p = results[r][i];		// Highlight newly-selected item
    SetRowBg (GetRows ('tablist')[selecti = x], C_ROW_SEL, p.p_GetGls (), p.p_minp);
    Display (r, p);
    Image (null, r, p, 1);
}

// Toggle expanding/collapsing of a rule's results within result list
// This is useful when one rule has more than (maxlist) matches,
// which suppresses results from other rule(s)
function Collapse (r) {
    ReTime ();				// Reset tool-tip timer
    expanded[r] ^= 1;
    Sort (false, pageno);
}

// Display stamp page itself as the pattern
function Stamp () {
    Deselect ();
    Sort (false, pageno);			// Re-display current page
    stampq.p_img = Bin2Lib (stampf, 0, 1, stampf.f_wid, stampf.f_wid, stampf.f_hgt, false);
    stampq.p_comm = '#C Search results\n' + srch.s_comm;

    if (nfound > 1) {				// 1 item needs no sort order
	stampq.p_comm += '#C sort by ' +
	  (sortdir > 0 ? 'ascending ' : 'descending ') + sortnames[defsort];
	if (npages > 1) {			// 1 page needs no page number
	    stampq.p_comm += ' (page ' + (pageno+1) + ' / ' + npages + ')';
	}
	stampq.p_comm += '\n';
    }

    Display (stamprule, stampq);
    Image (null, stamprule, stampq, 0);
}

// Click on pattern image to open the pattern
function Launch () {
    if (selectb) {
	var file = selectb.p_GetFile ();
	if (file) {
	    var h = rulelib[selectr][selectb.p_hdr];	// Header structure
	    var dir = h.h_sub;		// Pattern directory
	    var n = parseInt (dir);	// Subection number
	    if (dir === ''+n) {		// Subection = population?
		if (n < 10) {		// All patterns below 10 bits are in one bucket
		    dir = '0';
		} else if (n >= 26) {	// All patterns 26+ bits are in one bucket
		    dir = 'lg';
		}
	    }
	    if (h.h_cid >= O_SS && h.h_cid <= O_BR) {
		dir = 'ss';		// Moving and growing objects are kept in ss
	    }
	    open ((selectr !== R_LIFE ? rulepage[selectr] : dir) + '/' + file + '.rle');
	}
    }
}

// Click on stamp image
function Click (event) {
    ReTime ();

    var xy = MouseRel (event);
    var x = xy[0];
    var y = xy[1];

    if (y < 20) {
	if (x < 20) {			// Top left: Page up
	    PgUp ();
	    return;
	} else if (x >= stampr-20) {	// Top right: download Zip file
	    // TBD: Download ZIP file
	    return;
	}
    } else if (y >= stampb-20) {
	if (x < 20) {			// Bottom left: Page down
	    PgDn ();
	    return;
	} else if (x >= stampr-20) {	// Bottom right: download stamp RLE file
	    Stamp ();
	    return;
	}
    }

    x = Math.max (0, Math.min (stampx-1, Math.floor ((x-8)/stampw/stampm)));
    y = Math.max (0, Math.min (stampy-1, Math.floor ((y-4)/stamph/stampm)));
    if ((x += y * stampx) >= stampn) {		// Ignore space beyond last image
	return;
    }
    SortStamp (pageno, x);
}

// Start tip-timer
function TimerOn () {
    tiptimer = setTimeout ('Tip()', TIPTIME*1000);
}

// Shut tip-timer off
function TimerOff () {
    if (tiptimer) {
	clearTimeout (tiptimer);
	tiptimer = null;
    }
}

// User has clicked on something
function ReTime () {
    if (tipshown) {		// If tool-tip is shown, hide it
	Out ();
    } else if (tiptimer) {	// If timer is pending, restart it
	TimerOff ();
	TimerOn ();
    }
}

// Mouse leaves area of tool-tip
function Out () {
    TimerOff ();		// Cancel tip-timer, if active
    if (tipname) {
	ShowB ('tooltip', false);
	ShowB (tipname, tipshown = false);
    }
    tipname = '';
}

// Draw tool-tip
function Tip () {
    clearTimeout (tiptimer);
    tiptimer = null;
    ShowB (tipname, tipshown = true);
    ShowB ('tooltip', true);
}

// Mouse enters area over a control; prepare to draw tool-tip eventually
function Over (event, n) {
    var ok = tok[n];

    if (ok === false || !GetChecked ('intip')) {	// Suppress tips on suppressed elements
	return;				// or if tool tips are globally disabled
    }					// (But ok === undefined is ALLOWED)

    n = 'tip' + n;

    if (tipname !== n) {		// If changed tips, cancel previous one
	Out ();
    }

    tipname = n;

    if (!tipshown && !tiptimer) {	// Start timer to eventually draw tip
	var xy = MouseAbs (event);
	SetLeft ('tooltip', xy[0]);
	SetTop ('tooltip', xy[1]);
	TimerOn ();			// Start tip-timer
    }
}

// Reset button pressed: clear text and rule selection
function Clear () {
    ReTime ();				// Reset tool-tip timer
    Reset ('inform');			// Reset physical HTML form
    ReInit ();				// Re-initialize form-related state
}

// Paste button pressed: saved pattern in user-selected format
function Paste () {
    ReTime ();				// Reset tool-tip timer

    if (selectb) {
	var comm = selectb.p_comm;	// Comment exported to RLE file
	if (comm === undefined) {	// Comment is not defined for library items
	    comm = '#C ' + selectb.p_GetNames () + '\n';
	}
	Enter (Export (null, null, null, selectr, selectb,
	  EvalValue ('inpastes'), 0, 0, 0, comm));
    }
}

// Help button pressed: launch help page in a separate window
function Help () {
    ReTime ();				// Reset tool-tip timer
    open ("srchhelp.htm", "srchhelp");	// Open help page in new window
}

// Deselect current selection, if any
function Deselect () {
    selectb = null;			// Invalidate previous selection
    selecti = -1;
    GreyText ('inpaste', false);	// Can't paste anything
}

// Search button pressed: read pattern and search for it
function Search () {
    pageno = 0;				// Stamp view will start on first page
    Deselect ();			// Deselect current selection, if any
    SetText ('txtstatus', 'Searching...');
    View (Z_SEARCH);			// Searching...
    srch = new Searches (true);		// Make sure we the right type
    SelSort (srch.s_type >= T_DET);	// Normalize sort direction
    SelView (-1);			// Widen or narrow "sort by";
    TruncOptions ('inpages', 0);	// Clean out previous page lists
    TruncOptions ('inpages2', 0);

    for (var i = 0; i < R_MAX; ++i) {	// Expand all rules at start
	expanded[i] = 1;
    }

    if (srch.s_type !== T_BAD) {	// Ignore toxic criteria
	Lookup ();
    }
}

// Select search criteria
// fn: 0=select only; 1=widen "sort by"; -1:widen or narrow "sort by"
function Criteria (fn) {
    ReTime ();				// Reset tool-tip timer
    srch = new Searches (false);	// Read current search criteria

    if (fn) {
	SelView (fn);			// Update sort criteria too
    }
}

// Select viewing criteria
// fn: 0=re-sort; 1=widen "sort by"; -1=widen or narrow "sort by"
// (By treating sort separately, this allows one to switch to Detailed Search
//  and immediately have access to a wider list of sort options, while also
//  allowing one to search, then switch back to Advanced Search, but still
//  allow the widened search properties to apply to the current results.
//  i.e. widening the options happens immediately, while narrowing them only
//  happens when a new search is initiated.)
function SelView (fn) {
    if (nosort) {			// Auto-sort suppressed by Column ()?
	return;
    }

    ReTime ();					// Reset tool-tip timer

    view = EvalValue ('inviews');		// View

    ShowC ('viewmax', 'colmax', tok['max'] = view === V_LIST);
    maxlist = Math.round (ParseLfloat (GetValue ('inmax')), NaN);	// Max results
    if (isNaN (maxlist) || maxlist < 2) {
	maxlist = MAXLIST;
    }

    var o = numfmt;				// Previous number format
    numfmt = EvalValue ('innums');		// Number format
    sortdir = EvalValue ('indirs');		// Direction

    if (fn && srch.s_type >= T_DET) {		// Widen sort
	ShowI ('insorts', false);
	ShowI ('insortu', true);
    } else if (fn < 0 && srch.s_type < T_DET) {	// Narrow sort
	ShowI ('insortu', false);
	ShowI ('insorts', true);
    }

    if (selectb && o !== numfmt) {		// Re-display numbers?
	Display (selectr, selectb, -1);
    }

    if (!fn && state >= Z_MANY) {		// Re-sort search results?
	Sort (true, 0);
    }
}

// Select sort criteria
// fn: (0=advanced list; 1=ultimate list) +2 if we should re-sort
function SelSort (fn) {
    nosort = true;
    if (fn & 1) {				// Change ultimate sort
	defsort = EvalValue ('insortu');
	var i = GetSel ('insortu');
	SetSel ('insorts', i < sortcols[S_BOX] ? i : sortcols[S_MINP]);
    } else {					// Change regular sort
	defsort = EvalValue ('insorts');
	SetSel ('insortu', GetSel ('insorts'));
    }
    nosort = false;

    if (fn & 2) {
	SelView (0);
    }
}

// Re-initialize user interface state
function ReInit () {
    nfound = 0;
    Deselect ();			// Deselect current selection, if any
    View (Z_RESET);			// Hide result-dependent fields
    SetText ('txtstatus', '');
    Criteria (-1);			// Reset user-defined search criteria
    SelSort (EvalValue ('intypes') >= T_DET);	// Reset user-defined sort direction
    SelView (-1);			// Reset user-defined viewing criteria
}

// Scroll to first page
function Home () {
    ReTime ();				// Reset tool-tip timer
    if (pageno > 0) {			// Display first page
	Sort (false, 0);
    }
}

// Scroll to last page
function End () {
    ReTime ();				// Reset tool-tip timer
    if (pageno < npages-1) {		// Display last page
	Sort (false, npages-1);
    }
}

// Scroll up one page
function PgUp () {
    ReTime ();				// Reset tool-tip timer
    if (pageno > 0) {			// Display previous page
	Sort (false, pageno-1);
    }
}

// Scroll down one page
function PgDn () {
    ReTime ();				// Reset tool-tip timer
    if (pageno < npages-1) {		// Display next page
	Sort (false, pageno+1);
    }
}

// User changed page number via selection box
function Pages (p) {
    Sort (false, GetSel ('inpages' + (p ? '2' : '')));
}

// User changed page number via text box
function Paget (p) {
    var i = Math.floor (ParseLfloat (GetValue ('inpaget' + (p ? '2' : '')), NaN));
    if (isNaN (i)) {
	i = 0;
    }
    Sort (false, i-1);
}

    

//------------------------------ Initialization functions ---------------------

// Globals used only during initialization
var bitPop = new Array (256);		// Populations of all bytes
var numitems = NUMITEMS;		// Total number of items to load
var numloaded = 0;			// Number of items loaded so far
var everexp = false;			// Expanded object list ever used?
var defhdr = null;			// Header being updated
var defobj = null;			// Object being updated
var defrule;				// Rule being defined
var defexp;				// Expanded object list?
var deffreq;				// Default frequency
var defvelx;				// Default x velocity numerator
var defvely;				// Default y velocity numerator
var defveld;				// Default velocity denominator
var defvol;				// Default volatility
var defsvol;				// Default strict volatility
var defpage;				// Default page number+1 (0 if none)
var defheat;				// Is default heat supplied?
var defleft;				// Number of images needed
var p1u;				// Index into unknown still-lifes
var p14;				// Index into 4-glider still-lifes
var p15;				// Index into 5-glider still-lifes
var p16;				// Index into 6-glider still-lifes
var pp15;				// Index into 5-glider pseudo-still-lifes
var pp16;				// Index into 6-glider pseudo-still-lifes

// Calculate population of a library pattern
// This will be zero for huge patterns (e.g. Gemini)
function CalcPop (str) {
    var p = 0;
    for (var i = 2; i < str.length; ) {
	p += bitPop[str.charCodeAt (i++)];
    }
    return p;
}

// Post-process most recently-entered object after its last sub-line is read.
function EndObj (p) {
    if (!p) {
	return;
    }

    p.p_boxw = Math.abs (p.p_boxw);		// Normalize small box values
    p.p_boxh = Math.abs (p.p_boxh);
    p.p_hullw = Math.abs (p.p_hullw);
    p.p_hullh = Math.abs (p.p_hullh);

    var h = rulelib[defrule];			// Rule being added to
    h = h[h.length - 1];			// Header being added to
    var r = typeof p.p_img === 'string' ? 1 : p.p_img.length;	// # of images

    if (h.h_cid >= O_WS && h.h_cid <= O_BR ||	// Expanding objects can't show all generations
      h.h_cid === O_METH || h.h_bad) {		// Methuselahs and bad objects are irregular
    } else if (r < defleft) {			// Missing S lines?! @@@
	toofew += (defleft-r) + ' missing S lines in ' + p.p_GetFile () + ': ' + p.p_GetNames () + '\n';
    } else if (r > defleft) {			// Spurious S lines?! @@@
	toomany += (r-defleft) + ' extra S lines in ' + p.p_GetFile () + ': ' + p.p_GetNames () + '\n';
    }

    r = Math.min (r, defleft);			// Only count main phases
    var a = OrderNum (p.p_avgp);		// Average population

    if (p.p_avgp < 0) {				// Normalize average population
	a = p.p_avgp /= -r;
    }
    if (a < p.p_minp) {				// Average < minimum ?! @@@
	badavg += p.p_GetFile ()+': ' + p.p_GetNames ()+': avgp='+a+' < minp='+p.p_minp+'; '+r+'\n';
    }

    if (!p.p_vol && p.p_per === 2 && !p.p_velx) {	// For period-2 oscillators, volatility is
	p.p_vol = p.p_svol = 2*p.p_heat / (p.p_heat+2*a);	// 2*heat/(heat+2*avgp)
	if (p.p_vol > 1) {			// Volatility > 1 ?! @@@
	    badvol += p.p_GetFile ()+': ' + p.p_GetNames ()+': vol='+p.p_vol+' > 1: heat='+p.p_heat+' avgp='+a+'\n';
	}
    }

    if (p.p_temp < 0) {				// Normalize temperature value
	p.p_temp = p.p_heat*r / -p.p_temp;	// Compute temperature
    }

    TrackU (p);					// Track unique values	// @@@@
    defobj = null;
}

// Begin a new library
// This should be followed by zero or more H lines
function N (index) {
    EndObj (defobj);
    defrule = index;
    p1u = p14 = p15 = p16 = pp15 = pp16 = 0;
    defexp = false;
}

// Begin expanded object lists
function Expanded () {
    everexp = defexp = true;
    numitems = NUMXITEMS;
    SetMax ('progload', numitems);
}

// Add a header line to the currently-selected library
// This should be followed by zero or more P, PP, V and/or A lines
// sec = section [- subsection]
// cat = category description string
function H (sec, cat) {
    EndObj (defobj);

    var gls = TBD;			// Default number of gliders
    var sub = '';			// Sub-section name
    var i = sec.indexOf ('-');

    if (i >= 0) {
	sub = sec.substring (i+1);
	sec = sec.substring (0, i);
    }

    if (cat.charAt (0) === '!') {	// !description => all synthesizable
	cat = cat.substring (1);
	gls = KNOWN;
    }

    var pseudo = sec.substring (0, 2) === 'pp';		// pseudo-object?
    var per = parseInt (sec.substring (pseudo+1));	// period
    var minp = per && parseInt (sub);			// population
    var r = rulelib[defrule];				// Rule being added to
    var cid = In (catlist, sec);			// Category index
    var bad = sub === 'bad';				// Bad object?

    if (sec === 'lg') {					// B34/S34: lg => osc
	cid = O_OSC;
    } else if (per === 1) {				// P1/PP1: still/pseudo-still
	cid = O_STILL + pseudo;
    } else if (per > 1) {				// Pn/PPn: osc/pseudo-osc
	cid = O_OSC + pseudo;
    }

    defvelx = defvely = defvol = defsvol = 0;
    defveld = 1;
    deffreq = NaN;
    defheat = false;
    defpage = -1;

    if (cid >= O_WS && cid <= O_BR) {	// Expanding patterns:
	defvol = 1;			// Always volatile
	if (cid >= O_GUN) {		// Guns and breeders are strictly volatile
	    defsvol = 1;
	}
    } else if (cid === O_METH || bad) {	// Methuselahs are unpredictable
	defvol = NaN;			// (and MUST have explicit overrides!)
    } else {				// 'normal' objects may have heat
	defheat = true;
	if (defrule === R_LIFE && per && !pseudo && sub !== 'bad') {
	    deffreq = 0;		// Frequency OK for Life still-lifes, oscillators
	}				// (but NOT pseudo-ones or bad ones!)
    }

    r[r.length] = defhdr =
      new Header (sec, sub, cat, cid, bad, defexp, gls, pseudo, per, minp, []);
}

// Add a page-group qualifier line to the currently-selected header
// This is done once to indicate that two-digit page-numbers are to be used
// This should be followed by zero or more P, A and/or V lines
function PP () {
    EndObj (defobj);
    defpage = 100;
}

// Add a page-break qualifier line to the currently-selected header
// This should be followed by zero or more A and/or V lines
function P () {
    EndObj (defobj);
    ++defpage;
}

// Add a velocity qualifier line to the currently-selected section
// This should be followed by zero or more A and/or P lines
function V (d, x, y) {
    EndObj (defobj);
    defveld = d
    defvelx = x;
    defvely = y;
    defvol = 1;				// spaceships are totally volatile
}

// Parse a number that may involve orders of magnitude
// i.e. x_y => x*t^y (i.e. x+2*OMEGA*y); x_ => x*t; ?_y => ?*t^y (i.e. (2*OMEGA*+1)y)
function ParseOrder (s) {
    var i = s.indexOf ('_');
    if (i < 0) {			// Normal real number
	return isNaN (s = ParseSfloat (s)) ? OMEGA+1 : s;
    }

    var o = parseInt (s.substring (i+1));
    s = i ? ParseSfloat (s.substring (0, i)) : 1;
    return (isNaN (s) ? OMEGA : s) + 2*OMEGA*(isNaN (o) ? 1 : o);
}

// Add an object to the currently-selected library
// This should be followed by zero or more S lines
// str = 6-bit encoding of: period, (optional heat*period), height, width, pattern
// (Heat*period is present if period!==1 or velocity!==0)
// Period, heat*period, height, and weight are zero if overriden below.
// Huge patterns like Caterpillar and Gemini have have illegal pattern ' \n'.
// file = zero or more semicolon-separated filenames w/no path or extension
// desc = zero or more semicolon-separated description (pattern name) strings
// gls = string of gliders and other optional annotations.
// All annotations are optional, and override default values.
// They must be in the following order:
//	  gliders		Integer or ?[+int] [-int] (default = TBD or Known)
//	" time to stabilize	Integer or _ (default = 0; nonzero for methuselahs)
//	# frequency		Rational or ? (default = 0 for still/osc, ? for others)
//	$ heat*period		Rational or _ or ? (default = 0)
//	% temperature		Rational ? (default = heat/population)
//	& strict volatility	Rational (default = volatility)
//	@ volatility		Rational (default = depends on category)
//	{ maximal box width	Integer or _ (default = maximum over widths)
//	} maximal box height	Integer or _ (default = maximum over heights)
//	[ minimal box width	Integer (default = minimum over widths)
//	] minimal box height	Integer (default = minimum over heights)
//	| symmetry		Integer (default = 0 (none))[3][4]
//	( width			Integer (default = taken from pattern string[1])
//	) height		Integer (default = taken from pattern string[1])
//	^ influence		Integer or x_y (must always be present)
//	= average population	Integer or x_y (default = accumulated from pattern string[2][6])
//	> maximum population	Integer or x_y (default = accumulated from pattern string[2][6])
//	< minimum population	Integer (default = calculated from pattern string[2])
//	: period		Integer or _ (default = taken from pattern string[1])
// (NOTE [1]: Only needed for patterns with measurements >223)
// (NOTE [2]: Only required for extremely huge patterns without image strings)
// (NOTE [3]: Symmetry is pattern symmetry + 10*glide symmetry + 100*flags.
//  flags = explicit + 2*odd_width + 4*odd_height + 8*dead
//  (and is computed by default if explicit flag is not given)).
// (NOTE [4]: This used to compute static pattern symmetry by calling Export to
//  convert to RLE, Rle2Bin to convert to binary, and Symm to obtain symmetries
//  While this produces correct results, it is very time-consuming, and makes
//  page loading prohibitively expensive on slow machines. As a result, the
//  symmetry value is now pre-computed and stored in the database)
// (NOTE [5]: Also supplied for infinitely-expanding patterns:
//   x_: linear: x/period*t; x_2: quadratic: x/period*t*t)
// (NOTE [6]: Only required for [2] or unstable patterns like methuselahs)
function A (str, file, desc, note) {
    EndObj (defobj);

    var r = rulelib[defrule];			// Rule being added to
    var hdr = r.length - 1;			// Index of header being added to
    var h = r[hdr];				// Header being added to
    var o = h.h_obj;				// Object list being added to
    var per = str.charCodeAt (0) - 0x20;	// Period
    var page = defpage;				// Page in multi-page list
    var gpage = -1;				// Page in huge glider pages
    var heat = h.h_bad && per > 1 ? NaN : 0;	// Heat
    var vol = h.h_bad && per > 1 ? NaN : defvol;	// Volatility
    var svol = h.h_bad && per > 1 ? NaN : defsvol;	// Strict volatility
    var freq = deffreq;				// Frequency
    var tts = 0;				// Time to stabilize
    var gls = 0;				// Gliders
    var files = file;				// Original file string
    var diff = -1;				// Difficult still-life?
    var inf = h.h_bad ? NaN : 0;		// Influence
    var symm = Y_N;				// Symmetry
    var i;

    if (defheat && (per !== 1 || defvelx)) {	// Extract total heat, if present
	heat = str.charCodeAt (1) - 0x20;
	str = str.substring (2);
    } else {
	str = str.substring (1);
    }

    var hgt = str.charCodeAt (0) - 0x20;	// Height
    var wid = str.charCodeAt (1) - 0x20;	// Width
    var boxw = -wid;				// Minimal bounding box width
    var boxh = -hgt;				// Minimal bounding box height
    var hullw = boxw;				// Maximal bounding box width
    var hullh = boxh;				// Maximal bounding box height
    var minp = defhdr.h_minp || CalcPop (str);	// Minimum population
    var maxp = minp;				// Maximum population (accumulated)
    var avgp = -minp;				// Average population (accumulated)
    var temp = h.h_bad && per > 1 ? NaN : avgp;	// Temperature (accumulated)

    for (i = note.length; --i >= 0; ) {		// Parse annotations right-to-left
	switch (note.charCodeAt (i)) {
	default:
	    continue;
	case 0x3A:				// :n => period
	    per = ParseSfloat (note.substring (i+1));	// can be _
	    break;
	case 0x3C:				// <n => minimum population
	    temp = avgp = - (maxp = minp = ParseSfloat (note.substring (i+1)));	// can be ?
	    break;
	case 0x3E:				// >n => maximum population
	    maxp = ParseOrder (note.substring (i+1));	// can be x_[y]
	    if (maxp >= OMEGA) {		// Infinite pop => infinite/2 avg
		avgp = OrderDiv (maxp, h.h_cid === O_BR ? 6 : 2);	// Triangular or tetrahedral numbers
	    }
	    break;
	case 0x3D:				// =n => average population
	    avgp = ParseOrder (note.substring (i+1));	// can be x_[y]
	    break;
	case 0x5E:				// ^n => influence
	    inf = ParseOrder (note.substring (i+1));	// can be x_[y]
	    break;
	case 0x29:				// )n => height
	    hullh = boxh = -(hgt = ParseSfloat (note.substring (i+1)));	// cna be ?
	    break;
	case 0x28:				// (n => width
	    hullw = boxw = -(wid = ParseSfloat (note.substring (i+1)));	// can be ?
	    break;
	case 0x7C:				// |n => symmetry
	    symm = parseInt (note.substring (i+1));
	    break;
	case 0x5D:				// ]n => minimal box height
	    hullh = boxh = parseInt (note.substring (i+1));
	    break;
	case 0x5B:				// [n => minimal box width
	    hullw = boxw = parseInt (note.substring (i+1));
	    break;
	case 0x7D:				// }n => maximal box height
	    hullh = ParseOrder (note.substring (i+1));	// can be x_[y]
	    break;
	case 0x7B:				// {n => maximal box width
	    hullw = ParseOrder (note.substring (i+1));	// can be x_[y]
	    break;
	case 0x40:				// @n => volatility
	    svol = vol = ParseSfloat (note.substring (i+1));	// can be n/d
	    break;
	case 0x26:				// &n => strict volatility
	    svol = ParseSfloat (note.substring (i+1));	// can be n/d
	    break;
	case 0x25:				// %n => temperature
	    temp = ParseSfloat (note.substring (i+1));	// can be n/d
	    break;
	case 0x24:				// $n => total heat
	    heat = ParseOrder (note.substring (i+1));	// can be x_[y]
	    break;
	case 0x23:				// #n => frequency
	    freq = parseInt (note.substring (i+1));
	    break;
	case 0x22:				// "n => time to stabilize
	    tts = ParseSfloat (note.substring (i+1));	// can be _ or ?
	    break;
	}
	note = note.substring (0, i);
    }

    if (str !== ' \n') {			// For non-huge patterns:
	if (str.charCodeAt (0) !== hgt+0x20 ||	// Insert actual width/height
	    str.charCodeAt (1) !== wid+0x20) {	// (Unicode supports up to 65503)
		str = String.fromCharCode (hgt+0x20) +
		      String.fromCharCode (wid+0x20) + str.substring (2);
	}
    }

    if (note === '') {				// Gliders unspecified
	gls = defhdr.h_gls;
    } else if (note.charAt (0) === '?') {	// Gliders unknown (+partial)
	gls = UNKNOWN;
	if (note.charAt (1) === '+') {
	    gls += parseInt (note.substring (2));
	}
    } else {					// Gliders known
	gls = parseInt (note);
    }

    if ((i = note.indexOf ('-')) >= 0) {	// x-y => range
	gls += parseInt (note.substring (i+1)) / PAIR;
    }

    if (h.h_cid === O_PSTILL) {
	if (gls === 5) {	// 5-glider pseudo-still-lifes have many stamps
	    gpage = pp15++;
	} else if (gls === 6) {	// 6-glider still-lifes have many stamps
	    gpage = pp16++;
	}			// Other glider pseudo-still-lifes have one stamp each
    } else if (h.h_cid === O_STILL) {
	if (gls === 5) {	// 4-glider still-lifes have many stamps
	    gpage = p14++;
	} else if (gls === 5) {	// 5-glider still-lifes have many stamps
	    gpage = p15++;
	} else if (gls === 6) {	// 6-glider still-lifes have many stamps
	    gpage = p16++;
	} else if (gls >= UNKNOWN) {	// Unknown still-lifes have many stamps
	    gpage = p1u++;
	}			// Other glider still-lifes have one stamp each
	if (minp >= 12 || minp <= 14) {	// 12-14-bit still-lifes must fake page number:
				// Still-lifes up to 14 bits use different ordering
	    page = Math.floor ((parseInt (files.substring (3)) - 1) / 100);
	}			// 4-11 fit on one page; 15+ use native ordering
    }

    if (symm % 200 < 100) {	// No explicit parity: calculate it here
	symm = (symm % 100) + 100 + 200*(wid&1) + 400*(hgt&1) + 800*(minp==0) +
	  Math.floor (symm / 1000) * 1000;
    }

    switch (symm % 10) {		// Normalize symmetry types
    case Y_V:				// Vertical reflection => horizontal
	symm += Y_O - Y_V;
	i = Math.floor (symm % 1000 / 200);	// Swap axis parities
	symm = (symm % 200) + 200 * (i ^ (i === 0 || i === 3 ? 0 : 3)) +
	  Math.floor (symm / 1000) * 1000;
	break;
    case Y_A:				// Diagonal / reflection => diagonal \
	symm += Y_D - Y_A;
	break;
    }

    switch (Math.floor (symm/10) % 10) {	// Normalize glide symmetry types
    case Y_V:				// Vertical reflection => horizontal
	symm += 10 * (Y_O - Y_V);
	if (symm % 10 === Y_N) {	// Swap axes if none defined yet
	    i = Math.floor (symm / 200);
	    symm = (symm % 200) + 200 * (i ^ (i === 0 || i === 3 ? 0 : 3));
	}
	break;
    case Y_A:				// Diagonal / reflection => diagonal \
	symm += 10 * (Y_D - Y_A);
	break;
    }

    i = Math.floor (symm/10) % 10;		// Glide symmetry => period/modulus
    var rmod = symm % 10;
    rmod = i === Y_N ? 1 : (i === Y_RR && rmod === Y_N ? 4 : 2);	// any/none=1; 180/90=4; other=2
    symm += 1000 * rmod;

    if (per < _ && heat < OMEGA) {		// Compute heat from total heat
	heat = OrderDiv (heat, per);		// But heat _, period _ => heat _
    }

    if (file === '') {				// No file: unknown!
	file = 'Unknown';
    }

    if (file.indexOf (';') >= 0) {		// Multiple filenames
	file = file.split (';');
    }

    if (desc === '') {				// No description: unknown!
	desc = 'Unknown';
    }

    if (desc.indexOf (';') >= 0) {		// Multiple descriptions
	desc = desc.split (';');
	if (h.h_cid === O_STILL && minp >= 16 && minp <= 18) {	// medium still-lifes
	    var j = desc[1];
	    if ((i = j.indexOf ('#')) > 0 && parseInt (j) === minp) {
		diff = parseInt (j.substring (i+1));
	    }
	}
    }

    o[o.length] = defobj = new Pattern (str, file, desc, minp, maxp, avgp, inf,
      heat, temp, vol, svol, symm, boxw, boxh, hullw, hullh, per, gls,
      freq, tts, defveld, defvelx, defvely, page+1 + (gpage+1)/PAIR, hdr);
    defleft = per / rmod;			// Number of images lines needed

    if (diff >= 0) {
	defobj.p_diff = diff;
    }

    if (! (++numloaded % Math.floor (numitems/100))) {		// Periodically update load status
	SetText ('viewnj', 'Loading data tables. ' +
	  Math.min (100, Math.round (numloaded*100/numitems)) + '% done.');
	SetValue ('progload', numloaded);
    }
}

// Add an object from a raw object list
// No information is available other than pattern index, image, and symmetry
function Y (index, str, note) {
    var desc;				// Synthesized pattern description

    if (defhdr.h_per === 1 && !defhdr.h_pseudo) {	// still-life
	desc = defhdr.h_minp + '.' + index;
    } else {
	desc = defhdr.h_pseudo ? 'pseudo-' : '';
	if (defhdr.h_per === 1) {
	    desc += 'still-life';
	} else {
	    desc += 'P' + defhdr.h_per;
	}
	desc = defhdr.h_minp + '-bit ' + desc + ' #' + index;
    }

    A (String.fromCharCode (defhdr.h_per+0x20) + str, '', desc, note);
}

// Add an object from a raw object list, without annotations
function F (index, str) {
    Y (index, str, '');
}

// Add a secondary image to the most recently added object
// str = 6-bit encoding of: height, width, (row of ceil (width/6) bytes)[height]
// height and weight are never overridden. Very few patterns exceed 223x223,
// and those only show the initial generation (if even that).
function S (str) {
    if (typeof defobj.p_img === 'string') {		// Turn first string into array
	defobj.p_img = [defobj.p_img];
    }

    defobj.p_img[defobj.p_img.length] = str;		// Add new image

    var pop = CalcPop (str);				// Population
    var hgt = str.charCodeAt (0) - 0x20;		// Height
    var wid = str.charCodeAt (1) - 0x20;		// Width
    var c = hgt+wid + defobj.p_boxh+defobj.p_boxw;	// Half circumference difference
    var a = hgt*wid - defobj.p_boxh*defobj.p_boxw;	// Half area difference

    if (defobj.p_boxw < 0 && defobj.p_boxh < 0 && (c < 0 || c === 0 && a < 0)) {
	defobj.p_boxw = -wid;				// Smallest bounding box
	defobj.p_boxh = -hgt;
    }

    if (defobj.p_img.length > defleft) {		// Only first <mod> lines count
	return;
    }

    if (pop < defobj.p_minp && !defhdr.h_bad) {		// Log patterns with bad low populations
	badpop += defobj.p_GetFile ()+': '+defobj.p_GetNames ()+' '+pop+' < '+defobj.p_minp + '\n';	// @@@
    }

    if (defobj.p_hullw < 0 && defobj.p_hullh < 0) {
	c = hgt+wid + defobj.p_hullh+defobj.p_hullw;
	a = hgt*wid - defobj.p_hullh*defobj.p_hullw;
	if (c > 0 || c === 0 && a  > 0) {
	    defobj.p_hullw = -wid;	// Find largest bounding box
	    defobj.p_hullh = -hgt;
	}
    }

    if (defobj.p_maxp < OMEGA) {	// Accumulate max population
	defobj.p_maxp = Math.max (defobj.p_maxp, pop);
    }

    if (defobj.p_avgp < 0) {		// Accumulate population for average
	defobj.p_avgp -= pop;
    }

    if (defobj.p_temp < 0) {		// Accumulate population for temperature
	defobj.p_temp -= pop;
    }
}

// Perform page initializations.
// This is done after page is fully loaded.
// This is called on reload even if browser preserves page contents.
function Body () {
//  if (this.hello !== undefined) { alert ('Body: ' + this.hello); }	// @@@
    var can = GetContext ('canimg', '2d') !== undefined;	// HTML5 canvas support?

    for (var i = 0; i < S_MAX; ++i) {	// Correspondence between selectors and sort types
	sortcols[eval (GetValue (GetOptions ('insortu')[i]))] = i;
    }

    ShowB ('canmax', can);		// No canvas: hide help references to it
    ShowB ('cansorts', can);
    ShowB ('tipcan', can);
    ShowC ('viewby', 'colby', tok['views'] = can);
    ShowC ('viewexp', 'colexp', tok['exp'] = everexp);	// Hide 'expanded search' if unavailable
    ShowB ('viewnj', false);		// Hide 'Loading...' warning
    ShowB ('viewj', true);		// Un-hide everything else
    ShowB ('vieweval', true);		// Hide evaluation console

    ReInit (0);				// Re-initialize user interface state

    SetText ('txtstatus', '' + numloaded + ' patterns loaded');
    if (numloaded != numitems) {	// Verify correct item count	// @@@
	alert ('' + numloaded + '/' + numitems + ' patterns loaded');
    }
}

// Perform script initializations.
// This must be done here, now, before subsequent scripts are loaded.
// This is not re-executed if browser reloads and preserves the page
function Init () {
    for (var i = 0; i < 0x100; ++i) {	// Characters 0-31 never used in library
	bitPop[i] = 0;			// Characters 96+ are runs of empty space
	if (i >= 0x20 && i < 0x60) {	// Characters 32-95 are masks of 6 bits
	    for (var j = i - 0x20; j; j >>= 1) {
		bitPop[i] += j & 1;
	    }
	}
    }

    SetMax ('progload', numitems);
    InitU ();								// @@@@
}

Init ();

// End lifesrch.js



// BROWSER-DEPENDENT BUGS: (re-examine after UI tightening):
// - Progress bar doesn't show up on IE or Firefox 3
// - Opera 9 sometimes doesn't show search status line
// - Opera 9 doesn't resize canvas
// - Opera 9 doesn't seem to draw stamp view at ALL!
//   - page dropdown shows "1 2 3 7" out of 9

// = If section begins with "gu", omit link to category (now irrelevant anyway)
//   -> But this may NOT be irrelevant with p1-18 (check into this!)

// - NOTE: velocity must be in lowest common denominator!

// The following rational edge conditions can occur: 0/0=1, n/0=_, n/_=0, _/_=1
// RatName: Explicitly rational values (int/int) can happen in the following cases:
// - ratp=p_minp/p_maxp:	AddRow,Display		can be 0/_=0
// - rvol=p_svol/p_vol:		AddRow,Display		can be 0/0=1
//   - NOTE: This SHOULD use order numbers, for puffers with mixed output!
// - sqb=p_boxh/p_boxw:		AddRow,Display		can be 0/0=1 or _/_=1
//   - _/_ can only occur with infinite methuselahs, in which case it is unknown
// - sqh=p_hullh/p_hullw:	AddRow,Display		can be 0/0=1 or _/_=1 or n/_=0
//   - _/_ can also occur with infinite methuselahs, in which case it is unknown
// - rgls=p_GetGls()/p_minp:	AddRow			can be 2/0=_

//   - When reading, log all rational numbers with denominators > 1 million
//     - When outputting, convert such numbers using table lookup
//     - Once, as a diagnostic pass, vet ALL input rationals; convert them to
//       real and rational again, and if values don't match, log them
//     - real-to-rational conversion should stop after 29 steps

// The number of transfinite values is extremely small;
// so small, in fact, that they could be obtained by table lookup.
// - (Perhaps negative integers could be used as indices?)
// Even hashing is not important (except _ and ? should be stored as-is):
// - All but 162 have p_freq=0 or ?
//   - But rarity SHOULD be <huge constant>/integer
// - The following 3 have p_heat=p_temp=NaN (need further research; maybe use KNOWN?):
//   - Life: Caterpillar,Gemini,Gemini knightship
// - The following 27 growing patterns have infinite p_maxp,p_hullw:
//   - Life: SwanWS,TireTracks,157WS,rtw8,djb24,lcsl,hcsl,rwg1,rwg2,
//     swbk,swgl,na,gun30,badgun1,badgun2; Niemiec1: P,gungl,gundg,breeder;
//   - B2/S2: 2lineWS,blinkerWS,emptyWS,gunWS,junkWS; B34/S34: M1,M2,M3;
// - Of the above, the following 8 have infinite p_hullw but finite p_hullh:
//   - Life: rtw8,djb24,rwg1; B2/S2: 2lineWS,blinkerWS,emptyWS,gunWS,junkWS;
// - Of the above, all have infinite p_heat except the following 7 still puffers/WS:
//   - SwanWS,TireTracks,157WS,djb24,swbk; B2/S2: 2lineWS,emptyWS
// - Of the above, the following 5 also have p_per=p_mod=p_temp=NaN:
//   - B2/S2: junk-stretcher: B34/S34: M1,M2,M3; Niemiec1: P
// - The following 7 have infinite p_maxp but finite p_avgp (BUG!)
//   - SwanWS,157WS,NA; B34/S34: M1,M2,M3; Niemiec1:breeder
// - The following 12 methuselahs should have infinite p_maxp (BUG!)
//   Life: R,B,Wing,H,acorn,MiP,GD,J,se,cm,bunnies,gm

// Per above: Establish a new data type: Number
// - Real r = [r]; NaN = [NaN]; _ = [0,1]; i<0 = numList[~i]
// - numList items are lists of 2 or more values; polynomials in w(omega)
// - User-entered numbers are ALWAYS merely real; negative ones aren't special
// - All interactions with user-entered numbers use NumToReal on Number first
//   - return x.length>1 ? _ : x[0];
// - Num-to-Num comparisons compare length, then higher-to-lower elements,
//   with NaN being higher than anything else (and NaN=NaN)
// - Num-to-Num additions/subtractions just add element by element
// - Num-to-Num multiplications: sum of polynomial products
// - Num-to-Num divisions: approximate: [x0,x1..xn]/[y0,y1..ym] = [x(n-m)/ym,...xn/ym]
// - Displaying number: n=length; x[n-1] + (n==0:""; n==1:"t"; n==2:"t^2"; n==3:"t^3" etc.)
// ### Can be infinite: per hullh hullw ~heat tts (see ParseSfloat)
// ### Can be x_y: maxp avgp inf heat

// TBD: rule-mn: add gunboth to build; put gungl,gundg,gunboth into stamp

// Each build:
// - Re-configure NUMITEMS and NUMXITEMS from numloaded, if they differ
// - Manually check: toofew, toomany, badavg, badvol, badpop, badtemp
//   - 4 TBD: toofew: 82cepc, 60p312-1, 64p312-1, 68p312-1;
//   - 3 Acceptable toofew: Caterpillar, Gemini, Gemini knight-ship;
//   - 4 Acceptable toomany: n14p140, 9lw, 11mw*2, 13hw*2;
//   - 1 Acceptable badavg: 8dh;

// TODO: Add search stamp-page annotations:
// - If all results are the same period, add period annotation in top right
//	DrawGls (ctx, ###x+4, v*stampm+4, 'P'+p.p_period, sel * F_SEL, F_NOTE);
//   - If sorting by period, add period annotation and draw dividing lines by period
// - If all results are the same population, add population annotation in botom left
//	DrawGls (ctx, x+4, ###v*stampm+4, ''+p.p_minp, sel * F_SEL, F_NOTE);
//   - If sorting by population, add population annotation and draw dividing lines by period
// - If any result is a methuselah, show max population at bottom left (left-justified)
//	DrawGls (ctx, ###x+4, ###v*stampm+4, ''+p.p_maxp, sel * F_SEL, F_NOTE);
// - If all results are the same nonzero velocity, add velocity annotation at bottom left
//	DrawGls (ctx, ###x+4, ###v*stampm+4, VelName (p, '^', '<', '>');, sel * F_SEL, F_NOTE);
//    - If sorting by velocity, add velocity annotation and draw dividing lines by velocity

// - BUG: SortList: TruncRow of URL-rich bottom header row fails
// - SEARCH: "oo ?$o ??" matches block, but should ONLY match snake

// DISPLAY BUGS:
// = D1: Large rationals (e.g. rarity) are "1.3e6" real, but "unknowne6" rational
// - E1: There should be a blank line between image and bottom dividing lines
// - D3: In all browsers except IE, 'tipimg' displays a zero-line-high tooltip(?!)
//   - This is the only one with a sub-category (e.g. 'tipcan')
// - E3: Tip: Category and Name are STILL way too tall

// Influence: (^ in database):
// - For methuselahs, OR of all generations
//   - If n gliders, then n*2w(e.g.); ?w for 34/MDN methuselahs
//   - TBD: Manually set for p20rwg2,12swbk,12swgl(^2),16na(^2),
//   - Manually set for ss/ws/gun/puff/br
//     - gun/*, rulen1/breeder: same as that of escaping spaceship(s)
//     - puff: ((width+2)*w/2 or (diag+2)*w/12[ssbk])
//       - if gliders escape, count those too: 2w+(diag+2)*w/12[ssgl]
//   - ?_ for Gemini, Caterpillar; computable (but ugly) for Geminoids
// - possibly also Density = Relative Influence: pop/influence
//   - 0 for constellations/methuselahs w/gliders
//   - 1/9<=n<1 for still-lifes; may be lower for oscillators
//   - For meth, OR of all generations
//   - cons/meth: 0 if any gliders
//   - ss: 0
//   - gun/breeder: as tile for one escaping ss
//   - puff/ws: as tile of one period, including puffer head
//     - if gliders escape, those may dominate too
// - TBD: DB: gun/puff/ws/br/meth{gl}=>transfinite {hulls}!

// - DISPLAY: Population says "4" but select+copy says "4 4 (difficult objects)" - copies hidden text
// - LIST: o?$?o! shows 4 result pages, but dropdown has only 1, and pages 2-4 are blank
// - LIST: Switching from list to stamp page doesn't show page navigation buttons

// - avg pop=? for most patterns (WHY NOT CALCULATE IT?!)
//   - but not for three switch engines; 1/360t for suicidal gun(?!)
//   - It only displays this way, but search for NaN fail (?!)
// - Caterpillar: inf=69819 den=maxden=/23273? avgden=?/t
// - Gemini: inf=0 den=maxden=1/0 avgden=?/t
// - TBD: O_BAD => inf=unknown (and don't show it)
// - Wick-stretchers have densities around 2 (MUST Be <1!)
// - 12swgl: avgpop=/294912t minden=/82077 avgden=/4.103e8t maxden=/2.051e8t

// - GGREP/A/SEARCH: Perhaps ? should compare as a huge but unknown integer? (Z<?<_)
//     - p_maxp (e.g. non-Life methuselahs); hence also (infinitesimal) p_rpop
//     - p_hull (e.g. non-Life methuselahs); hence also (possibly small) p_sqh
//     - p_freq (means N/A)
// - SEARCH: ? should match >=0, >0
// - SEARCH: Search with image wildcards goes into an infinite loop

// - LIST/DISPLAY: Frequency/rarity SHOULD be displayable as rational
// - LIST: Rational "1234/ 5" is shown with a spurous blank
// - LIST: Glider column must ALWAYS have color reset, even if it's white!
// - LIST: ?/t should be treated as ? (and printed as ?), NOT 0!
// - LIST: 'patterns with multiple files' loses B34/S34 and M1 between pages 1+2!
// - LIST: Jumping to LAST page keeps previous display but erases bottom headers

// - SORT: ### Q: Should CmpOrderAdd divide by period?!

// The following properties can have transfinite values (_ ? x_ ?_ etc.):
//   *=info is lacking, and pattern is too large to run
//   minp,box: gemiknight*
//   avgp: Replicator-p88965198.mc.gz*
//   maxp,avgp: gemiknight* p20rwg2 (NOT p20rwg1 and other puffers?!)
//	12swbk 12swgl 12na(NOT avgp?!) g30gl g30bad1? g30bad2?
//   tts,ef: t6m1 t10m2 t14m3 n4p (NOT x52wsjk?!)
//   inf: t6m1 t10m2 t14m3 n4p Gemini* Gemiknight* (NOT x52wsjk*, Caterpillar?!*)
//	(NOT all ss, ws, puff, gun, br, meth-w-gliders?!)
//   per: x56wsjk t6m1 t10m2 t14m3 n4p Replicator-p88965198.mc.gz*
//   heat+temp: x52wsjk t6m1 t10m2 t14m3 n4p Caterpillar* Gemini* Gemiknight*
//   heat(NOT temp?!): x19wsbl x56wsgg ng280gl ng280dg nbreeder
//	p8rtwbl p48cslsl p48cslsh p20rwg2 p20rwg1 g30gl g30bad1 g30bad2
//   temp(NOT heat?!): 14qbqb1 14qbqb2 229mp3c7 406pt3c7 Replicator-p88965198.mc.gz*
//   vol+svol: bad: 10glgl 14-10wss 66k6 229mp3c7 406pt3c7 g30bad1 g30bad2
//   vol(NOT svol?!): bad: 9scsl 11hvlt 13slbt 14bkxe 14sllta1 12slbk4 17shftbt 16slsl15
//      -> The above should ALSO have strict volatility = ?
//  hull: meth: t6m1 t10mw t14m3 n4p 5rp 5bh 6wg 6h 7ak 7mp 8gd 8j 8sw 8cm 9jd 9ra 10gm
//	ws: x12wsll x19wsbl x44wsgl x56wsgg x52wsjk 53swanws 77tire 157d4ws
//	puff: gemiknight p8rtwbl p24djbtb p48clsl p48cslh p20rwg2 p20rwg1
//	  12swbk 12swgl (NOT 16na?!)
//	gun: ng280dg (NOT ng280gl or nbreeder?!) p30gl p30bad1? p30bad2?

// The following properties don't have transfinite values, but should:
//   maxp,avgp: p20rwg1 and other puffers (avgp for 16na)
//   tts,ef: x52wsjk
//   inf: x52wsjk*, Caterpillar* (really ALL ss, ws, puff, gun, br, meth-w-gliders!)
//   temp: x19wsbl x56wsgg ng280gl ng280dg nbreeder
//	p8rtwbl p48cslsl p48cslsh p20rwg2 p20rwg1 g30gl g30bad1 g30bad2
//   heat: 14qbqb1 14qbqb2 229mp3c7 406pt3c7 Replicator-p88965198.mc.gz*
//   svol: bad: 9scsl 11hvlt 13slbt 14bkxe 14sllta1 12slbk4 17shftbt 16slsl15
//   hull: 16na ng280gl nbreeder

// DATABASE ISSUES:
// - DB: U contains NaN values for: p_temp p_freq p_rpop p_hull p_sqh
// - DB: svol of methuselahs that release gliders MUST ALWAYS BE ZERO!
//   -> 5rp 6bh 6h 6wg 7oo 7ak 7mp 8gd 8j 8cm 8sw 9ra 10gm; ? -> m1/m2/m3 n4p; 0 -> wsjk
// - DB: svol of ALL puff, br, ws should also be zero: x19wsbl x56wsgg
//   - This should also apply to still wick-stretchers...
// - DB: Find out stats about gemini knight-ship!
// - DB: Find out period of third geminoid!
// - DB/HTML: Add difficult p1-18s
// - DB: Schick ship box is 480t/960, NOT t/960!
// - DB: Gemini has minimum, average, maximum density _
// - DB: Finite avgp/maxp for: swanws, 157ws, na, breeder (should follow max!)
// - C3: DB: Guns have finite avgpop=maxpop; were unknownt; should be _
// - C3: DB: Puffers have finite avgpop=maxpop; were unknownt; should be _
//   - C4: DB: EXCEPT Noah's Ark had finite avgpop
// - C3: DB: Wick stretchers have finite avgpop=maxpop; were unknownt; should be _
//   - C4: DB: EXCEPT Junk stretcher had avgpop=maxpop=?t
// - C4: DB: Breeder has finite maxpop=min/max, was Unknown, avgpop=?undefined(should be _)
// - DB: DB/GGREP: Breeder image is shifted right for some reason
//   - This will require (re-?)developing the tool to turn RLE into compressed LIB
// - DB: ws/puff/gun/br must EXPLICITLY set >maxpop, {hull}
// - DB: Gemini has inf=05
// - DB: gun/puffer/ws/breeder/musher: transfinite heat,hull! multiply by period^order
// - DB: $0: should be specific: 53swanws,157d4ws
// - DB: $0; should be specific $_: 12swgl,16na, x12wsll,x44wsgl
// - DB: $_; should be more specific: p84twbl,p48clsl,p48clsh,p20rwg1,p20rwg2, g30gl
// - DB: $_; should be more specific: x19wsbl,x56wsgg,x52wsjk, t6m1,t10m2,t14m3, n4p
// - DB: $_: should be suppressed: g30bad1,g30bad2

// GGREP ISSUES:
// - GGREP: Can't automate 16na (Noah's Ark), so no strict volatility: needs 9GB RAM!
// - GGREP: manual inf for ss/ws/gun/puff/: ^dx*shadow_; br: more complicated
//   - once fixed, vet MinDen, AvgDen, MaxDen
// - GGREP: inf wrong for puff (rtw1=120600), gun(p30gun=13302), meth (all=279)

// FLOATING-POINT DISPLAY ISSUES:
// - FLOAT: Small non-scientific reals should ALSO scale (e.g. freq)
// - FLOAT: 12345678 shows as 12.345e7; should be 1.234e7

// BUG SUMMARY (for users):
// - Some properties with transfinite values are not set or displayed properly
// - Some properties for very large patterns are not known
// - Sometimes real or ratoinal number display incorrectly
// - Search for image with wildcards hangs
// - Search by specific frequencies and/or rarities does not work correctly

// FAILED TESTING:
// - Rational Gemini velocity is (2560, 512)c/ 21e16 / 13e15e7 ?!!
// - Rarity < 1000: matches all "N/A" objects
// - Rarity <= _ should match all; instead it matches none
// - RealName: unscaled numbers can be too large:
//   - Glider/bit: 7-bit real: 0.03289474: way too many digits!
// - Display,List: NEVER display freq/rar as rational!
// - LIST: Wildcard image search for oo3?$o4?$5?$5?! drops t4bk from top of page 2
// - GGREP: MaxPop for M1/M2/M3/P/wsjk should be unknown, not some finite number!
//   = DISPLAY: Influence: If unknown, no need to show average, max
// - NEVER automate bad objects under ANY CIRCUMSTANCES:
//   - set symmetry flags manually
//   - Heat for dualQueenBees, p6+p7 spaceships;
//   - Vol for SkewedPulsars, DualQueenBees; inf for all!
//   - GGREP: P replicator should have T symmetry! (Similarly M1=T,M2=H,M3=@)
//     - Ggrep emits one even though one is manually entered!
// - Bridged Beacons sets BOTH flip-flop AND on-off bits; should not be possible!
// - GGREP: 2/2-Life glider should be a phoenix!
// - GGREP/A: TwoQueenBees, C6/3C7 ships: box is X*0!
// - DB/GGREP: ws,gun should have avgp=(maxp=_)/2
//   - DB/GGREP: Geminoid replicators have finite maxp, zero avgp?! and calculated inf?!?!

// TESTING:
// = FLOAT: Floating-point numbers can show "123.4567"; should only show 7 chars
// = FLOAT: As above, for "0.00002t"
// = BUG: meth: should have p_maxp>_: R,B,Wing,H,acorn,MiP,GD,J,se,cm,bunnies,gm
// = BUG: ws/puff/br/meth: should have p_avgp>_: SwanWS,157WS,NA; B34/S34: M1,M2,M3; Niemiec1:breeder
// = BUG: puff: should have heat>_: swgl,NA
// = BUG: ws: should have heat<_: SwanWS,157WS B2/S2: 2linestretcher,emptytubstretcher

// = DB BUG: Caterpillar, Gemini have 0 population; should be ?
// = Display BUG: Gemini, Geminoids should never attempt to show an image
// = Export(): if m>LARGE, display empty pattern,
// = Display(): minp is transcendental
