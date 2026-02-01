import type { Recommendation } from "../types";

interface RecommendationsProps {
  data: Recommendation[] | null;
}

export default function Recommendations({
  data,
}: RecommendationsProps): JSX.Element | null {
  if (!data || data.length === 0) return null;

  return (
    <div className="card">
      <h2 className="card-title">Recommendations</h2>
      <ul className="reco-list">
        {data.map((item) => (
          <li key={item.id}>
            <span className="reco-title">Recommendation {item.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
