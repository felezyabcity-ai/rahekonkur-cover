import React from 'react';

interface TeacherDoodlesProps {
  subject: 'physics' | 'math' | 'chemistry' | 'biology' | 'general' | 'none';
  color: string;
  opacity?: number;
}

export const TeacherDoodles: React.FC<TeacherDoodlesProps> = ({
  subject,
  color,
  opacity = 0.28,
}) => {
  if (subject === 'none') return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-[1]"
      style={{ opacity }}
    >
      {subject === 'physics' && (
        <>
          {/* E = mc^2 formula (Top Right background) */}
          <div
            className="absolute top-12 right-[36%] font-serif font-black tracking-wider text-4xl select-none"
            style={{
              color,
              transform: 'rotate(-8deg)',
              letterSpacing: '2px',
            }}
          >
            <span>E = mc</span>
            <sup className="text-2xl font-bold">2</sup>
          </div>

          {/* Horseshoe Magnet with magnetic field lines (Top Right near teacher) */}
          <svg
            className="absolute top-20 right-[18%] w-32 h-32"
            viewBox="0 0 100 100"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: 'rotate(25deg)' }}
          >
            {/* U Magnet */}
            <path d="M 28 20 L 28 55 C 28 72 72 72 72 55 L 72 20" />
            <path d="M 40 20 L 40 54 C 40 63 60 63 60 54 L 60 20" />
            {/* Poles */}
            <line x1="28" y1="20" x2="40" y2="20" />
            <line x1="60" y1="20" x2="72" y2="20" />
            <line x1="28" y1="32" x2="40" y2="32" />
            <line x1="60" y1="32" x2="72" y2="32" />
            <text x="31" y="29" fill={color} stroke="none" fontSize="8" fontWeight="bold">N</text>
            <text x="63" y="29" fill={color} stroke="none" fontSize="8" fontWeight="bold">S</text>
            {/* Sparks / field lines */}
            <path d="M 44 24 Q 50 16 56 24" strokeDasharray="2 2" strokeWidth="2" />
            <path d="M 42 16 Q 50 6 58 16" strokeDasharray="2 2" strokeWidth="2" />
          </svg>

          {/* Incline Plane with friction & theta (Middle Right) */}
          <svg
            className="absolute top-52 right-[8%] w-40 h-36"
            viewBox="0 0 140 120"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: 'rotate(-5deg)' }}
          >
            {/* Triangle Wedge */}
            <polygon points="10,105 130,105 130,35" strokeWidth="3.5" />
            {/* Angle Theta */}
            <path d="M 30,105 A 20,20 0 0,0 26,92" strokeWidth="2" />
            <text x="34" y="99" fill={color} stroke="none" fontSize="13" fontStyle="italic">θ</text>
            {/* Sliding Block */}
            <g transform="translate(62, 58) rotate(-30)">
              <rect x="0" y="0" width="30" height="20" strokeWidth="3" fill="none" rx="2" />
              {/* Force vector arrow */}
              <line x1="15" y1="0" x2="15" y2="-18" strokeWidth="2.5" />
              <polyline points="12,-14 15,-18 18,-14" strokeWidth="2.5" />
              <text x="20" y="-10" fill={color} stroke="none" fontSize="10" fontStyle="italic">N</text>
            </g>
          </svg>

          {/* Atom Model with orbiting electrons (Bottom Left) */}
          <svg
            className="absolute bottom-16 left-10 w-36 h-36"
            viewBox="0 0 120 120"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            {/* Nucleus */}
            <circle cx="60" cy="60" r="7" fill={color} />
            {/* Orbit 1 */}
            <ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(0 60 60)" />
            <circle cx="106" cy="60" r="3.5" fill={color} />
            {/* Orbit 2 */}
            <ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(60 60 60)" />
            <circle cx="37" cy="20" r="3.5" fill={color} />
            {/* Orbit 3 */}
            <ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(120 60 60)" />
            <circle cx="83" cy="20" r="3.5" fill={color} />
          </svg>

          {/* Vector Force formula F = ma (Top Left) */}
          <div
            className="absolute top-10 left-[28%] font-serif font-black text-2xl"
            style={{ color, opacity: 0.8 }}
          >
            <span>F = m·a</span>
          </div>
        </>
      )}

      {subject === 'math' && (
        <>
          {/* Integral formula */}
          <div
            className="absolute top-16 right-[24%] font-serif font-bold text-5xl"
            style={{ color, transform: 'rotate(-5deg)' }}
          >
            <span>∫ f(x) dx</span>
          </div>

          {/* Summation & Pi */}
          <div
            className="absolute top-28 right-[10%] font-serif text-4xl font-black"
            style={{ color }}
          >
            <span>∑ n = π</span>
          </div>

          {/* Coordinate system & Sin Wave */}
          <svg
            className="absolute bottom-14 left-14 w-44 h-36"
            viewBox="0 0 160 120"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="10" y1="60" x2="150" y2="60" strokeWidth="2.5" />
            <polyline points="144,56 150,60 144,64" />
            <line x1="80" y1="10" x2="80" y2="110" strokeWidth="2.5" />
            <polyline points="76,16 80,10 84,16" />
            <path
              d="M 15 60 Q 45 15, 80 60 T 145 60"
              strokeWidth="3.5"
              fill="none"
            />
            <text x="145" y="52" fill={color} stroke="none" fontSize="12" fontStyle="italic">x</text>
            <text x="86" y="20" fill={color} stroke="none" fontSize="12" fontStyle="italic">y</text>
          </svg>

          {/* Square root formula */}
          <div
            className="absolute bottom-24 right-[38%] font-serif text-3xl font-black"
            style={{ color }}
          >
            <span>√(a² + b²)</span>
          </div>
        </>
      )}

      {subject === 'chemistry' && (
        <>
          {/* Benzene Ring */}
          <svg
            className="absolute top-14 right-[22%] w-32 h-32"
            viewBox="0 0 100 100"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          >
            <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" strokeWidth="3.5" />
            <circle cx="50" cy="55" r="24" strokeDasharray="4 4" strokeWidth="2.5" />
          </svg>

          {/* Flask with bubbles */}
          <svg
            className="absolute bottom-16 left-14 w-32 h-36"
            viewBox="0 0 100 120"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M 42 15 L 58 15 M 46 15 L 46 45 L 20 95 C 16 102 22 108 30 108 L 70 108 C 78 108 84 102 80 95 L 54 45 L 54 15" />
            <path d="M 28 85 Q 50 80 72 85" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="45" cy="94" r="3" fill={color} />
            <circle cx="56" cy="90" r="4" fill={color} />
            <circle cx="50" cy="75" r="2.5" fill={color} />
          </svg>

          {/* Chemical Formula H2O */}
          <div
            className="absolute top-24 right-[10%] font-mono font-black text-3xl"
            style={{ color }}
          >
            <span>H<sub className="text-xl">2</sub>O</span>
          </div>
        </>
      )}

      {subject === 'biology' && (
        <>
          {/* DNA Double Helix */}
          <svg
            className="absolute top-16 right-[18%] w-36 h-48"
            viewBox="0 0 80 140"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M 20 10 Q 50 40 20 70 Q 50 100 20 130" strokeWidth="3" />
            <path d="M 60 10 Q 30 40 60 70 Q 30 100 60 130" strokeWidth="3" />
            <line x1="28" y1="20" x2="52" y2="20" />
            <line x1="38" y1="40" x2="42" y2="40" />
            <line x1="28" y1="60" x2="52" y2="60" />
            <line x1="28" y1="80" x2="52" y2="80" />
            <line x1="38" y1="100" x2="42" y2="100" />
            <line x1="28" y1="120" x2="52" y2="120" />
          </svg>

          {/* Cell & Microscope */}
          <svg
            className="absolute bottom-16 left-12 w-32 h-32"
            viewBox="0 0 100 100"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          >
            <circle cx="50" cy="50" r="38" strokeWidth="3" strokeDasharray="1 1" />
            <circle cx="50" cy="50" r="14" fill={color} opacity="0.3" stroke={color} strokeWidth="2.5" />
            <circle cx="68" cy="40" r="4" fill={color} />
            <circle cx="35" cy="65" r="5" fill={color} />
          </svg>
        </>
      )}

      {subject === 'general' && (
        <>
          {/* Graduation Cap */}
          <svg
            className="absolute top-16 right-[20%] w-36 h-36"
            viewBox="0 0 100 100"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="50,20 90,40 50,60 10,40" strokeWidth="3.5" />
            <path d="M 28 50 L 28 72 C 28 82 72 82 72 72 L 72 50" />
            <path d="M 85 45 L 85 75 C 85 80 82 85 82 85" strokeWidth="2.5" />
          </svg>

          {/* Trophy & Stars */}
          <svg
            className="absolute bottom-16 left-12 w-32 h-32"
            viewBox="0 0 100 100"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M 30 25 L 70 25 L 65 60 C 65 70 55 75 50 75 C 45 75 35 70 35 60 Z" strokeWidth="3" />
            <path d="M 30 32 C 18 32 18 50 32 50" strokeWidth="2.5" />
            <path d="M 70 32 C 82 32 82 50 68 50" strokeWidth="2.5" />
            <line x1="50" y1="75" x2="50" y2="88" strokeWidth="3.5" />
            <line x1="35" y1="88" x2="65" y2="88" strokeWidth="4" />
          </svg>
        </>
      )}
    </div>
  );
};
