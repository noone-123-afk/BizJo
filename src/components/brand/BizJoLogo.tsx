import React from 'react';

interface BizJoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function BizJoLogo({
  size = 'md',
  showTagline = true,
}: BizJoLogoProps) {
  const iconDimensions =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      {/* Custom SVG Emblem for BizJo: Geometric Shield + Rising Financial Bars + Jordanian 7-Point Star Accent */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-0.5 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0`}
      >
        <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5"
            role="img"
            aria-label="شعار منصة BizJo للأعمال والمحاسبة والفوترة الإلكترونية والامتثال الضريبي في الأردن"
          >
            <title>شعار منصة BizJo للأعمال والمحاسبة والامتثال الضريبي الأردنية</title>
            {/* Outer Shield / Ledger Frame */}
            <path
              d="M8 10C8 7.79086 9.79086 6 12 6H28C30.2091 6 32 7.79086 32 10V22C32 28.6274 26.6274 34 20 35.5C13.3726 34 8 28.6274 8 22V10Z"
              stroke="url(#bizjo_grad)"
              strokeWidth="2.5"
              fill="rgba(16, 185, 129, 0.12)"
            />
            {/* Rising ERP Accounting Bars */}
            <rect x="13" y="21" width="3.2" height="7" rx="1" fill="#34D399" />
            <rect x="18.4" y="16.5" width="3.2" height="11.5" rx="1" fill="#10B981" />
            <rect x="23.8" y="12" width="3.2" height="16" rx="1" fill="#A7F3D0" />
            {/* Jordanian Star / Crown Accent Dot */}
            <circle cx="14.6" cy="13.5" r="2" fill="#F59E0B" />
            <defs>
              <linearGradient
                id="bizjo_grad"
                x1="8"
                y1="6"
                x2="32"
                y2="35.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Wordmark & Subtitle */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5" dir="ltr">
          <span
            className={`${textSize} font-black tracking-tight text-slate-900 dark:text-white font-mono`}
          >
            Biz<span className="text-emerald-600 dark:text-emerald-400">Jo</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            ERP
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            منصة الأعمال والمحاسبة والضرائب
          </span>
        )}
      </div>
    </div>
  );
}
