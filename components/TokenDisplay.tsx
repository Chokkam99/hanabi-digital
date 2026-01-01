interface TokenDisplayProps {
  hintTokens: number;
  strikeTokens: number;
}

export default function TokenDisplay({ hintTokens, strikeTokens }: TokenDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Hint Tokens */}
      <div className="flex items-center gap-1">
        <span className="text-blue-300 text-lg">💡</span>
        <span className="text-white font-bold text-sm">×{hintTokens}</span>
      </div>

      {/* Strike Tokens */}
      <div className="flex items-center gap-1">
        <span className="text-red-400 text-lg">❌</span>
        <span className="text-white font-bold text-sm">×{strikeTokens}</span>
      </div>
    </div>
  );
}
