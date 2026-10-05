import { winningLine } from '@/lib/winLine';

function XMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden="true">
      <g stroke="#1B2A6B" strokeWidth="9" strokeLinecap="round" fill="none">
        <path className="mark-stroke" style={{ '--len': 74 } as React.CSSProperties} d="M24 24 L76 76" />
        <path
          className="mark-stroke"
          style={{ '--len': 74, animationDelay: '0.12s' } as React.CSSProperties}
          d="M76 24 L24 76"
        />
      </g>
    </svg>
  );
}

function OMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden="true">
      <circle
        className="mark-stroke"
        style={{ '--len': 176 } as React.CSSProperties}
        cx="50"
        cy="50"
        r="28"
        stroke="#D9363E"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
}

type Props = {
  board: string[];
  onPlay: (cell: number) => void;
  disabled?: boolean;
};

export default function Board({ board, onPlay, disabled }: Props) {
  const line = winningLine(board);

  return (
    <div className="grid aspect-square w-full max-w-[420px] grid-cols-3 grid-rows-3 rounded-lg bg-white/80 p-3 ring-1 ring-grid">
      {board.map((cell, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const label = cell === 'X' ? 'you' : cell === 'O' ? 'bot' : 'empty';
        const canPlay = cell === '-' && !disabled;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onPlay(i)}
            disabled={!canPlay}
            aria-label={`Row ${row + 1}, column ${col + 1}: ${label}`}
            className={[
              'flex min-h-0 min-w-0 items-center justify-center border-ink transition-colors',
              col < 2 ? 'border-r-4' : '',
              row < 2 ? 'border-b-4' : '',
              line?.includes(i) ? 'bg-ink/10' : '',
              canPlay ? 'cursor-pointer hover:bg-ink/5' : 'cursor-default',
              'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-pencil',
            ].join(' ')}
          >
            {cell === 'X' && <XMark />}
            {cell === 'O' && <OMark />}
          </button>
        );
      })}
    </div>
  );
}
